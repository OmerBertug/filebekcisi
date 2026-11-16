// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

import { FILTER_ALL_VALUE, PLATFORM_COMMISSION_RATE } from './constants';
import type { FeeBreakdown, GoalkeeperFilterCriteria, GoalkeeperProfile } from './types';

/**
 * Computes the dual-sided 15% brokerage commission breakdown for a given goalkeeper listed fee:
 * - Goalkeeper receives 15% less than the listed fee (`goalkeeperNetPayoutTry = listedFeeTry - 15%`).
 * - Directory cards display the listed fee (`listedFeeTry`).
 * - Customers pay 15% commission on top of the listed fee at checkout (`totalPayableTry = listedFeeTry + 15%`).
 *
 * @param matchFeeTry - Listed per-match fee set by the goalkeeper in TRY.
 * @returns `FeeBreakdown` containing listed fee, goalkeeper net payout, customer fee, and platform revenue.
 */
export function calculateMatchFeeBreakdown(matchFeeTry: number): FeeBreakdown {
  const listedFeeTry = Number.isFinite(matchFeeTry) ? Math.max(0, Math.round(matchFeeTry)) : 0;
  const goalkeeperCutTry = Math.round(listedFeeTry * PLATFORM_COMMISSION_RATE);
  const goalkeeperNetPayoutTry = Math.max(0, listedFeeTry - goalkeeperCutTry);
  const customerCommissionTry = Math.round(listedFeeTry * PLATFORM_COMMISSION_RATE);
  const totalPayableTry = listedFeeTry + customerCommissionTry;
  const platformTotalRevenueTry = goalkeeperCutTry + customerCommissionTry;

  return {
    listedFeeTry,
    goalkeeperCutTry,
    goalkeeperNetPayoutTry,
    customerCommissionTry,
    totalPayableTry,
    platformTotalRevenueTry,
    goalkeeperFeeTry: listedFeeTry,
    platformCommissionTry: customerCommissionTry,
  };
}

/**
 * Masks the middle digits of a phone number for public display prior to booking confirmation
 * so automated scrapers cannot harvest goalkeeper contact numbers.
 *
 * @param phone - Raw goalkeeper phone number string.
 * @returns Masked phone representation preserving country/area prefix and last two digits.
 */
export function maskPhoneNumber(phone: string): string {
  const trimmed = phone.trim();
  if (trimmed.length <= 6) {
    return '***';
  }
  const prefix = trimmed.slice(0, Math.min(7, trimmed.length - 2));
  const suffix = trimmed.slice(-2);
  return `${prefix} *** ** ${suffix}`;
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
