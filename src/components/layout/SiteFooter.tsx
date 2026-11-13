// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

import { Shield } from 'lucide-react';
import type { AppDictionary } from '@/i18n';

/**
 * Props accepted by the `SiteFooter` component.
 */
export interface SiteFooterProps {
  /** Active localized copy dictionary. */
  readonly dictionary: AppDictionary;
}

/**
 * Semantic institutional page footer aligned on the 6-column architectural grid, displaying
 * brand identity, brokerage intermediary disclaimer, and copyright metadata.
 *
 * @param props - `SiteFooterProps` providing localized footer text.
 * @returns Rendered `<footer>` landmark element.
 */
export function SiteFooter({ dictionary }: SiteFooterProps): React.JSX.Element {
  return (
    <footer className="bg-[#161540] text-white/80">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 lg:grid-cols-6">
        <div className="flex items-center gap-3 border-b border-white/15 px-4 py-8 sm:px-8 lg:col-span-1 lg:border-r lg:border-b-0">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-none border border-white/25 bg-white/10 text-white">
            <Shield className="h-4 w-4" aria-hidden="true" />
          </span>
          <p className="text-xs font-normal tracking-[0.14em] text-white uppercase">
            {dictionary.meta.brandName}
          </p>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 px-4 py-8 sm:flex-row sm:items-center sm:px-10 lg:col-span-5">
          <p className="max-w-2xl text-xs font-light leading-relaxed text-white/75">
            {dictionary.footer.brokerageDisclaimer}
          </p>
          <p className="text-xs font-light tracking-wide text-white/60">
            {dictionary.footer.copyrightNotice}
          </p>
        </div>
      </div>
    </footer>
  );
}
