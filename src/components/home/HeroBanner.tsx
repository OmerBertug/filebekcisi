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
 * Three-column glassmorphic KPI row aligned inside the hero container with tabular numerals.
 *
 * @param props - `HeroMetricBarProps` providing localized metric labels and active keeper total.
 * @returns Rendered 3-column metric card grid.
 */
function HeroMetricBar({ dictionary, registeredCount }: HeroMetricBarProps): React.JSX.Element {
  return (
    <dl className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-lg border border-white/[0.08] bg-[#12181F]/90 p-5 backdrop-blur-md">
        <dt className="font-heading text-xs font-semibold tracking-[0.08em] text-[#94A3B8] uppercase">
          {dictionary.hero.statsActiveKeepers}
        </dt>
        <dd className="font-heading mt-2 text-3xl font-bold tracking-[-0.02em] text-[#14E777] tabular-nums">
          {registeredCount}
        </dd>
      </div>
      <div className="rounded-lg border border-white/[0.08] bg-[#12181F]/90 p-5 backdrop-blur-md">
        <dt className="font-heading text-xs font-semibold tracking-[0.08em] text-[#94A3B8] uppercase">
          {dictionary.hero.statsCommissionRate}
        </dt>
        <dd className="font-heading mt-2 text-3xl font-bold tracking-[-0.02em] text-[#F8FAFC] tabular-nums">
          {dictionary.hero.commissionPercentValue}
        </dd>
      </div>
      <div className="rounded-lg border border-white/[0.08] bg-[#12181F]/90 p-5 backdrop-blur-md">
        <dt className="font-heading text-xs font-semibold tracking-[0.08em] text-[#94A3B8] uppercase">
          {dictionary.hero.statsSafeEscrow}
        </dt>
        <dd className="font-heading mt-2 text-3xl font-bold tracking-[-0.02em] text-[#F8FAFC] tabular-nums">
          {dictionary.hero.safeEscrowValue}
        </dd>
      </div>
    </dl>
  );
}

/**
 * Electric Pitch hero banner anchored on `#0B0F12` with tactical pitch gridlines, ambient emerald
 * floodlight glow, Geist display typography, dual high-contrast CTAs, and live KPI cards.
 *
 * @param props - `HeroBannerProps` containing localized copy and live goalkeeper count.
 * @returns Rendered hero `<section>` element.
 */
export function HeroBanner({ dictionary, registeredCount }: HeroBannerProps): React.JSX.Element {
  return (
    <section
      id="top"
      className="pitch-grid-bg relative overflow-hidden border-b border-white/[0.06] bg-[#0B0F12]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(20,231,119,0.12),transparent_60%)]"
      />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-8 lg:py-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#14E777]/35 bg-[#14E777]/10 px-3.5 py-1 font-heading text-xs font-bold tracking-[0.12em] text-[#14E777] uppercase">
          <span>01 //</span>
          <span>{dictionary.hero.badge}</span>
        </span>

        <h1 className="mt-6 max-w-4xl font-heading text-4xl font-extrabold tracking-[-0.03em] text-[#F8FAFC] sm:text-[56px] sm:leading-[64px]">
          {dictionary.hero.title}
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#94A3B8] sm:text-lg">
          {dictionary.hero.subtitle}
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-4">
          <a
            href="#directory"
            className="inline-flex items-center gap-2 rounded-md bg-[#14E777] px-6 py-3.5 font-heading text-sm font-bold text-[#0B0F12] shadow-[0_0_24px_-4px_rgba(20,231,119,0.3)] transition duration-150 hover:bg-[#62FF95] hover:shadow-[0_0_28px_-2px_rgba(20,231,119,0.5)] focus-visible:ring-2 focus-visible:ring-[#14E777] focus-visible:outline-none"
          >
            <span>{dictionary.hero.primaryCta}</span>
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>

          <a
            href="#register-goalkeeper"
            className="inline-flex items-center gap-2 rounded-md border border-white/25 bg-transparent px-6 py-3.5 font-heading text-sm font-semibold text-[#F8FAFC] transition duration-150 hover:border-[#14E777]/50 hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-[#14E777] focus-visible:outline-none"
          >
            <span>{dictionary.hero.secondaryCta}</span>
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>

        <p className="mt-8 border-t border-white/[0.06] pt-5 text-xs text-[#94A3B8]">
          {dictionary.hero.commissionNote}
        </p>

        <HeroMetricBar dictionary={dictionary} registeredCount={registeredCount} />
      </div>
    </section>
  );
}
