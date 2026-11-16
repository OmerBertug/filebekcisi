// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

import { ArrowUpRight } from 'lucide-react';
import type { AppDictionary } from '@/i18n';

/**
 * Props accepted by the `HeroBanner` landing section component.
 */
export interface HeroBannerProps {
  /** Active localized copy dictionary. */
  readonly dictionary: AppDictionary;
  /** Total count of currently registered goalkeepers displayed in the live metric cell. */
  readonly registeredCount: number;
}

interface HeroMetricBarProps {
  readonly dictionary: AppDictionary;
  readonly registeredCount: number;
}

/**
 * Hairline-divided 3-column platform KPI row aligned beneath the main hero editorial cell.
 *
 * @param props - `HeroMetricBarProps` providing localized labels and live keeper count.
 * @returns Rendered metric row on the 6-column architectural grid.
 */
function HeroMetricBar({ dictionary, registeredCount }: HeroMetricBarProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 border-t border-white/15 lg:grid-cols-6">
      <div className="hidden border-r border-white/15 px-8 py-6 lg:col-span-1 lg:block" />
      <dl className="grid grid-cols-1 divide-y divide-white/15 sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:col-span-5">
        <div className="px-4 py-6 sm:px-10">
          <dt className="text-[11px] font-light tracking-[0.14em] text-white/65 uppercase">
            {dictionary.hero.statsActiveKeepers}
          </dt>
          <dd className="font-heading mt-2 text-3xl font-light tracking-tight text-white">
            {registeredCount}
          </dd>
        </div>
        <div className="px-4 py-6 sm:px-10">
          <dt className="text-[11px] font-light tracking-[0.14em] text-white/65 uppercase">
            {dictionary.hero.statsCommissionRate}
          </dt>
          <dd className="font-heading mt-2 text-3xl font-light tracking-tight text-white">
            {dictionary.hero.commissionPercentValue}
          </dd>
        </div>
        <div className="px-4 py-6 sm:px-10">
          <dt className="text-[11px] font-light tracking-[0.14em] text-white/65 uppercase">
            {dictionary.hero.statsSafeEscrow}
          </dt>
          <dd className="font-heading mt-2 text-3xl font-light tracking-tight text-white">
            {dictionary.hero.safeEscrowValue}
          </dd>
        </div>
      </dl>
    </div>
  );
}

/**
 * Institutional hero banner structured on a 6-column architectural hairline grid with deep navy
 * backdrop (`#161540`), light editorial heading, rectangular CTAs, and transparent commission note.
 *
 * @param props - `HeroBannerProps` containing localized copy and live goalkeeper count.
 * @returns Rendered hero `<section>` element.
 */
export function HeroBanner({ dictionary, registeredCount }: HeroBannerProps): React.JSX.Element {
  return (
    <section id="top" className="border-b border-[#DCDCE2] bg-[#161540] text-white">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid grid-cols-1 lg:grid-cols-6">
          <div className="border-b border-white/15 px-4 py-6 sm:px-8 lg:col-span-1 lg:border-r lg:border-b-0 lg:py-16">
            <span className="block text-[11px] font-light tracking-[0.18em] text-white/55 uppercase">
              01 // PLATFORM
            </span>
            <p className="mt-3 text-xs font-light tracking-[0.14em] text-white/85 uppercase">
              {dictionary.hero.badge}
            </p>
          </div>

          <div className="px-4 py-12 sm:px-10 lg:col-span-5 lg:py-20">
            <h1 className="max-w-4xl text-3xl font-light tracking-tight text-white sm:text-5xl lg:leading-[1.14]">
              {dictionary.hero.title}
            </h1>

            <p className="mt-6 max-w-3xl text-base font-light leading-relaxed text-white/80 sm:text-lg">
              {dictionary.hero.subtitle}
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="#directory"
                className="inline-flex items-center gap-3 rounded-none border border-white bg-white px-7 py-3.5 text-xs font-normal tracking-[0.12em] text-[#161540] uppercase transition hover:bg-transparent hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
              >
                <span>{dictionary.hero.primaryCta}</span>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>

              <a
                href="#register-goalkeeper"
                className="inline-flex items-center gap-3 rounded-none border border-white/35 bg-transparent px-7 py-3.5 text-xs font-normal tracking-[0.12em] text-white uppercase transition hover:border-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
              >
                <span>{dictionary.hero.secondaryCta}</span>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>

            <p className="mt-8 border-t border-white/15 pt-5 text-xs font-light tracking-wide text-white/65">
              {dictionary.hero.commissionNote}
            </p>
          </div>
        </div>

        <HeroMetricBar dictionary={dictionary} registeredCount={registeredCount} />
      </div>
    </section>
  );
}
