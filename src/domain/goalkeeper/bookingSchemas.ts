// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

import { z } from 'zod';
import {
  AVAILABLE_DAYS,
  BOOKING_CONSTRAINTS,
  BOOKING_STATUSES,
  DISTRICT_CODES,
  PHONE_NUMBER_PATTERN,
  VALIDATION_ERROR_CODES,
} from './constants';
import { isValidationErrorCode } from './schemas';
import type { BookingFieldErrors, CreateBookingInput, Result } from './types';

const BOOKING_FIELD_KEYS: ReadonlySet<string> = new Set<keyof CreateBookingInput>([
  'goalkeeperId',
  'organizerName',
  'organizerPhone',
  'venueName',
  'matchDate',
  'matchTime',
]);

/**
 * Type guard verifying whether a property key belongs to `CreateBookingInput`.
 */
function isBookingFieldKey(key: PropertyKey): key is keyof CreateBookingInput {
  return typeof key === 'string' && BOOKING_FIELD_KEYS.has(key);
}

/**
 * Runtime Zod schema validating incoming customer match booking/purchase requests.
 */
export const createBookingSchema = z.object({
  goalkeeperId: z.string().trim().min(1),
  organizerName: z
    .string({ message: VALIDATION_ERROR_CODES.INVALID_ORGANIZER_NAME })
    .trim()
    .min(BOOKING_CONSTRAINTS.MIN_ORGANIZER_NAME_LENGTH, {
      message: VALIDATION_ERROR_CODES.INVALID_ORGANIZER_NAME,
    })
    .max(BOOKING_CONSTRAINTS.MAX_ORGANIZER_NAME_LENGTH, {
      message: VALIDATION_ERROR_CODES.INVALID_ORGANIZER_NAME,
    }),
  organizerPhone: z
    .string({ message: VALIDATION_ERROR_CODES.INVALID_PHONE })
    .trim()
    .regex(PHONE_NUMBER_PATTERN, { message: VALIDATION_ERROR_CODES.INVALID_PHONE }),
  venueName: z
    .string({ message: VALIDATION_ERROR_CODES.INVALID_VENUE_NAME })
    .trim()
    .min(BOOKING_CONSTRAINTS.MIN_VENUE_NAME_LENGTH, {
      message: VALIDATION_ERROR_CODES.INVALID_VENUE_NAME,
    })
    .max(BOOKING_CONSTRAINTS.MAX_VENUE_NAME_LENGTH, {
      message: VALIDATION_ERROR_CODES.INVALID_VENUE_NAME,
    }),
  matchDate: z.enum(AVAILABLE_DAYS, { message: VALIDATION_ERROR_CODES.INVALID_MATCH_DATE }),
  matchTime: z
    .string({ message: VALIDATION_ERROR_CODES.INVALID_MATCH_TIME })
    .trim()
    .min(BOOKING_CONSTRAINTS.MIN_MATCH_TIME_LENGTH, {
      message: VALIDATION_ERROR_CODES.INVALID_MATCH_TIME,
    })
    .max(BOOKING_CONSTRAINTS.MAX_MATCH_TIME_LENGTH, {
      message: VALIDATION_ERROR_CODES.INVALID_MATCH_TIME,
    }),
});

/**
 * Runtime Zod schema validating a persisted `BookingRecord` entity from PostgreSQL or JSON storage.
 */
export const bookingRecordSchema = z.object({
  id: z.string().min(1),
  goalkeeperId: z.string().min(1),
  goalkeeperName: z.string().min(1),
  goalkeeperPhone: z.string().min(1),
  district: z.enum(DISTRICT_CODES),
  organizerName: z.string().min(1),
  organizerPhone: z.string().min(1),
  venueName: z.string().min(1),
  matchDate: z.enum(AVAILABLE_DAYS),
  matchTime: z.string().min(1),
  listedFeeTry: z.number().int().min(0),
  goalkeeperNetPayoutTry: z.number().int().min(0),
  customerCommissionTry: z.number().int().min(0),
  totalPayableTry: z.number().int().min(0),
  platformTotalRevenueTry: z.number().int().min(0),
  status: z.enum(BOOKING_STATUSES),
  createdAt: z.string().min(1),
});

/**
 * Runtime Zod schema validating an array of `BookingRecord` items.
 */
export const bookingListSchema = z.array(bookingRecordSchema);

/**
 * Validates an untrusted customer booking request payload and maps field-level errors without throwing.
 *
 * @param rawInput - Untrusted JSON body from a booking checkout submission.
 * @returns `Result` resolving to `CreateBookingInput` or `BookingFieldErrors`.
 */
export function validateCreateBookingInput(
  rawInput: unknown,
): Result<CreateBookingInput, BookingFieldErrors> {
  const parsed = createBookingSchema.safeParse(rawInput);
  if (parsed.success) {
    return { ok: true, data: parsed.data };
  }

  const fieldErrors: BookingFieldErrors = {};
  for (const issue of parsed.error.issues) {
    const firstPathSegment = issue.path[0];
    if (
      firstPathSegment !== undefined &&
      isBookingFieldKey(firstPathSegment) &&
      fieldErrors[firstPathSegment] === undefined &&
      isValidationErrorCode(issue.message)
    ) {
      fieldErrors[firstPathSegment] = issue.message;
    }
  }

  return { ok: false, error: fieldErrors };
}
