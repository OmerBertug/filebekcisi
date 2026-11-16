// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

'use client';

import Link from 'next/link';
import { ArrowUpRight, RotateCcw } from 'lucide-react';
import { DEFAULT_LOCALE, getDictionary } from '@/i18n';

const dictionary = getDictionary(DEFAULT_LOCALE);

/**
 * Props injected by the Next.js App Router into the route error boundary component.
 */
export interface ErrorBoundaryProps {
  /** Caught runtime error instance. */
  readonly error: Error & { readonly digest?: string };
  /** Callback attempting to re-render the failed route segment. */
  readonly reset: () => void;
}

/**
 * Client-side route error boundary rendered on unexpected runtime exceptions, styled on the
 * 6-column architectural hairline grid with recovery actions.
 *
 * @param props - `ErrorBoundaryProps` providing the caught error and segment reset callback.
 * @returns Rendered error recovery `<main>` view.
 */
export default function GlobalErrorPage({ reset }: ErrorBoundaryProps): React.JSX.Element {
  return (
    <main className="flex min-h-screen flex-col justify-center bg-[#F8F8FA] text-[#4C4C4C]">
      <section className="border-y border-[#DCDCE2] bg-white">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 lg:grid-cols-6">
          <div className="border-b border-[#DCDCE2] bg-[#161540] px-4 py-10 text-white sm:px-8 lg:col-span-1 lg:border-r lg:border-b-0 lg:py-16">
            <span className="block text-[11px] font-light tracking-[0.18em] text-white/65 uppercase">
              {dictionary.errorPage.codeLabel}
            </span>
          </div>

          <div className="px-4 py-12 sm:px-10 lg:col-span-5 lg:py-16">
            <h1 className="max-w-2xl text-2xl font-light tracking-tight text-[#161540] sm:text-4xl">
              {dictionary.errorPage.title}
            </h1>
            <p className="mt-4 max-w-xl text-sm font-light leading-relaxed text-[#636262] sm:text-base">
              {dictionary.errorPage.description}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-none border border-[#161540] bg-[#161540] px-6 py-3.5 text-xs font-normal tracking-[0.12em] text-white uppercase transition hover:bg-white hover:text-[#161540]"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{dictionary.errorPage.retryCta}</span>
              </button>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-none border border-[#DCDCE2] bg-[#F8F8FA] px-6 py-3.5 text-xs font-normal tracking-[0.12em] text-[#161540] uppercase transition hover:border-[#161540] hover:bg-white"
              >
                <span>{dictionary.errorPage.returnHomeCta}</span>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
