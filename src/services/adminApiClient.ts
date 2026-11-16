// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

import { z } from 'zod';
import {
  API_ERROR_CODES,
  goalkeeperProfileSchema,
  type AdminSessionStatus,
  type ApiErrorCode,
  type GoalkeeperProfile,
  type Result,
} from '@/domain/goalkeeper';

const ADMIN_SESSION_ENDPOINT = '/api/admin/session';
const ADMIN_GOALKEEPERS_ENDPOINT = '/api/admin/goalkeepers';

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

const deleteGoalkeeperResponseSchema = z.discriminatedUnion('ok', [
  z.object({
    ok: z.literal(true),
    data: z.object({ id: z.string() }),
  }),
  z.object({
    ok: z.literal(false),
    errorCode: apiErrorCodeSchema,
  }),
]);

/**
 * Checks whether the current browser session holds a valid `HttpOnly` administrator cookie.
 *
 * @param signal - Optional `AbortSignal` to cancel the request on component unmount.
 * @returns `Result` resolving to `AdminSessionStatus` or an `ApiErrorCode`.
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
    const rawPayload: unknown = await response.json();
    const parsed = sessionResponseSchema.safeParse(rawPayload);

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
 *
 * @param password - Administrator password entered in the login console.
 * @returns `Result` resolving to `AdminSessionStatus` or an `ApiErrorCode`.
 */
export async function loginAdmin(
  password: string,
): Promise<Result<AdminSessionStatus, ApiErrorCode>> {
  try {
    const response = await fetch(ADMIN_SESSION_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ password }),
    });
    const rawPayload: unknown = await response.json();
    const parsed = sessionResponseSchema.safeParse(rawPayload);

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
 *
 * @returns `Result` resolving to `AdminSessionStatus` or an `ApiErrorCode`.
 */
export async function logoutAdmin(): Promise<Result<AdminSessionStatus, ApiErrorCode>> {
  try {
    const response = await fetch(ADMIN_SESSION_ENDPOINT, {
      method: 'DELETE',
      headers: { Accept: 'application/json' },
    });
    const rawPayload: unknown = await response.json();
    const parsed = sessionResponseSchema.safeParse(rawPayload);

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
 *
 * @param id - Target goalkeeper profile identifier.
 * @param isVerified - Desired verification status boolean.
 * @returns `Result` containing the updated `GoalkeeperProfile` or an `ApiErrorCode`.
 */
export async function setGoalkeeperVerification(
  id: string,
  isVerified: boolean,
): Promise<Result<GoalkeeperProfile, ApiErrorCode>> {
  try {
    const response = await fetch(`${ADMIN_GOALKEEPERS_ENDPOINT}/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ isVerified }),
    });
    const rawPayload: unknown = await response.json();
    const parsed = patchVerificationResponseSchema.safeParse(rawPayload);

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
 *
 * @param id - Target goalkeeper profile identifier to remove.
 * @returns `Result` resolving to the deleted `id` or an `ApiErrorCode`.
 */
export async function removeGoalkeeper(id: string): Promise<Result<string, ApiErrorCode>> {
  try {
    const response = await fetch(`${ADMIN_GOALKEEPERS_ENDPOINT}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json' },
    });
    const rawPayload: unknown = await response.json();
    const parsed = deleteGoalkeeperResponseSchema.safeParse(rawPayload);

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
