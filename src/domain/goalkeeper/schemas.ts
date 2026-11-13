// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

import { z } from 'zod';
import {
  AVAILABLE_DAYS,
  DISTRICT_CODES,
  DOMINANT_HANDS,
  EXPERIENCE_LEVELS,
  GOALKEEPER_CONSTRAINTS,
  PHONE_NUMBER_PATTERN,
  VALIDATION_ERROR_CODES,
} from './constants';
import type {
  CreateGoalkeeperInput,
  RegistrationFieldErrors,
  Result,
  ValidationErrorCode,
} from './types';

const VALIDATION_CODE_SET: ReadonlySet<string> = new Set<string>(
  Object.values(VALIDATION_ERROR_CODES),
);

const REGISTRATION_FIELD_KEYS: ReadonlySet<string> = new Set<keyof CreateGoalkeeperInput>([
  'fullName',
  'district',
  'age',
  'heightCm',
  'experienceLevel',
  'dominantHand',
  'matchFeeTry',
  'phone',
  'availableDays',
  'bio',
]);

/**
 * Type guard verifying whether an arbitrary Zod message string corresponds to a known
 * `ValidationErrorCode`. Prevents unsafe type casting when mapping schema issues to UI fields.
 *
 * @param value - Candidate error message emitted by a Zod validator.
 * @returns `true` if `value` is a member of `VALIDATION_ERROR_CODES`.
 */
export function isValidationErrorCode(value: string): value is ValidationErrorCode {
  return VALIDATION_CODE_SET.has(value);
}

/**
 * Type guard verifying whether a property key belongs to `CreateGoalkeeperInput`.
 *
 * @param key - Candidate issue path segment from a Zod error.
 * @returns `true` if `key` is a valid registration field identifier.
 */
function isRegistrationFieldKey(key: PropertyKey): key is keyof CreateGoalkeeperInput {
  return typeof key === 'string' && REGISTRATION_FIELD_KEYS.has(key);
}

/**
 * Runtime Zod schema validating incoming goalkeeper self-registration payloads.
 * Uses canonical `VALIDATION_ERROR_CODES` as issue messages so UI layers resolve localized text
 * without inspecting raw prose strings.
 */
export const createGoalkeeperSchema = z.object({
  fullName: z
    .string({ message: VALIDATION_ERROR_CODES.INVALID_NAME })
    .trim()
    .min(GOALKEEPER_CONSTRAINTS.MIN_NAME_LENGTH, { message: VALIDATION_ERROR_CODES.INVALID_NAME })
    .max(GOALKEEPER_CONSTRAINTS.MAX_NAME_LENGTH, { message: VALIDATION_ERROR_CODES.INVALID_NAME }),
  district: z.enum(DISTRICT_CODES, { message: VALIDATION_ERROR_CODES.INVALID_DISTRICT }),
  age: z
    .number({ message: VALIDATION_ERROR_CODES.INVALID_AGE })
    .int({ message: VALIDATION_ERROR_CODES.INVALID_AGE })
    .min(GOALKEEPER_CONSTRAINTS.MIN_AGE, { message: VALIDATION_ERROR_CODES.INVALID_AGE })
    .max(GOALKEEPER_CONSTRAINTS.MAX_AGE, { message: VALIDATION_ERROR_CODES.INVALID_AGE }),
  heightCm: z
    .number({ message: VALIDATION_ERROR_CODES.INVALID_HEIGHT })
    .int({ message: VALIDATION_ERROR_CODES.INVALID_HEIGHT })
    .min(GOALKEEPER_CONSTRAINTS.MIN_HEIGHT_CM, { message: VALIDATION_ERROR_CODES.INVALID_HEIGHT })
    .max(GOALKEEPER_CONSTRAINTS.MAX_HEIGHT_CM, { message: VALIDATION_ERROR_CODES.INVALID_HEIGHT }),
  experienceLevel: z.enum(EXPERIENCE_LEVELS, {
    message: VALIDATION_ERROR_CODES.INVALID_EXPERIENCE,
  }),
  dominantHand: z.enum(DOMINANT_HANDS, { message: VALIDATION_ERROR_CODES.INVALID_HAND }),
  matchFeeTry: z
    .number({ message: VALIDATION_ERROR_CODES.INVALID_FEE })
    .int({ message: VALIDATION_ERROR_CODES.INVALID_FEE })
    .min(GOALKEEPER_CONSTRAINTS.MIN_FEE_TRY, { message: VALIDATION_ERROR_CODES.INVALID_FEE })
    .max(GOALKEEPER_CONSTRAINTS.MAX_FEE_TRY, { message: VALIDATION_ERROR_CODES.INVALID_FEE }),
  phone: z
    .string({ message: VALIDATION_ERROR_CODES.INVALID_PHONE })
    .trim()
    .regex(PHONE_NUMBER_PATTERN, { message: VALIDATION_ERROR_CODES.INVALID_PHONE }),
  availableDays: z
    .array(z.enum(AVAILABLE_DAYS), { message: VALIDATION_ERROR_CODES.EMPTY_DAYS })
    .min(1, { message: VALIDATION_ERROR_CODES.EMPTY_DAYS }),
  bio: z
    .string({ message: VALIDATION_ERROR_CODES.INVALID_BIO })
    .trim()
    .min(GOALKEEPER_CONSTRAINTS.MIN_BIO_LENGTH, { message: VALIDATION_ERROR_CODES.INVALID_BIO })
    .max(GOALKEEPER_CONSTRAINTS.MAX_BIO_LENGTH, { message: VALIDATION_ERROR_CODES.INVALID_BIO }),
});

/**
 * Runtime Zod schema validating a persisted `GoalkeeperProfile` entity loaded from JSON storage
 * or received over the network.
 */
export const goalkeeperProfileSchema = createGoalkeeperSchema.extend({
  id: z.string().min(1),
  rating: z.number().min(1).max(5),
  completedMatches: z.number().int().min(0),
  isVerified: z.boolean(),
  createdAt: z.string().min(1),
});

/**
 * Runtime Zod schema validating an array of persisted `GoalkeeperProfile` entities.
 */
export const goalkeeperListSchema = z.array(goalkeeperProfileSchema);

/**
 * Validates an untrusted goalkeeper registration input object and extracts typed field errors
 * on failure without throwing exceptions.
 *
 * @param rawInput - Untrusted payload from a form submission or HTTP request body.
 * @returns `Result` containing either sanitized `CreateGoalkeeperInput` or `RegistrationFieldErrors`.
 */
export function validateCreateGoalkeeperInput(
  rawInput: unknown,
): Result<CreateGoalkeeperInput, RegistrationFieldErrors> {
  const parsed = createGoalkeeperSchema.safeParse(rawInput);
  if (parsed.success) {
    return { ok: true, data: parsed.data };
  }

  const fieldErrors: RegistrationFieldErrors = {};
  for (const issue of parsed.error.issues) {
    const firstPathSegment = issue.path[0];
    if (
      firstPathSegment !== undefined &&
      isRegistrationFieldKey(firstPathSegment) &&
      fieldErrors[firstPathSegment] === undefined &&
      isValidationErrorCode(issue.message)
    ) {
      fieldErrors[firstPathSegment] = issue.message;
    }
  }

  return { ok: false, error: fieldErrors };
}
