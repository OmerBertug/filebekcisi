// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

import type {
  API_ERROR_CODES,
  AVAILABLE_DAYS,
  BOOKING_STATUSES,
  DISTRICT_CODES,
  DOMINANT_HANDS,
  EXPERIENCE_LEVELS,
  FILTER_ALL_VALUE,
  REQUEST_STATES,
  VALIDATION_ERROR_CODES,
} from './constants';

/**
 * Union type representing a goalkeeper competitive experience tier.
 */
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

/**
 * Union type representing a goalkeeper dominant throwing/catching hand.
 */
export type DominantHand = (typeof DOMINANT_HANDS)[number];

/**
 * Union type representing a weekday key for match availability scheduling.
 */
export type AvailableDay = (typeof AVAILABLE_DAYS)[number];

/**
 * Union type representing a canonical city-district location identifier.
 */
export type DistrictCode = (typeof DISTRICT_CODES)[number];

/**
 * Union type representing asynchronous operation states (`idle` | `loading` | `success` | `error`).
 */
export type RequestState = (typeof REQUEST_STATES)[keyof typeof REQUEST_STATES];

/**
 * Union type representing schema validation error codes mapped to i18n messages.
 */
export type ValidationErrorCode =
  (typeof VALIDATION_ERROR_CODES)[keyof typeof VALIDATION_ERROR_CODES];

/**
 * Union type representing structured API and repository failure identifiers.
 */
