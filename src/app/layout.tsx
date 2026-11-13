// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

import type { Metadata } from 'next';
import { DEFAULT_LOCALE, getDictionary } from '@/i18n';
import './globals.css';

const defaultDictionary = getDictionary(DEFAULT_LOCALE);

/**
 * Document metadata resolved from the centralized localization catalog.
 */
export const metadata: Metadata = {
  title: `${defaultDictionary.meta.brandName} — ${defaultDictionary.meta.brandTagline}`,
  description: defaultDictionary.hero.subtitle,
};

/**
 * Props accepted by the Next.js App Router `RootLayout`.
 */
export interface RootLayoutProps {
  readonly children: React.ReactNode;
}

/**
 * Root HTML shell wrapping all application routes with baseline typography and antialiasing.
 *
 * @param props - `RootLayoutProps` containing nested route nodes.
 * @returns Root `<html>` and `<body>` document tree.
 */
export default function RootLayout({ children }: RootLayoutProps): React.JSX.Element {
  return (
    <html lang={DEFAULT_LOCALE}>
      <body className="antialiased selection:bg-emerald-200 selection:text-slate-900">
        {children}
      </body>
    </html>
  );
}
