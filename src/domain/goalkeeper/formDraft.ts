// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

import type {
  AvailableDay,
  CreateGoalkeeperInput,
  DistrictCode,
  DominantHand,
  ExperienceLevel,
} from './types';

/**
 * Controlled form draft state used prior to numeric parsing and schema submission.
 */
export interface GoalkeeperFormDraft {
  readonly fullName: string;
  readonly phone: string;
  readonly district: DistrictCode;
  readonly age: string;
  readonly heightCm: string;
  readonly experienceLevel: ExperienceLevel;
  readonly dominantHand: DominantHand;
  readonly matchFeeTry: string;
  readonly availableDays: readonly AvailableDay[];
  readonly bio: string;
}

/**
 * Default initial draft values populated when the goalkeeper registration form mounts or resets.
 */
export const INITIAL_GOALKEEPER_FORM_DRAFT: GoalkeeperFormDraft = {
  fullName: '',
  phone: '',
  district: 'istanbul_kadikoy',
  age: '24',
  heightCm: '185',
  experienceLevel: 'amateur',
  dominantHand: 'right',
  matchFeeTry: '400',
  availableDays: ['friday', 'saturday'],
  bio: '',
};

/**
 * Converts string-based form draft inputs into a candidate `CreateGoalkeeperInput` structure
 * ready for Zod runtime validation via `validateCreateGoalkeeperInput`.
 *
 * Empty numeric strings coerce to `NaN` via `Number('')` rather than `0` when trimmed carefully,
 * ensuring missing numeric fields fail range checks cleanly.
 *
 * @param draft - Controlled user input values from the goalkeeper registration form.
 * @returns Candidate `CreateGoalkeeperInput` object for schema validation.
 */
export function buildCandidateGoalkeeperInput(draft: GoalkeeperFormDraft): CreateGoalkeeperInput {
  return {
    fullName: draft.fullName,
    phone: draft.phone,
    district: draft.district,
    age: draft.age.trim() === '' ? Number.NaN : Number(draft.age),
    heightCm: draft.heightCm.trim() === '' ? Number.NaN : Number(draft.heightCm),
    experienceLevel: draft.experienceLevel,
    dominantHand: draft.dominantHand,
    matchFeeTry: draft.matchFeeTry.trim() === '' ? Number.NaN : Number(draft.matchFeeTry),
    availableDays: draft.availableDays,
    bio: draft.bio,
  };
}
