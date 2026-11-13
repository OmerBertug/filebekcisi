// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

import { FILTER_ALL_VALUE, PLATFORM_COMMISSION_RATE } from './constants';
import type { FeeBreakdown, GoalkeeperFilterCriteria, GoalkeeperProfile } from './types';

/**
 * Computes the brokerage commission and total organizer payment for a given goalkeeper fee.
 *
 * Applies `PLATFORM_COMMISSION_RATE` (15%) and rounds to the nearest whole TRY integer to
 * prevent floating-point rounding discrepancies in UI summaries and payment requests.
 * Clamps negative inputs to zero as a defensive mathematical invariant.
 *
 * @param matchFeeTry - Base per-match fee set by the goalkeeper in TRY.
 * @returns `FeeBreakdown` containing goalkeeper payout, platform commission, and total payable TRY.
 */
export function calculateMatchFeeBreakdown(matchFeeTry: number): FeeBreakdown {
  const sanitizedBaseFee = Number.isFinite(matchFeeTry) ? Math.max(0, Math.round(matchFeeTry)) : 0;
  const platformCommissionTry = Math.round(sanitizedBaseFee * PLATFORM_COMMISSION_RATE);
  const totalPayableTry = sanitizedBaseFee + platformCommissionTry;

  return {
    goalkeeperFeeTry: sanitizedBaseFee,
    platformCommissionTry,
    totalPayableTry,
  };
}

/**
 * Filters a collection of goalkeeper profiles against organizer search criteria.
 *
 * Pure deterministic selector designed to be invoked inside `useMemo` or server queries
 * without mutating the source array.
 *
 * @param goalkeepers - Read-only list of goalkeeper profiles to evaluate.
 * @param criteria - Active district, experience tier, weekday availability, and max budget filters.
 * @returns New array of matching `GoalkeeperProfile` items preserving original ordering.
 */
export function filterGoalkeepers(
  goalkeepers: readonly GoalkeeperProfile[],
  criteria: GoalkeeperFilterCriteria,
): GoalkeeperProfile[] {
  return goalkeepers.filter((profile) => {
    if (criteria.district !== FILTER_ALL_VALUE && profile.district !== criteria.district) {
      return false;
    }

    if (
      criteria.experienceLevel !== FILTER_ALL_VALUE &&
      profile.experienceLevel !== criteria.experienceLevel
    ) {
      return false;
    }

    if (
      criteria.availableDay !== FILTER_ALL_VALUE &&
      !profile.availableDays.includes(criteria.availableDay)
    ) {
      return false;
    }

    if (criteria.maxFeeTry !== null && profile.matchFeeTry > criteria.maxFeeTry) {
      return false;
    }

    return true;
  });
}
