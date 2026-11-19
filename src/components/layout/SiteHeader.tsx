// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

'use client';

import { ArrowUpRight, Globe, Shield } from 'lucide-react';
import { SUPPORTED_LOCALES, type AppDictionary, type SupportedLocale } from '@/i18n';

/**
 * Props accepted by the `SiteHeader` navigation bar component.
 */
export interface SiteHeaderProps {
  /** Active localized copy dictionary. */
  readonly dictionary: AppDictionary;
  /** Currently selected UI locale (`'tr'` or `'en'`). */
  readonly locale: SupportedLocale;
  /** Callback triggered when the user selects a different UI locale. */
  readonly onLocaleChange: (nextLocale: SupportedLocale) => void;
}

interface LocaleSelectorGroupProps {
  readonly dictionary: AppDictionary;
  readonly locale: SupportedLocale;
  readonly onLocaleChange: (nextLocale: SupportedLocale) => void;
}

/**
 * Pill-segmented locale switcher (`tr` / `en`) styled for dark technical surfaces.
 *
 * @param props - `LocaleSelectorGroupProps` holding active locale state and toggle handler.
 * @returns Accessible `role="group"` container with pressed-state locale buttons.
 */
function LocaleSelectorGroup({
  dictionary,
  locale,
  onLocaleChange,
}: LocaleSelectorGroupProps): React.JSX.Element {
  return (
    <div
      role="group"
      aria-label={dictionary.meta.switchLocaleLabel}
      className="flex items-center gap-1 rounded-md border border-white/[0.08] bg-[#12181F] p-0.5"
    >
      <Globe className="ml-1.5 h-3.5 w-3.5 text-[#94A3B8]" aria-hidden="true" />
      {SUPPORTED_LOCALES.map((item) => {
        const isActive = item === locale;
        return (
          <button
            key={item}
            type="button"
            aria-pressed={isActive}
            onClick={() => onLocaleChange(item)}
            className={`rounded px-2.5 py-1 font-heading text-[11px] font-semibold uppercase tracking-wider transition duration-150 ${
              isActive
                ? 'bg-[#14E777] text-[#0B0F12]'
                : 'text-[#94A3B8] hover:bg-[#1A232C] hover:text-[#F8FAFC]'
            }`}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Top sticky glassmorphic navigation bar rendering Electric Pitch brand identity, direct section
 * anchor links, primary conversion CTA, and dynamic localization switcher.
 *
 * Accessibility: Uses semantic `<header>` and `<nav>` landmarks, `aria-label` on the language
 * selector group, and `aria-pressed` states for active locale buttons.
 *
 * @param props - `SiteHeaderProps` containing localization data and locale switcher callback.
 * @returns Rendered sticky dark navigation header.
 */
export function SiteHeader({
  dictionary,
  locale,
  onLocaleChange,
}: SiteHeaderProps): React.JSX.Element {
  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#0B0F12]/85 text-[#E0E3E7] backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-8">
        <a
          href="#top"
          className="flex items-center gap-3 rounded-md focus-visible:ring-2 focus-visible:ring-[#14E777] focus-visible:outline-none"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#14E777]/35 bg-[#14E777]/10 text-[#14E777]">
            <Shield className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="flex flex-col">
            <span className="font-heading text-sm font-bold tracking-[0.12em] text-[#F8FAFC] uppercase">
              {dictionary.meta.brandName}
            </span>
            <span className="hidden text-[11px] font-normal tracking-wide text-[#94A3B8] sm:inline">
              {dictionary.meta.brandTagline}
            </span>
          </span>
        </a>

        <nav className="flex flex-wrap items-center gap-4 sm:gap-6">
          <a
            href="#how-it-works"
            className="hidden text-xs font-medium tracking-wider text-[#94A3B8] uppercase transition duration-150 hover:text-[#F8FAFC] md:inline"
          >
            {dictionary.nav.howItWorks}
          </a>
          <a
            href="#directory"
            className="text-xs font-medium tracking-wider text-[#94A3B8] uppercase transition duration-150 hover:text-[#F8FAFC]"
          >
            {dictionary.nav.browseGoalkeepers}
          </a>
          <a
            href="#register-goalkeeper"
            className="inline-flex items-center gap-1.5 rounded-md bg-[#14E777] px-4 py-2 font-heading text-xs font-bold tracking-wide text-[#0B0F12] transition duration-150 hover:bg-[#62FF95] hover:shadow-[0_0_20px_-4px_rgba(20,231,119,0.5)] focus-visible:ring-2 focus-visible:ring-[#14E777] focus-visible:outline-none"
          >
            <span>{dictionary.nav.registerAsGoalkeeper}</span>
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>

          <LocaleSelectorGroup
            dictionary={dictionary}
            locale={locale}
            onLocaleChange={onLocaleChange}
          />
        </nav>
      </div>
    </header>
  );
}
