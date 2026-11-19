// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { DEFAULT_LOCALE, getDictionary } from '@/i18n';
import './globals.css';

const defaultDictionary = getDictionary(DEFAULT_LOCALE);

/**
 * Self-hosted Geist variable font (`100`–`900` weight range, Latin + Latin-Extended)
 * assigned to `--font-geist` for headings, tactical display metrics, and monospaced indexes.
 */
const geist = localFont({
  src: [
    {
      path: './fonts/geist-latin.woff2',
      weight: '100 900',
      style: 'normal',
    },
    {
      path: './fonts/geist-latin-ext.woff2',
      weight: '100 900',
      style: 'normal',
    },
  ],
  variable: '--font-geist',
  display: 'swap',
});

/**
 * Self-hosted Inter variable font (`100`–`900` weight range, Latin + Latin-Extended)
 * assigned to `--font-inter` for sustained legibility across body copy and dense forms.
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
 * Root HTML shell wrapping all application routes with Electric Pitch dark theming (`#0B0F12`),
 * Geist (headings) and Inter (body) variable font CSS custom properties, and antialiasing.
 *
 * @param props - `RootLayoutProps` containing nested route nodes.
 * @returns Root `<html>` and `<body>` document tree.
 */
export default function RootLayout({ children }: RootLayoutProps): React.JSX.Element {
  return (
    <html lang={DEFAULT_LOCALE} className={`${geist.variable} ${inter.variable}`}>
      <body className="bg-[#0B0F12] font-sans text-[#E0E3E7] antialiased selection:bg-[#14E777] selection:text-[#0B0F12]">
        {children}
      </body>
    </html>
  );
}
