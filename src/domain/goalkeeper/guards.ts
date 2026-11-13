// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

import { AVAILABLE_DAYS, DISTRICT_CODES, DOMINANT_HANDS, EXPERIENCE_LEVELS } from './constants';
import type { AvailableDay, DistrictCode, DominantHand, ExperienceLevel } from './types';

const DISTRICT_SET: ReadonlySet<string> = new Set<string>(DISTRICT_CODES);
const EXPERIENCE_SET: ReadonlySet<string> = new Set<string>(EXPERIENCE_LEVELS);
const HAND_SET: ReadonlySet<string> = new Set<string>(DOMINANT_HANDS);
const DAY_SET: ReadonlySet<string> = new Set<string>(AVAILABLE_DAYS);

/**
 * Runtime type guard verifying whether a raw input string is a valid `DistrictCode`.
 *
 * Used in `<select>` change handlers to narrow `HTMLSelectElement.value` safely without
 * unverified type assertions.
 *
 * @param value - Candidate string value from a DOM control or query parameter.
 * @returns `true` if `value` belongs to `DISTRICT_CODES`.
 */
export function isDistrictCode(value: string): value is DistrictCode {
  return DISTRICT_SET.has(value);
}

/**
 * Runtime type guard verifying whether a raw input string is a valid `ExperienceLevel`.
 *
 * @param value - Candidate string value from a DOM control or query parameter.
 * @returns `true` if `value` belongs to `EXPERIENCE_LEVELS`.
 */
export function isExperienceLevel(value: string): value is ExperienceLevel {
  return EXPERIENCE_SET.has(value);
}

/**
 * Runtime type guard verifying whether a raw input string is a valid `DominantHand`.
 *
 * @param value - Candidate string value from a DOM control.
 * @returns `true` if `value` belongs to `DOMINANT_HANDS`.
 */
export function isDominantHand(value: string): value is DominantHand {
  return HAND_SET.has(value);
}

/**
 * Runtime type guard verifying whether a raw input string is a valid `AvailableDay`.
 *
 * @param value - Candidate string value from a DOM control.
 * @returns `true` if `value` belongs to `AVAILABLE_DAYS`.
 */
export function isAvailableDay(value: string): value is AvailableDay {
  return DAY_SET.has(value);
}
