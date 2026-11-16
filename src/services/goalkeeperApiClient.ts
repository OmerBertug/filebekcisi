// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

import { z } from 'zod';
import {
  API_ERROR_CODES,
  VALIDATION_ERROR_CODES,
  goalkeeperListSchema,
  goalkeeperProfileSchema,
  type ApiErrorCode,
  type CreateGoalkeeperInput,
  type GoalkeeperProfile,
  type RegistrationFieldErrors,
  type Result,
} from '@/domain/goalkeeper';

const GOALKEEPERS_API_ENDPOINT = '/api/goalkeepers';

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

const validationErrorCodeSchema = z.enum([
  VALIDATION_ERROR_CODES.INVALID_NAME,
  VALIDATION_ERROR_CODES.INVALID_DISTRICT,
  VALIDATION_ERROR_CODES.INVALID_AGE,
  VALIDATION_ERROR_CODES.INVALID_HEIGHT,
  VALIDATION_ERROR_CODES.INVALID_EXPERIENCE,
  VALIDATION_ERROR_CODES.INVALID_HAND,
  VALIDATION_ERROR_CODES.INVALID_FEE,
  VALIDATION_ERROR_CODES.INVALID_PHONE,
  VALIDATION_ERROR_CODES.EMPTY_DAYS,
  VALIDATION_ERROR_CODES.INVALID_BIO,
]);

const fieldErrorsSchema = z
  .object({
    fullName: validationErrorCodeSchema.optional(),
    district: validationErrorCodeSchema.optional(),
    age: validationErrorCodeSchema.optional(),
    heightCm: validationErrorCodeSchema.optional(),
    experienceLevel: validationErrorCodeSchema.optional(),
    dominantHand: validationErrorCodeSchema.optional(),
    matchFeeTry: validationErrorCodeSchema.optional(),
    phone: validationErrorCodeSchema.optional(),
    availableDays: validationErrorCodeSchema.optional(),
    bio: validationErrorCodeSchema.optional(),
  })
  .optional();

const getGoalkeepersResponseSchema = z.discriminatedUnion('ok', [
  z.object({ ok: z.literal(true), data: goalkeeperListSchema }),
  z.object({ ok: z.literal(false), errorCode: apiErrorCodeSchema }),
]);

const postGoalkeeperResponseSchema = z.discriminatedUnion('ok', [
  z.object({ ok: z.literal(true), data: goalkeeperProfileSchema }),
  z.object({
    ok: z.literal(false),
    errorCode: apiErrorCodeSchema,
    fieldErrors: fieldErrorsSchema,
  }),
]);

/**
 * Structured error descriptor returned when goalkeeper registration fails over HTTP.
 */
export interface RegistrationApiFailure {
  readonly errorCode: ApiErrorCode;
  readonly fieldErrors?: RegistrationFieldErrors;
}

/**
 * Fetches the list of goalkeeper profiles from `GET /api/goalkeepers` with runtime Zod validation.
 *
 * Propagates `AbortError` exceptions to callers when `signal` is aborted so unmounted React hooks
 * can exit cleanly without mutating component state.
 *
 * @param signal - Optional `AbortSignal` used to cancel in-flight HTTP requests on unmount.
 * @returns `Result` resolving to validated `GoalkeeperProfile[]` or an `ApiErrorCode`.
 */
export async function fetchGoalkeepersList(
  signal?: AbortSignal,
): Promise<Result<GoalkeeperProfile[], ApiErrorCode>> {
  try {
    const response = await fetch(GOALKEEPERS_API_ENDPOINT, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal,
    });
    const rawPayload: unknown = await response.json();
    const parsed = getGoalkeepersResponseSchema.safeParse(rawPayload);

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
 * Submits a validated goalkeeper self-registration payload to `POST /api/goalkeepers`.
 *
 * Validates both success and error response shapes via Zod without unsafe type assertions.
 *
 * @param input - Sanitized `CreateGoalkeeperInput` registration attributes.
 * @returns `Result` containing either the persisted `GoalkeeperProfile` or `RegistrationApiFailure`.
 */
export async function submitGoalkeeperRegistration(
  input: CreateGoalkeeperInput,
): Promise<Result<GoalkeeperProfile, RegistrationApiFailure>> {
  try {
    const response = await fetch(GOALKEEPERS_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(input),
    });

    const rawPayload: unknown = await response.json();
    const parsed = postGoalkeeperResponseSchema.safeParse(rawPayload);

    if (!parsed.success) {
      return { ok: false, error: { errorCode: API_ERROR_CODES.STORAGE_WRITE_FAILED } };
    }
    if (!parsed.data.ok) {
      return {
        ok: false,
        error: {
          errorCode: parsed.data.errorCode,
          fieldErrors: parsed.data.fieldErrors,
        },
      };
    }

    return { ok: true, data: parsed.data.data };
  } catch {
    return { ok: false, error: { errorCode: API_ERROR_CODES.NETWORK_ERROR } };
  }
}
