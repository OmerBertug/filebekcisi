// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

import Link from 'next/link';
import { ArrowUpRight, Shield } from 'lucide-react';
import { DEFAULT_LOCALE, getDictionary } from '@/i18n';

const dictionary = getDictionary(DEFAULT_LOCALE);

/**
 * Institutional 404 Not Found page structured on the 6-column architectural hairline grid.
 *
 * @returns Semantic `<main>` landmark displaying 404 guidance and a return link to the directory.
 */
export default function NotFoundPage(): React.JSX.Element {
  return (
    <main className="flex min-h-screen flex-col justify-between bg-[#F8F8FA] text-[#4C4C4C]">
      <header className="border-b border-[#DCDCE2] bg-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-none bg-[#161540] text-white">
              <Shield className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="font-heading text-sm font-medium tracking-[0.14em] text-[#161540] uppercase">
              {dictionary.meta.brandName}
            </span>
          </Link>
        </div>
      </header>

      <section className="border-y border-[#DCDCE2] bg-white">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 lg:grid-cols-6">
          <div className="border-b border-[#DCDCE2] bg-[#161540] px-4 py-10 text-white sm:px-8 lg:col-span-1 lg:border-r lg:border-b-0 lg:py-20">
            <span className="block text-[11px] font-light tracking-[0.18em] text-white/65 uppercase">
              {dictionary.notFoundPage.codeLabel}
            </span>
            <p className="font-heading mt-3 text-4xl font-light tracking-tight text-white">404</p>
          </div>

          <div className="px-4 py-12 sm:px-10 lg:col-span-5 lg:py-20">
            <h1 className="max-w-2xl text-2xl font-light tracking-tight text-[#161540] sm:text-4xl">
              {dictionary.notFoundPage.title}
            </h1>
            <p className="mt-4 max-w-xl text-sm font-light leading-relaxed text-[#636262] sm:text-base">
              {dictionary.notFoundPage.description}
            </p>
            <div className="mt-8">
              <Link
                href="/"
                className="inline-flex items-center gap-2.5 rounded-none border border-[#161540] bg-[#161540] px-6 py-3.5 text-xs font-normal tracking-[0.12em] text-white uppercase transition hover:bg-white hover:text-[#161540]"
              >
                <span>{dictionary.notFoundPage.returnHomeCta}</span>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#161540] px-4 py-6 text-xs font-light text-white/65 sm:px-8">
        <div className="mx-auto max-w-[1440px]">{dictionary.footer.copyrightNotice}</div>
      </footer>
    </main>
  );
}
