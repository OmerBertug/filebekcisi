// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

import { z } from 'zod';
import {
  API_ERROR_CODES,
  VALIDATION_ERROR_CODES,
  bookingRecordSchema,
  goalkeeperListSchema,
  goalkeeperProfileSchema,
  type ApiErrorCode,
  type BookingFieldErrors,
  type BookingRecord,
  type CreateBookingInput,
  type CreateGoalkeeperInput,
  type GoalkeeperProfile,
  type RegistrationFieldErrors,
  type Result,
} from '@/domain/goalkeeper';

const GOALKEEPERS_API_ENDPOINT = '/api/goalkeepers';
const BOOKINGS_API_ENDPOINT = '/api/bookings';

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
  VALIDATION_ERROR_CODES.INVALID_ORGANIZER_NAME,
  VALIDATION_ERROR_CODES.INVALID_VENUE_NAME,
  VALIDATION_ERROR_CODES.INVALID_MATCH_DATE,
  VALIDATION_ERROR_CODES.INVALID_MATCH_TIME,
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

const bookingFieldErrorsSchema = z
  .object({
    goalkeeperId: validationErrorCodeSchema.optional(),
    organizerName: validationErrorCodeSchema.optional(),
    organizerPhone: validationErrorCodeSchema.optional(),
    venueName: validationErrorCodeSchema.optional(),
    matchDate: validationErrorCodeSchema.optional(),
    matchTime: validationErrorCodeSchema.optional(),
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

const postBookingResponseSchema = z.discriminatedUnion('ok', [
  z.object({ ok: z.literal(true), data: bookingRecordSchema }),
  z.object({
    ok: z.literal(false),
    errorCode: apiErrorCodeSchema,
    fieldErrors: bookingFieldErrorsSchema,
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
 * Structured error descriptor returned when customer booking checkout fails over HTTP.
 */
export interface BookingApiFailure {
  readonly errorCode: ApiErrorCode;
  readonly fieldErrors?: BookingFieldErrors;
}

/**
 * Fetches the list of goalkeeper profiles from `GET /api/goalkeepers` with runtime Zod validation.
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

/**
 * Submits a customer match booking / purchase request to `POST /api/bookings`.
 *
 * @param input - Sanitized `CreateBookingInput` booking attributes.
 * @returns `Result` containing either the created `BookingRecord` or `BookingApiFailure`.
 */
export async function submitMatchBooking(
  input: CreateBookingInput,
): Promise<Result<BookingRecord, BookingApiFailure>> {
  try {
    const response = await fetch(BOOKINGS_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(input),
    });

    const rawPayload: unknown = await response.json();
    const parsed = postBookingResponseSchema.safeParse(rawPayload);

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
