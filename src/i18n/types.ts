// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

import type {
  ApiErrorCode,
  AvailableDay,
  DistrictCode,
  DominantHand,
  ExperienceLevel,
  ValidationErrorCode,
} from '@/domain/goalkeeper';

/**
 * Supported locale codes available in the platform localization switcher.
 */
export const SUPPORTED_LOCALES = ['tr', 'en'] as const;

/**
 * Union type of supported UI locales (`'tr' | 'en'`).
 */
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/**
 * Default locale rendered when the application initializes.
 */
export const DEFAULT_LOCALE: SupportedLocale = 'tr';

/**
 * Strongly typed localization catalog contract guaranteeing parity across all locale JSON files.
 * Prevents hardcoded copy inside UI components and domain logic.
 */
export interface AppDictionary {
  readonly meta: {
    readonly brandName: string;
    readonly brandTagline: string;
    readonly switchLocaleLabel: string;
  };
  readonly nav: {
    readonly browseGoalkeepers: string;
    readonly registerAsGoalkeeper: string;
    readonly howItWorks: string;
  };
  readonly hero: {
    readonly badge: string;
    readonly title: string;
    readonly subtitle: string;
    readonly primaryCta: string;
    readonly secondaryCta: string;
    readonly commissionNote: string;
    readonly statsActiveKeepers: string;
    readonly statsCommissionRate: string;
    readonly statsSafeEscrow: string;
    readonly commissionPercentValue: string;
    readonly safeEscrowValue: string;
  };
  readonly howItWorks: {
    readonly sectionTitle: string;
    readonly step1Title: string;
    readonly step1Desc: string;
    readonly step2Title: string;
    readonly step2Desc: string;
    readonly step3Title: string;
    readonly step3Desc: string;
  };
  readonly filters: {
    readonly sectionTitle: string;
    readonly sectionSubtitle: string;
    readonly districtLabel: string;
    readonly allDistricts: string;
    readonly experienceLabel: string;
    readonly allExperiences: string;
    readonly dayLabel: string;
    readonly allDays: string;
    readonly maxBudgetLabel: string;
    readonly anyBudget: string;
    readonly resetFilters: string;
    readonly resultsCountSuffix: string;
    readonly currencySymbol: string;
  };
  readonly card: {
    readonly verifiedBadge: string;
    readonly newBadge: string;
    readonly ageUnit: string;
    readonly heightUnit: string;
    readonly matchesCompletedSuffix: string;
    readonly dominantHandPrefix: string;
    readonly availableDaysLabel: string;
    readonly goalkeeperFeeLabel: string;
    readonly totalWithCommissionLabel: string;
    readonly inviteButton: string;
  };
  readonly grid: {
    readonly loadingMessage: string;
    readonly errorMessage: string;
    readonly retryButton: string;
    readonly emptyTitle: string;
    readonly emptyDescription: string;
  };
  readonly bookingModal: {
    readonly title: string;
    readonly subtitle: string;
    readonly closeAriaLabel: string;
    readonly feeSummaryTitle: string;
    readonly goalkeeperNetLabel: string;
    readonly commissionLabel: string;
    readonly totalPayableLabel: string;
    readonly contactPhoneLabel: string;
    readonly organizerNotice: string;
    readonly confirmRequestButton: string;
    readonly requestSentMessage: string;
  };
  readonly registration: {
    readonly sectionBadge: string;
    readonly sectionTitle: string;
    readonly sectionSubtitle: string;
    readonly fullNameLabel: string;
    readonly fullNamePlaceholder: string;
    readonly phoneLabel: string;
    readonly phonePlaceholder: string;
    readonly districtLabel: string;
    readonly ageLabel: string;
    readonly heightLabel: string;
    readonly experienceLabel: string;
    readonly dominantHandLabel: string;
    readonly matchFeeLabel: string;
    readonly feePreviewGoalkeeperGets: string;
    readonly feePreviewOrganizerPays: string;
    readonly availableDaysLabel: string;
    readonly availableDaysHint: string;
    readonly bioLabel: string;
    readonly bioPlaceholder: string;
    readonly submitButton: string;
    readonly submittingButton: string;
    readonly successMessage: string;
  };
  readonly districts: Readonly<Record<DistrictCode, string>>;
  readonly experienceLevels: Readonly<Record<ExperienceLevel, string>>;
  readonly dominantHands: Readonly<Record<DominantHand, string>>;
  readonly days: Readonly<Record<AvailableDay, string>>;
  readonly daysShort: Readonly<Record<AvailableDay, string>>;
  readonly validation: Readonly<Record<ValidationErrorCode, string>>;
  readonly apiErrors: Readonly<Record<ApiErrorCode, string>>;
  readonly footer: {
    readonly copyrightNotice: string;
    readonly brokerageDisclaimer: string;
  };
}
