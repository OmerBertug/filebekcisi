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
 * Client-side route error boundary rendered on unexpected runtime exceptions under Electric Pitch
 * dark styling with recovery actions.
 *
 * @param props - `ErrorBoundaryProps` providing the caught error and segment reset callback.
 * @returns Rendered error recovery `<main>` view.
 */
export default function GlobalErrorPage({ reset }: ErrorBoundaryProps): React.JSX.Element {
  return (
    <main className="pitch-grid-bg flex min-h-screen flex-col justify-center bg-[#0B0F12] px-4 py-16 text-[#E0E3E7] sm:px-8">
      <section className="mx-auto w-full max-w-2xl rounded-xl border border-white/[0.08] bg-[#12181F]/90 p-8 backdrop-blur-md sm:p-12">
        <span className="font-heading text-xs font-bold tracking-[0.14em] text-[#FFB4AB] uppercase">
          {dictionary.errorPage.codeLabel}
        </span>
        <h1 className="mt-4 font-heading text-2xl font-bold text-[#F8FAFC] sm:text-3xl">
          {dictionary.errorPage.title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#94A3B8] sm:text-base">
          {dictionary.errorPage.description}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-md bg-[#14E777] px-6 py-3.5 font-heading text-xs font-bold tracking-wider text-[#0B0F12] uppercase transition hover:bg-[#62FF95]"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{dictionary.errorPage.retryCta}</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md border border-white/25 bg-transparent px-6 py-3.5 font-heading text-xs font-semibold tracking-wider text-[#F8FAFC] uppercase transition hover:border-[#14E777]/50 hover:bg-white/[0.06]"
          >
            <span>{dictionary.errorPage.returnHomeCta}</span>
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
