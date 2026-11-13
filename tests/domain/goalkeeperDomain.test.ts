// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

import { describe, expect, it } from 'vitest';
import {
  FILTER_ALL_VALUE,
  INITIAL_GOALKEEPER_FORM_DRAFT,
  VALIDATION_ERROR_CODES,
  buildCandidateGoalkeeperInput,
  calculateMatchFeeBreakdown,
  filterGoalkeepers,
  isAvailableDay,
  isDistrictCode,
  isDominantHand,
  isExperienceLevel,
  validateCreateGoalkeeperInput,
  type GoalkeeperProfile,
} from '@/domain/goalkeeper';

const SAMPLE_PROFILES: readonly GoalkeeperProfile[] = [
  {
    id: 'gk-1',
    fullName: 'Alex Morgan',
    district: 'istanbul_kadikoy',
    age: 25,
    heightCm: 187,
    experienceLevel: 'semi_pro',
    dominantHand: 'right',
    matchFeeTry: 400,
    phone: '+90 532 111 22 33',
    availableDays: ['tuesday', 'saturday'],
    bio: 'Experienced turf goalkeeper with reliable command of the penalty area.',
    rating: 4.9,
    completedMatches: 18,
    isVerified: true,
    createdAt: '2026-10-01T10:00:00.000Z',
  },
  {
    id: 'gk-2',
    fullName: 'Samir Kaya',
    district: 'ankara_cankaya',
    age: 29,
    heightCm: 190,
    experienceLevel: 'veteran',
    dominantHand: 'left',
    matchFeeTry: 600,
    phone: '+90 533 444 55 66',
    availableDays: ['friday', 'sunday'],
    bio: 'Eight seasons of competitive six-a-side matches and tournament finals.',
    rating: 5.0,
    completedMatches: 42,
    isVerified: true,
    createdAt: '2026-10-05T10:00:00.000Z',
  },
];

describe('calculateMatchFeeBreakdown', () => {
  it('computes 15 percent commission and total payable amount accurately', () => {
    const breakdown = calculateMatchFeeBreakdown(400);
    expect(breakdown).toEqual({
      goalkeeperFeeTry: 400,
      platformCommissionTry: 60,
      totalPayableTry: 460,
    });
  });

  it('clamps negative or non-finite inputs to zero', () => {
    expect(calculateMatchFeeBreakdown(-250)).toEqual({
      goalkeeperFeeTry: 0,
      platformCommissionTry: 0,
      totalPayableTry: 0,
    });
    expect(calculateMatchFeeBreakdown(Number.NaN)).toEqual({
      goalkeeperFeeTry: 0,
      platformCommissionTry: 0,
      totalPayableTry: 0,
    });
  });
});

describe('filterGoalkeepers', () => {
  it('returns all profiles when all filter criteria are set to sentinel all/null', () => {
    const result = filterGoalkeepers(SAMPLE_PROFILES, {
      district: FILTER_ALL_VALUE,
      experienceLevel: FILTER_ALL_VALUE,
      availableDay: FILTER_ALL_VALUE,
      maxFeeTry: null,
    });
    expect(result).toHaveLength(2);
  });

  it('filters accurately by district, weekday, experience tier, and max fee', () => {
    const byDistrict = filterGoalkeepers(SAMPLE_PROFILES, {
      district: 'ankara_cankaya',
      experienceLevel: FILTER_ALL_VALUE,
      availableDay: 'sunday',
      maxFeeTry: 650,
    });
    expect(byDistrict).toHaveLength(1);
    expect(byDistrict[0]?.id).toBe('gk-2');

    const overBudget = filterGoalkeepers(SAMPLE_PROFILES, {
      district: FILTER_ALL_VALUE,
      experienceLevel: FILTER_ALL_VALUE,
      availableDay: FILTER_ALL_VALUE,
      maxFeeTry: 350,
    });
    expect(overBudget).toHaveLength(0);
  });
});

describe('validateCreateGoalkeeperInput & guards', () => {
  it('accepts valid boundary inputs', () => {
    const candidate = buildCandidateGoalkeeperInput({
      ...INITIAL_GOALKEEPER_FORM_DRAFT,
      fullName: 'Deniz Arslan',
      phone: '+90 555 123 45 67',
      age: '16',
      heightCm: '215',
      matchFeeTry: '5000',
      bio: 'Consistent shot-stopper ready for competitive evening turf matches.',
    });

    const result = validateCreateGoalkeeperInput(candidate);
    expect(result.ok).toBe(true);
  });

  it('returns structured field error codes for out-of-range or empty inputs', () => {
    const candidate = buildCandidateGoalkeeperInput({
      fullName: 'A',
      phone: '123',
      district: 'istanbul_kadikoy',
      age: '14',
      heightCm: '140',
      experienceLevel: 'amateur',
      dominantHand: 'right',
      matchFeeTry: '50',
      availableDays: [],
      bio: 'Too short',
    });

    const result = validateCreateGoalkeeperInput(candidate);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.fullName).toBe(VALIDATION_ERROR_CODES.INVALID_NAME);
      expect(result.error.phone).toBe(VALIDATION_ERROR_CODES.INVALID_PHONE);
      expect(result.error.age).toBe(VALIDATION_ERROR_CODES.INVALID_AGE);
      expect(result.error.heightCm).toBe(VALIDATION_ERROR_CODES.INVALID_HEIGHT);
      expect(result.error.matchFeeTry).toBe(VALIDATION_ERROR_CODES.INVALID_FEE);
      expect(result.error.availableDays).toBe(VALIDATION_ERROR_CODES.EMPTY_DAYS);
      expect(result.error.bio).toBe(VALIDATION_ERROR_CODES.INVALID_BIO);
    }
  });

  it('narrows enum strings accurately via runtime guards', () => {
    expect(isDistrictCode('istanbul_kadikoy')).toBe(true);
    expect(isDistrictCode('unknown_city')).toBe(false);
    expect(isExperienceLevel('academy')).toBe(true);
    expect(isExperienceLevel('legend')).toBe(false);
    expect(isDominantHand('both')).toBe(true);
    expect(isDominantHand('none')).toBe(false);
    expect(isAvailableDay('monday')).toBe(true);
    expect(isAvailableDay('funday')).toBe(false);
  });
});
