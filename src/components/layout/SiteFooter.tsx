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
 * Semantic dark footer presenting platform brand mark, brokerage disclaimer, and copyright metadata
 * aligned inside the 1280px (`max-w-7xl`) layout container.
 *
 * @param props - `SiteFooterProps` providing localized footer text.
 * @returns Rendered `<footer>` landmark element.
 */
export function SiteFooter({ dictionary }: SiteFooterProps): React.JSX.Element {
  return (
    <footer className="border-t border-white/[0.08] bg-[#0B0F12] py-10 text-[#94A3B8]">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 sm:flex-row sm:items-center sm:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#14E777]/30 bg-[#14E777]/10 text-[#14E777]">
            <Shield className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="font-heading text-xs font-bold tracking-[0.14em] text-[#F8FAFC] uppercase">
            {dictionary.meta.brandName}
          </span>
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          <p className="max-w-2xl text-xs leading-relaxed text-[#94A3B8]">
            {dictionary.footer.brokerageDisclaimer}
          </p>
          <p className="text-xs text-[#64748B]">{dictionary.footer.copyrightNotice}</p>
        </div>
      </div>
    </footer>
  );
}
