// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

import { z } from 'zod';
import {
  API_ERROR_CODES,
  bookingListSchema,
  goalkeeperProfileSchema,
  type AdminSessionStatus,
  type ApiErrorCode,
  type BookingRecord,
  type GoalkeeperProfile,
  type Result,
} from '@/domain/goalkeeper';

const ADMIN_SESSION_ENDPOINT = '/api/admin/session';
const ADMIN_GOALKEEPERS_ENDPOINT = '/api/admin/goalkeepers';
const BOOKINGS_ENDPOINT = '/api/bookings';
const ADMIN_BOOKINGS_ENDPOINT = '/api/admin/bookings';

const apiErrorCodeSchema = z.enum([
  API_ERROR_CODES.INVALID_JSON,
  API_ERROR_CODES.VALIDATION_FAILED,
  API_ERROR_CODES.STORAGE_READ_FAILED,
  API_ERROR_CODES.STORAGE_WRITE_FAILED,
  API_ERROR_CODES.NETWORK_ERROR,
  API_ERROR_CODES.UNAUTHORIZED,
  API_ERROR_CODES.NOT_FOUND,
  API_ERROR_CODES.RATE_LIMITED,
  API_ERROR_CODES.PAYLOAD_TOO_LARGE,
]);

const sessionResponseSchema = z.discriminatedUnion('ok', [
  z.object({
    ok: z.literal(true),
    data: z.object({ authenticated: z.boolean() }),
  }),
  z.object({
    ok: z.literal(false),
    errorCode: apiErrorCodeSchema,
  }),
]);

const patchVerificationResponseSchema = z.discriminatedUnion('ok', [
  z.object({
    ok: z.literal(true),
    data: goalkeeperProfileSchema,
  }),
  z.object({
    ok: z.literal(false),
    errorCode: apiErrorCodeSchema,
  }),
]);

const deleteEntityResponseSchema = z.discriminatedUnion('ok', [
  z.object({
    ok: z.literal(true),
    data: z.object({ id: z.string() }),
  }),
  z.object({
    ok: z.literal(false),
    errorCode: apiErrorCodeSchema,
  }),
]);

const getBookingsResponseSchema = z.discriminatedUnion('ok', [
  z.object({
    ok: z.literal(true),
    data: bookingListSchema,
  }),
  z.object({
    ok: z.literal(false),
    errorCode: apiErrorCodeSchema,
  }),
]);

/**
 * Checks whether the current browser session holds a valid `HttpOnly` administrator cookie.
 */
export async function fetchAdminSession(
  signal?: AbortSignal,
): Promise<Result<AdminSessionStatus, ApiErrorCode>> {
  try {
    const response = await fetch(ADMIN_SESSION_ENDPOINT, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal,
    });
    const parsed = sessionResponseSchema.safeParse(await response.json());
    if (!parsed.success) {
      return { ok: false, error: API_ERROR_CODES.NETWORK_ERROR };
    }
    if (!parsed.data.ok) {
      return { ok: false, error: parsed.data.errorCode };
    }
    return { ok: true, data: parsed.data.data };
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
    return { ok: false, error: API_ERROR_CODES.NETWORK_ERROR };
  }
}

/**
 * Submits the administrator password to `POST /api/admin/session` to establish a signed cookie.
 */
export async function loginAdmin(
  password: string,
): Promise<Result<AdminSessionStatus, ApiErrorCode>> {
  try {
    const response = await fetch(ADMIN_SESSION_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ password }),
    });
    const parsed = sessionResponseSchema.safeParse(await response.json());
    if (!parsed.success) {
      return { ok: false, error: API_ERROR_CODES.NETWORK_ERROR };
    }
    if (!parsed.data.ok) {
      return { ok: false, error: parsed.data.errorCode };
    }
    return { ok: true, data: parsed.data.data };
  } catch {
    return { ok: false, error: API_ERROR_CODES.NETWORK_ERROR };
  }
}

