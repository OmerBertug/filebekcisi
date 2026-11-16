// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

/**
 * Sentinel filter token representing an unfiltered selection across directory criteria.
 * Used instead of raw string literals to maintain strict data-driven control flow.
 */
export const FILTER_ALL_VALUE = 'all' as const;

/**
 * Supported goalkeeper skill and competitive background classifications.
 * Ordered from recreational amateur play to veteran competitive experience.
 */
export const EXPERIENCE_LEVELS = ['amateur', 'semi_pro', 'academy', 'veteran'] as const;

/**
 * Supported goalkeeper dominant hand preferences for distribution and shot-stopping metrics.
 */
export const DOMINANT_HANDS = ['right', 'left', 'both'] as const;

/**
 * Days of the week selectable in a goalkeeper availability schedule.
 */
export const AVAILABLE_DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

/**
 * Canonical city and district identifiers supported in the initial marketplace rollout.
 * Localized display names are resolved from the active i18n catalog using these keys.
 */
export const DISTRICT_CODES = [
  'istanbul_kadikoy',
  'istanbul_besiktas',
  'istanbul_sisli',
  'istanbul_atasehir',
  'istanbul_uskudar',
  'istanbul_bakirkoy',
  'ankara_cankaya',
  'izmir_karsiyaka',
  'bursa_nilufer',
] as const;

/**
 * Asynchronous lifecycle state tokens for network requests and form submissions.
 */
export const REQUEST_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

/**
 * Standardized validation error codes emitted by runtime schemas and mapped to localized UI copy.
 */
export const VALIDATION_ERROR_CODES = {
  INVALID_NAME: 'invalid_name',
  INVALID_DISTRICT: 'invalid_district',
  INVALID_AGE: 'invalid_age',
  INVALID_HEIGHT: 'invalid_height',
  INVALID_EXPERIENCE: 'invalid_experience',
  INVALID_HAND: 'invalid_hand',
  INVALID_FEE: 'invalid_fee',
  INVALID_PHONE: 'invalid_phone',
  EMPTY_DAYS: 'empty_days',
  INVALID_BIO: 'invalid_bio',
} as const;

/**
 * Standardized API and persistence failure codes used across server routes and client hooks.
 */
export const API_ERROR_CODES = {
  INVALID_JSON: 'invalid_json',
  VALIDATION_FAILED: 'validation_failed',
  STORAGE_READ_FAILED: 'storage_read_failed',
  STORAGE_WRITE_FAILED: 'storage_write_failed',
  NETWORK_ERROR: 'network_error',
  UNAUTHORIZED: 'unauthorized',
  NOT_FOUND: 'not_found',
  RATE_LIMITED: 'rate_limited',
  PAYLOAD_TOO_LARGE: 'payload_too_large',
} as const;

/**
 * HTTP cookie identifier storing the HMAC-signed administrator session token.
 */
export const ADMIN_SESSION_COOKIE_NAME = 'fb_admin_session' as const;

/**
 * Security boundary constants governing payload size, sliding-window rate limits, and session TTL.
 */
export const SECURITY_LIMITS = {
  MAX_PAYLOAD_BYTES: 16384,
  RATE_LIMIT_WINDOW_MS: 60000,
  MAX_REQUESTS_PER_WINDOW: 15,
  SESSION_TTL_SECONDS: 28800,
} as const;

/**
 * Platform intermediary service commission rate applied on top of the goalkeeper match fee (15%).
 */
export const PLATFORM_COMMISSION_RATE = 0.15;

/**
 * Numeric and character length boundary invariants for goalkeeper profile registration.
 */
export const GOALKEEPER_CONSTRAINTS = {
  MIN_NAME_LENGTH: 3,
  MAX_NAME_LENGTH: 60,
  MIN_AGE: 16,
  MAX_AGE: 60,
  MIN_HEIGHT_CM: 155,
  MAX_HEIGHT_CM: 215,
  MIN_FEE_TRY: 100,
  MAX_FEE_TRY: 5000,
  MIN_BIO_LENGTH: 15,
  MAX_BIO_LENGTH: 280,
  DEFAULT_NEW_RATING: 5.0,
} as const;

/**
 * Precompiled regular expression validating domestic and international phone numbers (10-18 chars).
 * Defined at module initialization to prevent repeated regex compilation during render or input validation.
 */
export const PHONE_NUMBER_PATTERN = /^\+?[0-9\s()-]{10,18}$/;
