// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { API_ERROR_CODES, SECURITY_LIMITS } from '@/domain/goalkeeper';
import {
  deleteGoalkeeperById,
  listGoalkeepers,
  registerGoalkeeper,
  resolveGoalkeepersDataPath,
  updateGoalkeeperVerification,
} from '@/server/repositories/goalkeeperRepository';
import {
  createBooking,
  deleteBookingById,
  listBookings,
  resolveBookingsDataPath,
} from '@/server/repositories/bookingRepository';
import { resolveDatabaseUrl } from '@/server/db/postgresClient';
import {
  createAdminSessionToken,
  verifyAdminPassword,
  verifyAdminSessionToken,
} from '@/server/security/adminAuth';
import {
  checkRateLimit,
  isPayloadWithinLimit,
  resetRateLimiterForTests,
} from '@/server/security/rateLimiter';

describe('adminAuth & rateLimiter security suite', () => {
  beforeEach(() => {
    resetRateLimiterForTests();
  });

  it('verifies administrator password in constant time and rejects invalid passwords', () => {
    expect(verifyAdminPassword('FileBekcisi2026!')).toBe(true);
    expect(verifyAdminPassword('wrong-password')).toBe(false);
    expect(verifyAdminPassword('')).toBe(false);
  });

  it('issues and validates HMAC-SHA256 session tokens and rejects expired or tampered tokens', () => {
    const now = 1_700_000_000_000;
    const token = createAdminSessionToken(now);

    expect(verifyAdminSessionToken(token, now + 1000)).toBe(true);
    expect(
      verifyAdminSessionToken(token, now + SECURITY_LIMITS.SESSION_TTL_SECONDS * 1000 + 1),
    ).toBe(false);
    expect(verifyAdminSessionToken(`${token}tampered`, now + 1000)).toBe(false);
    expect(verifyAdminSessionToken(undefined, now)).toBe(false);
  });

  it('enforces sliding-window rate limits per client key and payload byte ceilings', () => {
    const now = 1_700_000_000_000;
    const key = 'test-client:127.0.0.1';

    for (let i = 0; i < SECURITY_LIMITS.MAX_REQUESTS_PER_WINDOW; i += 1) {
      expect(checkRateLimit(key, now + i)).toBe(true);
    }
    expect(checkRateLimit(key, now + 500)).toBe(false);
    expect(checkRateLimit(key, now + SECURITY_LIMITS.RATE_LIMIT_WINDOW_MS + 1000)).toBe(true);

    const smallReq = new Request('http://localhost/api/goalkeepers', {
      headers: { 'content-length': '512' },
    });
    const oversizedReq = new Request('http://localhost/api/goalkeepers', {
      headers: { 'content-length': String(SECURITY_LIMITS.MAX_PAYLOAD_BYTES + 100) },
    });

    expect(isPayloadWithinLimit(smallReq)).toBe(true);
    expect(isPayloadWithinLimit(oversizedReq)).toBe(false);
  });

  it('routes JSON fallback paths to os.tmpdir() in serverless environments and detects postgres URLs', () => {
    const previousVercel = process.env.VERCEL;
    const previousCustomUrl = process.env.CUSTOM_NEON_URL;
    try {
      process.env.VERCEL = '1';
      expect(resolveGoalkeepersDataPath().startsWith(os.tmpdir())).toBe(true);
      expect(resolveBookingsDataPath().startsWith(os.tmpdir())).toBe(true);

      process.env.CUSTOM_NEON_URL = 'postgresql://user:pass@ep-cool.us-east-1.aws.neon.tech/neondb';
      expect(resolveDatabaseUrl()).toBe(
        'postgresql://user:pass@ep-cool.us-east-1.aws.neon.tech/neondb',
      );
    } finally {
      if (previousVercel === undefined) {
        delete process.env.VERCEL;
      } else {
        process.env.VERCEL = previousVercel;
      }
      if (previousCustomUrl === undefined) {
        delete process.env.CUSTOM_NEON_URL;
      } else {
        process.env.CUSTOM_NEON_URL = previousCustomUrl;
      }
    }
  });
});

describe('admin goalkeeper moderation repository operations', () => {
  let tempDir = '';
  let tempFile = '';

  beforeEach(async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), 'filebekcisi-admin-test-'));
    tempFile = path.join(tempDir, 'goalkeepers.json');
  });

  afterEach(async () => {
    if (tempDir.length > 0) {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('toggles goalkeeper verification status and removes records by id', async () => {
    const created = await registerGoalkeeper(
      {
        fullName: 'Kerem Kaya',
        district: 'istanbul_kadikoy',
        age: 26,
        heightCm: 187,
        experienceLevel: 'veteran',
        dominantHand: 'right',
        matchFeeTry: 550,
        phone: '+90 532 111 22 33',
        availableDays: ['friday'],
        bio: 'Consistent shot-stopper with five years of organized league play.',
      },
      tempFile,
    );

    expect(created.ok).toBe(true);
    if (!created.ok) {
      return;
    }

    const verifiedResult = await updateGoalkeeperVerification(created.data.id, true, tempFile);
    expect(verifiedResult.ok).toBe(true);
    if (verifiedResult.ok) {
      expect(verifiedResult.data.isVerified).toBe(true);
    }

    const missingVerify = await updateGoalkeeperVerification('non-existent', true, tempFile);
    expect(missingVerify).toEqual({ ok: false, error: API_ERROR_CODES.NOT_FOUND });

    const bookingsFile = path.join(tempDir, 'bookings.json');
    const bookingCreated = await createBooking(
      {
        goalkeeperId: created.data.id,
        organizerName: 'Burak Yilmaz',
        organizerPhone: '+90 532 444 55 66',
        venueName: 'Moda Arena',
        matchDate: 'friday',
        matchTime: '21:00 - 22:00',
      },
      bookingsFile,
      tempFile,
    );
    expect(bookingCreated.ok).toBe(true);
    if (bookingCreated.ok) {
      expect(bookingCreated.data.listedFeeTry).toBe(550);
      expect(bookingCreated.data.goalkeeperNetPayoutTry).toBe(467);
      expect(bookingCreated.data.customerCommissionTry).toBe(83);
      expect(bookingCreated.data.totalPayableTry).toBe(633);
      expect(bookingCreated.data.platformTotalRevenueTry).toBe(166);

      const deletedBooking = await deleteBookingById(bookingCreated.data.id, bookingsFile);
      expect(deletedBooking).toEqual({ ok: true, data: bookingCreated.data.id });
    }

    const emptyBookings = await listBookings(bookingsFile);
    expect(emptyBookings).toEqual({ ok: true, data: [] });

    const deletedResult = await deleteGoalkeeperById(created.data.id, tempFile);
    expect(deletedResult).toEqual({ ok: true, data: created.data.id });

    const remaining = await listGoalkeepers(tempFile);
    expect(remaining).toEqual({ ok: true, data: [] });
  });
});
