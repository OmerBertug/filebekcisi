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
 * Architectural square-bordered locale selector group (`tr` / `en`) inside `SiteHeader`.
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
      className="flex items-center gap-1 rounded-none border border-[#DCDCE2] bg-white p-0.5"
    >
      <Globe className="ml-1.5 h-3.5 w-3.5 text-[#636262]" aria-hidden="true" />
      {SUPPORTED_LOCALES.map((item) => {
        const isActive = item === locale;
        return (
          <button
            key={item}
            type="button"
            aria-pressed={isActive}
            onClick={() => onLocaleChange(item)}
            className={`rounded-none px-2.5 py-1 text-[11px] font-normal uppercase tracking-wider transition ${
              isActive
                ? 'bg-[#161540] text-white'
                : 'text-[#636262] hover:bg-[#F8F8FA] hover:text-[#161540]'
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
 * Top sticky institutional navigation bar structured on the 6-column architectural hairline
 * grid, presenting brand identity, direct section anchor links, and dynamic localization toggles.
 *
 * Accessibility: Uses semantic `<header>` and `<nav>` landmarks, `aria-label` on the language
 * selector group, and `aria-pressed` states for active locale buttons.
 *
 * @param props - `SiteHeaderProps` containing localization data and locale switcher callback.
 * @returns Rendered sticky institutional header element.
 */
export function SiteHeader({
  dictionary,
  locale,
  onLocaleChange,
}: SiteHeaderProps): React.JSX.Element {
  return (
    <header className="sticky top-0 z-30 border-b border-[#DCDCE2] bg-[#F8F8FA]/95 text-[#4C4C4C] backdrop-blur-md">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center lg:grid-cols-6">
        <div className="flex items-center justify-between border-b border-[#DCDCE2] px-4 py-3.5 sm:px-8 lg:col-span-2 lg:border-r lg:border-b-0">
          <a
            href="#top"
            className="flex items-center gap-3 rounded-none focus-visible:ring-2 focus-visible:ring-[#161540] focus-visible:outline-none"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-none bg-[#161540] text-white">
              <Shield className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="flex flex-col">
              <span className="text-sm font-normal tracking-[0.14em] text-[#161540] uppercase">
                {dictionary.meta.brandName}
              </span>
              <span className="hidden text-[11px] font-light tracking-wider text-[#636262] sm:inline">
                {dictionary.meta.brandTagline}
              </span>
            </span>
          </a>
        </div>

        <nav className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-8 lg:col-span-4 lg:justify-end lg:gap-7">
          <a
            href="#how-it-works"
            className="hidden text-xs font-normal tracking-[0.12em] text-[#4C4C4C] uppercase transition hover:text-[#161540] md:inline"
          >
            {dictionary.nav.howItWorks}
          </a>
          <a
            href="#directory"
            className="text-xs font-normal tracking-[0.12em] text-[#4C4C4C] uppercase transition hover:text-[#161540]"
          >
            {dictionary.nav.browseGoalkeepers}
          </a>
          <a
            href="#register-goalkeeper"
            className="inline-flex items-center gap-2 rounded-none border border-[#161540] bg-[#161540] px-4 py-2 text-xs font-normal tracking-[0.1em] text-white uppercase transition hover:bg-white hover:text-[#161540] focus-visible:ring-2 focus-visible:ring-[#161540] focus-visible:outline-none"
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
