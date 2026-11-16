// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  ADMIN_SESSION_COOKIE_NAME,
  API_ERROR_CODES,
  validateCreateBookingInput,
  type BookingRecord,
  type GoalkeeperApiResponse,
} from '@/domain/goalkeeper';
import { createBooking, listBookings } from '@/server/repositories/bookingRepository';
import { verifyAdminSessionToken } from '@/server/security/adminAuth';
import {
  checkRateLimit,
  extractClientIp,
  isPayloadWithinLimit,
} from '@/server/security/rateLimiter';

/**
 * Handles `GET /api/bookings` requests for administrators to inspect all match bookings.
 * Requires a valid HMAC-signed administrator session cookie.
 *
 * @returns `NextResponse` containing `BookingRecord[]` or HTTP 401/500 error envelope.
 */
export async function GET(): Promise<NextResponse<GoalkeeperApiResponse<BookingRecord[]>>> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  if (!verifyAdminSessionToken(token)) {
    return NextResponse.json(
      { ok: false, errorCode: API_ERROR_CODES.UNAUTHORIZED },
      { status: 401 },
    );
  }

  const result = await listBookings();
  if (!result.ok) {
    return NextResponse.json({ ok: false, errorCode: result.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data: result.data }, { status: 200 });
}

/**
 * Handles `POST /api/bookings` requests when a customer purchases/books a goalkeeper for a match.
 *
 * Enforces payload byte limits, sliding-window rate limits, and Zod input validation before
 * computing the dual-sided 15% commission breakdown and persisting the booking record.
 *
 * @param request - Incoming HTTP `Request` containing `CreateBookingInput` JSON.
 * @returns `NextResponse` containing the created `BookingRecord` (HTTP 201) or structured error.
 */
export async function POST(
  request: Request,
): Promise<NextResponse<GoalkeeperApiResponse<BookingRecord>>> {
  if (!isPayloadWithinLimit(request)) {
    return NextResponse.json(
      { ok: false, errorCode: API_ERROR_CODES.PAYLOAD_TOO_LARGE },
      { status: 413 },
    );
  }

  const clientKey = `create-booking:${extractClientIp(request)}`;
  if (!checkRateLimit(clientKey)) {
    return NextResponse.json(
      { ok: false, errorCode: API_ERROR_CODES.RATE_LIMITED },
      { status: 429 },
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, errorCode: API_ERROR_CODES.INVALID_JSON },
      { status: 400 },
    );
  }

  const validation = validateCreateBookingInput(rawBody);
  if (!validation.ok) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: API_ERROR_CODES.VALIDATION_FAILED,
        fieldErrors: validation.error,
      },
      { status: 400 },
    );
  }

  const savedResult = await createBooking(validation.data);
  if (!savedResult.ok) {
    const status = savedResult.error === API_ERROR_CODES.NOT_FOUND ? 404 : 500;
    return NextResponse.json({ ok: false, errorCode: savedResult.error }, { status });
  }

  return NextResponse.json({ ok: true, data: savedResult.data }, { status: 201 });
}
