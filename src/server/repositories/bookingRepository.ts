// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  API_ERROR_CODES,
  bookingListSchema,
  calculateMatchFeeBreakdown,
  type ApiErrorCode,
  type BookingRecord,
  type CreateBookingInput,
  type Result,
} from '@/domain/goalkeeper';
import { ensurePostgresSchema, getSqlClient, parseBookingRows } from '@/server/db/postgresClient';
import { listGoalkeepers } from './goalkeeperRepository';

/**
 * Resolves the target JSON storage file path for bookings when operating in local JSON fallback mode.
 *
 * @param customFilePath - Optional explicit file path override for sandboxed test execution.
 * @returns Absolute filesystem path to `bookings.json`.
 */
export function resolveBookingsDataPath(customFilePath?: string): string {
  if (customFilePath !== undefined && customFilePath.length > 0) {
    return path.resolve(customFilePath);
  }
  const envPath = process.env.BOOKINGS_DATA_PATH;
  if (envPath !== undefined && envPath.length > 0) {
    return path.resolve(envPath);
  }
  return path.join(process.cwd(), 'data', 'bookings.json');
}

/**
 * Atomically writes the full booking collection to local JSON storage.
 */
async function writeBookingsAtomically(
  bookings: readonly BookingRecord[],
  filePath: string,
): Promise<Result<void, ApiErrorCode>> {
  try {
    await mkdir(path.dirname(filePath), { recursive: true });
    const tempPath = `${filePath}.${randomUUID()}.tmp`;
    await writeFile(tempPath, `${JSON.stringify(bookings, null, 2)}\n`, 'utf-8');
    await rename(tempPath, filePath);
    return { ok: true, data: undefined };
  } catch {
    return { ok: false, error: API_ERROR_CODES.STORAGE_WRITE_FAILED };
  }
}

/**
 * Reads and schema-validates persisted match booking records from PostgreSQL or local JSON storage.
 *
 * @param customFilePath - Optional file path override for test isolation.
 * @returns `Result` wrapping `BookingRecord[]` or `STORAGE_READ_FAILED`.
 */
export async function listBookings(
  customFilePath?: string,
): Promise<Result<BookingRecord[], ApiErrorCode>> {
  const sql = customFilePath === undefined ? getSqlClient() : null;
  if (sql !== null) {
    try {
      await ensurePostgresSchema(sql);
      const rows = await sql`SELECT payload FROM bookings ORDER BY created_at DESC`;
      return { ok: true, data: parseBookingRows(rows) };
    } catch {
      return { ok: false, error: API_ERROR_CODES.STORAGE_READ_FAILED };
    }
  }

  const filePath = resolveBookingsDataPath(customFilePath);
  try {
    const rawContent = await readFile(filePath, 'utf-8');
    const validated = bookingListSchema.safeParse(JSON.parse(rawContent));
    if (!validated.success) {
      return { ok: false, error: API_ERROR_CODES.STORAGE_READ_FAILED };
    }
    return { ok: true, data: validated.data };
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return { ok: true, data: [] };
    }
    return { ok: false, error: API_ERROR_CODES.STORAGE_READ_FAILED };
  }
}

/**
 * Creates a persisted `BookingRecord` computing dual-sided 15% commission figures (`-15%` from
 * goalkeeper payout and `+15%` on customer checkout) and returns the confirmed record.
 *
 * @param input - Validated customer booking request attributes.
 * @param customBookingsPath - Optional bookings JSON path override for isolated tests.
 * @param customKeepersPath - Optional goalkeepers JSON path override for isolated tests.
 * @returns `Result` resolving to the created `BookingRecord` or an `ApiErrorCode`.
 */
export async function createBooking(
  input: CreateBookingInput,
  customBookingsPath?: string,
  customKeepersPath?: string,
): Promise<Result<BookingRecord, ApiErrorCode>> {
  const keepersResult = await listGoalkeepers(customKeepersPath);
  if (!keepersResult.ok) {
    return keepersResult;
  }

  const targetKeeper = keepersResult.data.find((item) => item.id === input.goalkeeperId);
  if (targetKeeper === undefined) {
    return { ok: false, error: API_ERROR_CODES.NOT_FOUND };
  }

  const fee = calculateMatchFeeBreakdown(targetKeeper.matchFeeTry);
  const newBooking: BookingRecord = {
    id: `bk-${randomUUID()}`,
    goalkeeperId: targetKeeper.id,
    goalkeeperName: targetKeeper.fullName,
    goalkeeperPhone: targetKeeper.phone,
    district: targetKeeper.district,
    organizerName: input.organizerName,
    organizerPhone: input.organizerPhone,
    venueName: input.venueName,
    matchDate: input.matchDate,
    matchTime: input.matchTime,
    listedFeeTry: fee.listedFeeTry,
    goalkeeperNetPayoutTry: fee.goalkeeperNetPayoutTry,
    customerCommissionTry: fee.customerCommissionTry,
    totalPayableTry: fee.totalPayableTry,
    platformTotalRevenueTry: fee.platformTotalRevenueTry,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };

  const sql = customBookingsPath === undefined ? getSqlClient() : null;
  if (sql !== null) {
    try {
      await ensurePostgresSchema(sql);
      await sql`
        INSERT INTO bookings (id, payload, created_at)
        VALUES (${newBooking.id}, ${JSON.stringify(newBooking)}::jsonb, ${newBooking.createdAt}::timestamptz)
      `;
      return { ok: true, data: newBooking };
    } catch {
      return { ok: false, error: API_ERROR_CODES.STORAGE_WRITE_FAILED };
    }
  }

  const filePath = resolveBookingsDataPath(customBookingsPath);
  const existingBookings = await listBookings(filePath);
  if (!existingBookings.ok) {
    return existingBookings;
  }

  const writeResult = await writeBookingsAtomically(
    [newBooking, ...existingBookings.data],
    filePath,
  );
  if (!writeResult.ok) {
    return writeResult;
  }
  return { ok: true, data: newBooking };
}

/**
 * Deletes a persisted booking record identified by `id` from PostgreSQL or JSON storage.
 *
 * @param id - Target booking record identifier to remove.
 * @param customFilePath - Optional file path override for isolated test suites.
 * @returns `Result` containing the deleted booking `id` or `NOT_FOUND` / storage error.
 */
export async function deleteBookingById(
  id: string,
  customFilePath?: string,
): Promise<Result<string, ApiErrorCode>> {
  const existingResult = await listBookings(customFilePath);
  if (!existingResult.ok) {
    return existingResult;
  }

  const remaining = existingResult.data.filter((item) => item.id !== id);
  if (remaining.length === existingResult.data.length) {
    return { ok: false, error: API_ERROR_CODES.NOT_FOUND };
  }

  const sql = customFilePath === undefined ? getSqlClient() : null;
  if (sql !== null) {
    try {
      await sql`DELETE FROM bookings WHERE id = ${id}`;
      return { ok: true, data: id };
    } catch {
      return { ok: false, error: API_ERROR_CODES.STORAGE_WRITE_FAILED };
    }
  }

  const filePath = resolveBookingsDataPath(customFilePath);
  const writeResult = await writeBookingsAtomically(remaining, filePath);
  if (!writeResult.ok) {
    return writeResult;
  }
  return { ok: true, data: id };
}