export type ApiErrorCode = (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

/**
 * Union type representing booking status (`confirmed` | `cancelled`).
 */
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

/**
 * Discriminated union representing a fallible operation outcome without throwing exceptions.
 *
 * @template TData - Value payload returned when `ok` is `true`.
 * @template TError - Structured error descriptor returned when `ok` is `false`.
 */
export type Result<TData, TError> =
  { readonly ok: true; readonly data: TData } | { readonly ok: false; readonly error: TError };

/**
 * Persisted goalkeeper profile entity displayed in the marketplace directory.
 */
export interface GoalkeeperProfile {
  /** Unique UUIDv4 or deterministic seed identifier for the goalkeeper record. */
  readonly id: string;
  /** Full display name of the goalkeeper. */
  readonly fullName: string;
  /** Canonical primary district where the goalkeeper accepts match invitations. */
  readonly district: DistrictCode;
  /** Goalkeeper age in years (constrained between 16 and 60). */
  readonly age: number;
  /** Goalkeeper height in centimeters (constrained between 155 and 215). */
  readonly heightCm: number;
  /** Competitive experience classification. */
  readonly experienceLevel: ExperienceLevel;
  /** Dominant hand preference. */
  readonly dominantHand: DominantHand;
  /** Listed per-match price set by the goalkeeper in Turkish Lira (TRY). */
  readonly matchFeeTry: number;
  /** Contact phone number shared with match organizers upon booking confirmation. */
  readonly phone: string;
  /** List of weekdays on which the goalkeeper is available for matches. */
  readonly availableDays: readonly AvailableDay[];
  /** Concise self-introduction describing playing style, reflexes, and past teams. */
  readonly bio: string;
  /** Aggregate organizer rating on a 1.0 to 5.0 scale. */
  readonly rating: number;
  /** Total number of verified matches completed through the platform. */
  readonly completedMatches: number;
  /** Indicates whether phone/identity screening has been verified by the platform. */
  readonly isVerified: boolean;
  /** ISO-8601 UTC timestamp recording when the goalkeeper registered. */
  readonly createdAt: string;
}

/**
 * Validated payload submitted when a goalkeeper self-registers on the platform.
 */
export interface CreateGoalkeeperInput {
  readonly fullName: string;
  readonly district: DistrictCode;
  readonly age: number;
  readonly heightCm: number;
  readonly experienceLevel: ExperienceLevel;
  readonly dominantHand: DominantHand;
  readonly matchFeeTry: number;
  readonly phone: string;
  readonly availableDays: readonly AvailableDay[];
  readonly bio: string;
}

/**
 * Filter state applied by match organizers when searching the goalkeeper directory.
 */
export interface GoalkeeperFilterCriteria {
  readonly district: DistrictCode | typeof FILTER_ALL_VALUE;
  readonly experienceLevel: ExperienceLevel | typeof FILTER_ALL_VALUE;
  readonly availableDay: AvailableDay | typeof FILTER_ALL_VALUE;
  readonly maxFeeTry: number | null;
}

/**
 * Dual-sided 15% financial calculation detailing listed price, goalkeeper net payout (-15%),
 * customer checkout commission (+15%), total customer payable, and combined platform revenue.
 */
export interface FeeBreakdown {
  /** Listed match fee set by the goalkeeper and shown on directory cards in TRY (e.g. 500). */
  readonly listedFeeTry: number;
  /** 15% commission deducted from the goalkeeper's listed fee in TRY (e.g. 75). */
  readonly goalkeeperCutTry: number;
  /** Net payout the goalkeeper receives after 15% deduction (`listedFeeTry - goalkeeperCutTry`, e.g. 425). */
  readonly goalkeeperNetPayoutTry: number;
  /** 15% service commission added to the customer checkout total in TRY (e.g. 75). */
  readonly customerCommissionTry: number;
  /** Total amount payable by the customer at checkout (`listedFeeTry + customerCommissionTry`, e.g. 575). */
  readonly totalPayableTry: number;
  /** Total platform revenue combining goalkeeper cut and customer commission (`goalkeeperCutTry + customerCommissionTry`, e.g. 150). */
  readonly platformTotalRevenueTry: number;
  /** Alias for `listedFeeTry` preserved for backward compatibility. */
  readonly goalkeeperFeeTry: number;
  /** Alias for `customerCommissionTry` preserved for backward compatibility. */
  readonly platformCommissionTry: number;
}

/**
 * Validated payload submitted when a customer purchases/books a goalkeeper for a match.
 */
export interface CreateBookingInput {
  readonly goalkeeperId: string;
  readonly organizerName: string;
  readonly organizerPhone: string;
  readonly venueName: string;
  readonly matchDate: AvailableDay;
  readonly matchTime: string;
}

/**
 * Persisted match booking / purchase record stored in PostgreSQL or JSON fallback.
 */
export interface BookingRecord {
  readonly id: string;
  readonly goalkeeperId: string;
  readonly goalkeeperName: string;
  readonly goalkeeperPhone: string;
  readonly district: DistrictCode;
  readonly organizerName: string;
  readonly organizerPhone: string;
  readonly venueName: string;
  readonly matchDate: AvailableDay;
  readonly matchTime: string;
  readonly listedFeeTry: number;
  readonly goalkeeperNetPayoutTry: number;
  readonly customerCommissionTry: number;
  readonly totalPayableTry: number;
  readonly platformTotalRevenueTry: number;
  readonly status: BookingStatus;
  readonly createdAt: string;
}

/**
 * Field-keyed map of validation error codes returned when registration input fails validation.
 */
export type RegistrationFieldErrors = Partial<
  Record<keyof CreateGoalkeeperInput, ValidationErrorCode>
>;

/**
 * Field-keyed map of validation error codes returned when booking checkout input fails validation.
 */
export type BookingFieldErrors = Partial<Record<keyof CreateBookingInput, ValidationErrorCode>>;

/**
 * Discriminated JSON envelope returned by `/api/goalkeepers`, `/api/bookings`, and `/api/admin/*`.
 *
 * @template TPayload - Expected payload type when `ok` is `true`.
 */
export type GoalkeeperApiResponse<TPayload> =
  | { readonly ok: true; readonly data: TPayload }
  | {
      readonly ok: false;
      readonly errorCode: ApiErrorCode;
      readonly fieldErrors?: RegistrationFieldErrors | BookingFieldErrors;
    };

/**
 * Payload returned by `GET /api/admin/session` indicating current administrator authentication status.
 */
export interface AdminSessionStatus {
  readonly authenticated: boolean;
}