/**
 * Terminates the active administrator session by calling `DELETE /api/admin/session`.
 */
export async function logoutAdmin(): Promise<Result<AdminSessionStatus, ApiErrorCode>> {
  try {
    const response = await fetch(ADMIN_SESSION_ENDPOINT, {
      method: 'DELETE',
      headers: { Accept: 'application/json' },
    });
    const parsed = sessionResponseSchema.safeParse(await response.json());
    if (!parsed.success || !parsed.data.ok) {
      return { ok: false, error: API_ERROR_CODES.NETWORK_ERROR };
    }
    return { ok: true, data: parsed.data.data };
  } catch {
    return { ok: false, error: API_ERROR_CODES.NETWORK_ERROR };
  }
}

/**
 * Toggles the verification badge (`isVerified`) of a goalkeeper profile via `PATCH /api/admin/goalkeepers/[id]`.
 */
export async function setGoalkeeperVerification(
  id: string,
  isVerified: boolean,
): Promise<Result<GoalkeeperProfile, ApiErrorCode>> {
  try {
    const response = await fetch(`${ADMIN_GOALKEEPERS_ENDPOINT}/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ isVerified }),
    });
    const parsed = patchVerificationResponseSchema.safeParse(await response.json());
    if (!parsed.success) {
      return { ok: false, error: API_ERROR_CODES.STORAGE_WRITE_FAILED };
    }
    if (!parsed.data.ok) {
      return { ok: false, error: parsed.data.errorCode };
    }
    return { ok: true, data: parsed.data.data };
  } catch {
    return { ok: false, error: API_ERROR_CODES.NETWORK_ERROR };
  }
}

/**
 * Deletes a goalkeeper profile from storage via `DELETE /api/admin/goalkeepers/[id]`.
 */
export async function removeGoalkeeper(id: string): Promise<Result<string, ApiErrorCode>> {
  try {
    const response = await fetch(`${ADMIN_GOALKEEPERS_ENDPOINT}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json' },
    });
    const parsed = deleteEntityResponseSchema.safeParse(await response.json());
    if (!parsed.success) {
      return { ok: false, error: API_ERROR_CODES.STORAGE_WRITE_FAILED };
    }
    if (!parsed.data.ok) {
      return { ok: false, error: parsed.data.errorCode };
    }
    return { ok: true, data: parsed.data.data.id };
  } catch {
    return { ok: false, error: API_ERROR_CODES.NETWORK_ERROR };
  }
}

/**
 * Fetches all customer match bookings for the `/admin` console via `GET /api/bookings`.
 */
export async function fetchAdminBookings(
  signal?: AbortSignal,
): Promise<Result<BookingRecord[], ApiErrorCode>> {
  try {
    const response = await fetch(BOOKINGS_ENDPOINT, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal,
    });
    const parsed = getBookingsResponseSchema.safeParse(await response.json());
    if (!parsed.success) {
      return { ok: false, error: API_ERROR_CODES.STORAGE_READ_FAILED };
    }
    if (!parsed.data.ok) {
      return { ok: false, error: parsed.data.errorCode };
    }
    return { ok: true, data: parsed.data.data };
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
    return { ok: false, error: API_ERROR_CODES.NETWORK_ERROR };
  }
}

/**
 * Deletes a match booking record via `DELETE /api/admin/bookings/[id]`.
 */
export async function removeBooking(id: string): Promise<Result<string, ApiErrorCode>> {
  try {
    const response = await fetch(`${ADMIN_BOOKINGS_ENDPOINT}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json' },
    });
    const parsed = deleteEntityResponseSchema.safeParse(await response.json());
    if (!parsed.success) {
      return { ok: false, error: API_ERROR_CODES.STORAGE_WRITE_FAILED };
    }
    if (!parsed.data.ok) {
      return { ok: false, error: parsed.data.errorCode };
    }
    return { ok: true, data: parsed.data.data.id };
  } catch {
    return { ok: false, error: API_ERROR_CODES.NETWORK_ERROR };
  }
}
