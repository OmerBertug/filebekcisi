// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { DEFAULT_LOCALE, getDictionary } from '@/i18n';
import './globals.css';

const defaultDictionary = getDictionary(DEFAULT_LOCALE);

/**
 * Self-hosted Plus Jakarta Sans variable font (`200`–`800` weight range, Latin + Latin-Extended)
 * assigned to `--font-plus-jakarta` for all architectural headings and display titles.
 */
const plusJakartaSans = localFont({
  src: [
    {
      path: './fonts/plus-jakarta-sans-latin.woff2',
      weight: '200 800',
      style: 'normal',
    },
    {
      path: './fonts/plus-jakarta-sans-latin-ext.woff2',
      weight: '200 800',
      style: 'normal',
    },
  ],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

/**
 * Self-hosted Inter variable font (`100`–`900` weight range, Latin + Latin-Extended)
 * assigned to `--font-inter` for all body copy, form inputs, and UI controls.
 */
const inter = localFont({
  src: [
    {
      path: './fonts/inter-latin.woff2',
      weight: '100 900',
      style: 'normal',
    },
    {
      path: './fonts/inter-latin-ext.woff2',
      weight: '100 900',
      style: 'normal',
    },
  ],
  variable: '--font-inter',
  display: 'swap',
});

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
 * Root HTML shell wrapping all application routes with Plus Jakarta Sans (headings) and Inter
 * (body) variable font CSS custom properties and baseline antialiasing.
 *
 * @param props - `RootLayoutProps` containing nested route nodes.
 * @returns Root `<html>` and `<body>` document tree.
 */
export default function RootLayout({ children }: RootLayoutProps): React.JSX.Element {
  return (
    <html lang={DEFAULT_LOCALE} className={`${plusJakartaSans.variable} ${inter.variable}`}>
      <body className="font-sans antialiased selection:bg-[#161540] selection:text-white">
        {children}
      </body>
    </html>
  );
}
