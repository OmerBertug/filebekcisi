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
 * self-registration updates, and match invitation modal previews inside a 6-column architectural grid.
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
    <div className="flex min-h-screen flex-col bg-[#F8F8FA] text-[#4C4C4C]">
      <SiteHeader dictionary={dictionary} locale={locale} onLocaleChange={setLocale} />

      <main className="flex-1">
        <HeroBanner dictionary={dictionary} registeredCount={goalkeepers.length} />
        <HowItWorksSection dictionary={dictionary} />

        <section id="directory" className="border-b border-[#DCDCE2] bg-[#F8F8FA]">
          <div className="mx-auto grid max-w-[1440px] grid-cols-1 border-b border-[#DCDCE2] lg:grid-cols-6">
            <div className="border-b border-[#DCDCE2] px-4 py-8 sm:px-8 lg:col-span-1 lg:border-r lg:border-b-0">
              <span className="block text-[11px] font-light tracking-[0.18em] text-[#636262] uppercase">
                03
              </span>
              <h2 className="mt-2 text-sm font-light tracking-[0.14em] text-[#161540] uppercase">
                {dictionary.filters.sectionTitle}
              </h2>
            </div>

            <div className="px-4 py-8 sm:px-10 lg:col-span-5">
              <p className="text-xl font-light text-[#4C4C4C] sm:text-2xl">
                {dictionary.filters.sectionSubtitle}
              </p>
            </div>
          </div>

          <div className="mx-auto grid max-w-[1440px] grid-cols-1 lg:grid-cols-6">
            <div className="hidden border-r border-[#DCDCE2] bg-[#E8E8EC]/35 lg:col-span-1 lg:block" />
            <div className="px-4 py-10 sm:px-10 lg:col-span-5">
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
