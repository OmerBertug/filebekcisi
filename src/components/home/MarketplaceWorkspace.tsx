// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

'use client';

import { useCallback, useMemo, useState } from 'react';
import { DirectoryFilterBar } from '@/components/directory/DirectoryFilterBar';
import { GoalkeeperGrid } from '@/components/directory/GoalkeeperGrid';
import { MatchBookingPreviewModal } from '@/components/directory/MatchBookingPreviewModal';
import { HeroBanner } from '@/components/home/HeroBanner';
import { HowItWorksSection } from '@/components/home/HowItWorksSection';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { GoalkeeperRegistrationForm } from '@/components/registration/GoalkeeperRegistrationForm';
import {
  FILTER_ALL_VALUE,
  filterGoalkeepers,
  type GoalkeeperFilterCriteria,
  type GoalkeeperProfile,
} from '@/domain/goalkeeper';
import { useGoalkeepers } from '@/hooks/useGoalkeepers';
import { DEFAULT_LOCALE, getDictionary, type SupportedLocale } from '@/i18n';

const DEFAULT_FILTER_CRITERIA: GoalkeeperFilterCriteria = {
  district: FILTER_ALL_VALUE,
  experienceLevel: FILTER_ALL_VALUE,
  availableDay: FILTER_ALL_VALUE,
  maxFeeTry: null,
};

/**
 * Top-level client workspace orchestrating localization selection, goalkeeper directory filtering,
 * self-registration updates, and match checkout modal workflows under Electric Pitch dark styling.
 *
 * Performance: Derives `filteredGoalkeepers` via `useMemo` rather than duplicating filtered arrays
 * inside `useState`, and stabilizes callback references passed to memoized child cards.
 *
 * @returns Complete interactive marketplace page layout.
 */
export function MarketplaceWorkspace(): React.JSX.Element {
  const [locale, setLocale] = useState<SupportedLocale>(DEFAULT_LOCALE);
  const [criteria, setCriteria] = useState<GoalkeeperFilterCriteria>(DEFAULT_FILTER_CRITERIA);
  const [selectedProfile, setSelectedProfile] = useState<GoalkeeperProfile | null>(null);

  const { goalkeepers, requestState, errorCode, prependGoalkeeper, reload } = useGoalkeepers();
  const dictionary = getDictionary(locale);

  const filteredGoalkeepers = useMemo(
    () => filterGoalkeepers(goalkeepers, criteria),
    [goalkeepers, criteria],
  );

  const handleResetFilters = useCallback((): void => {
    setCriteria(DEFAULT_FILTER_CRITERIA);
  }, []);

  const handleSelectForMatch = useCallback((profile: GoalkeeperProfile): void => {
    setSelectedProfile(profile);
  }, []);

  const handleCloseModal = useCallback((): void => {
    setSelectedProfile(null);
  }, []);

  const handleGoalkeeperRegistered = useCallback(
    (newProfile: GoalkeeperProfile): void => {
      prependGoalkeeper(newProfile);
      setCriteria(DEFAULT_FILTER_CRITERIA);
    },
    [prependGoalkeeper],
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#0B0F12] text-[#E0E3E7]">
      <SiteHeader dictionary={dictionary} locale={locale} onLocaleChange={setLocale} />

      <main className="flex-1">
        <HeroBanner dictionary={dictionary} registeredCount={goalkeepers.length} />
        <HowItWorksSection dictionary={dictionary} />

        <section id="directory" className="border-b border-white/[0.06] bg-[#0B0F12] py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-8">
            <div className="mb-8">
              <span className="font-heading text-xs font-bold tracking-[0.12em] text-[#14E777] uppercase">
                03 // ROSTER
              </span>
              <h2 className="mt-2 font-heading text-2xl font-bold tracking-[-0.02em] text-[#F8FAFC] sm:text-4xl">
                {dictionary.filters.sectionTitle}
              </h2>
              <p className="mt-2 max-w-2xl text-base text-[#94A3B8]">
                {dictionary.filters.sectionSubtitle}
              </p>
            </div>

            <DirectoryFilterBar
              dictionary={dictionary}
              criteria={criteria}
              resultCount={filteredGoalkeepers.length}
              onCriteriaChange={setCriteria}
              onReset={handleResetFilters}
            />

            <GoalkeeperGrid
              goalkeepers={filteredGoalkeepers}
              requestState={requestState}
              errorCode={errorCode}
              dictionary={dictionary}
              onRetry={reload}
              onSelectForMatch={handleSelectForMatch}
            />
          </div>
        </section>

        <GoalkeeperRegistrationForm
          dictionary={dictionary}
          onGoalkeeperRegistered={handleGoalkeeperRegistered}
        />
      </main>

      <SiteFooter dictionary={dictionary} />

      <MatchBookingPreviewModal
        profile={selectedProfile}
        dictionary={dictionary}
        onClose={handleCloseModal}
      />
    </div>
  );
}
