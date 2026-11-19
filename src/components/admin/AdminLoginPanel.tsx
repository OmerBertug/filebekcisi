// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

'use client';

import { useState, type FormEvent } from 'react';
import { AlertCircle, ArrowUpRight, Lock } from 'lucide-react';
import { API_ERROR_CODES, type ApiErrorCode } from '@/domain/goalkeeper';
import type { AppDictionary } from '@/i18n';

/**
 * Props accepted by the `AdminLoginPanel` authentication form component.
 */
export interface AdminLoginPanelProps {
  /** Active localized copy dictionary. */
  readonly dictionary: AppDictionary;
  /** Whether a login request is currently in flight. */
  readonly isSubmitting: boolean;
  /** Active authentication error code, or `null` when none. */
  readonly errorCode: ApiErrorCode | null;
  /** Callback submitting the administrator password to the server session endpoint. */
  readonly onSubmitPassword: (password: string) => Promise<void>;
}

/**
 * Restricted administrator password login gate styled under the Electric Pitch dark system.
 *
 * @param props - `AdminLoginPanelProps` providing localized copy, loading status, and submit callback.
 * @returns Rendered administrator login `<section>` element.
 */
export function AdminLoginPanel({
  dictionary,
  isSubmitting,
  errorCode,
  onSubmitPassword,
}: AdminLoginPanelProps): React.JSX.Element {
  const [password, setPassword] = useState<string>('');

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (password.trim().length === 0) {
      return;
    }
    void onSubmitPassword(password);
  };

  const errorMessage =
    errorCode === API_ERROR_CODES.UNAUTHORIZED
      ? dictionary.admin.invalidCredentials
      : errorCode !== null
        ? dictionary.apiErrors[errorCode]
        : null;

  return (
    <section className="pitch-grid-bg relative border-b border-white/[0.06] bg-[#0B0F12] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="mx-auto max-w-lg rounded-xl border border-white/[0.08] bg-[#12181F]/90 p-6 backdrop-blur-md sm:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#14E777]/35 bg-[#14E777]/10 px-3 py-1 font-heading text-[11px] font-bold tracking-[0.12em] text-[#14E777] uppercase">
            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{dictionary.admin.badge}</span>
          </div>

          <h1 className="mt-4 font-heading text-2xl font-bold text-[#F8FAFC]">
            {dictionary.admin.loginTitle}
          </h1>
          <p className="mt-2 text-sm text-[#94A3B8]">{dictionary.admin.loginSubtitle}</p>

          <form noValidate onSubmit={handleFormSubmit} className="mt-6">
            <div>
              <label
                htmlFor="admin-password"
                className="block font-heading text-xs font-semibold tracking-wide text-[#E0E3E7]"
              >
                {dictionary.admin.passwordLabel}
              </label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                placeholder={dictionary.admin.passwordPlaceholder}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-md border border-white/[0.12] bg-[#0B0F12] px-3.5 py-2.5 text-sm text-[#F8FAFC] placeholder:text-[#64748B] transition duration-150 focus:border-[#14E777] focus:ring-1 focus:ring-[#14E777] focus:outline-none"
              />
            </div>

            {errorMessage !== null && (
              <div
                role="alert"
                className="mt-4 flex items-center gap-2 rounded-md border border-[#FFB4AB]/30 bg-[#93000A]/30 p-3 text-xs font-medium text-[#FFDBD6]"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-[#FFB4AB]" aria-hidden="true" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || password.trim().length === 0}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#14E777] py-3.5 font-heading text-xs font-bold tracking-wider text-[#0B0F12] uppercase shadow-[0_0_24px_-4px_rgba(20,231,119,0.28)] transition duration-150 hover:bg-[#62FF95] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span>
                {isSubmitting ? dictionary.admin.loggingInButton : dictionary.admin.loginButton}
              </span>
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
