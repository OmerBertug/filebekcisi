// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

import Link from 'next/link';
import { ArrowUpRight, Shield } from 'lucide-react';
import { DEFAULT_LOCALE, getDictionary } from '@/i18n';

const dictionary = getDictionary(DEFAULT_LOCALE);

/**
 * Electric Pitch 404 Not Found page styled on `#0B0F12` with tactical grid overlay, `#12181F`
 * central surface panel, and `#14E777` primary navigation CTA.
 *
 * @returns Semantic `<main>` landmark displaying 404 guidance and a return link to the directory.
 */
export default function NotFoundPage(): React.JSX.Element {
  return (
    <main className="pitch-grid-bg flex min-h-screen flex-col justify-between bg-[#0B0F12] text-[#E0E3E7]">
      <header className="border-b border-white/[0.08] bg-[#0B0F12]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md border border-[#14E777]/35 bg-[#14E777]/10 text-[#14E777]">
              <Shield className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="font-heading text-sm font-bold tracking-[0.12em] text-[#F8FAFC] uppercase">
              {dictionary.meta.brandName}
            </span>
          </Link>
        </div>
      </header>

      <section className="px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-2xl rounded-xl border border-white/[0.08] bg-[#12181F]/90 p-8 backdrop-blur-md sm:p-12">
          <span className="font-heading text-xs font-bold tracking-[0.14em] text-[#14E777] uppercase">
            {dictionary.notFoundPage.codeLabel}
          </span>
          <p className="font-heading mt-3 text-6xl font-extrabold tracking-tight tabular-nums text-[#F8FAFC]">
            404
          </p>
          <h1 className="mt-4 font-heading text-2xl font-bold text-[#F8FAFC] sm:text-3xl">
            {dictionary.notFoundPage.title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#94A3B8] sm:text-base">
            {dictionary.notFoundPage.description}
          </p>
          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-md bg-[#14E777] px-6 py-3.5 font-heading text-xs font-bold tracking-wider text-[#0B0F12] uppercase shadow-[0_0_24px_-4px_rgba(20,231,119,0.28)] transition hover:bg-[#62FF95]"
            >
              <span>{dictionary.notFoundPage.returnHomeCta}</span>
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.08] bg-[#0B0F12] px-4 py-6 text-xs text-[#64748B] sm:px-8">
        <div className="mx-auto max-w-7xl">{dictionary.footer.copyrightNotice}</div>
      </footer>
    </main>
  );
}
