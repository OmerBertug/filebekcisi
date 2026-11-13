// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

import enCatalog from './locales/en.json';
import trCatalog from './locales/tr.json';
import type { AppDictionary, SupportedLocale } from './types';

/**
 * Compile-time verified dictionary registry mapping each `SupportedLocale` to its catalog.
 */
const DICTIONARIES: Readonly<Record<SupportedLocale, AppDictionary>> = {
  tr: trCatalog,
  en: enCatalog,
};

/**
 * Retrieves the typed localization dictionary corresponding to the requested locale.
 *
 * Guarantees compile-time structural completeness across both `'tr'` and `'en'` JSON catalogs
 * without runtime dynamic file parsing overhead.
 *
 * @param locale - Active UI locale identifier (`'tr'` or `'en'`).
 * @returns Immutable `AppDictionary` object containing localized strings for all UI modules.
 */
export function getDictionary(locale: SupportedLocale): AppDictionary {
  return DICTIONARIES[locale];
}
