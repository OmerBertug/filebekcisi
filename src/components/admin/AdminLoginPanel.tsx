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
 * Restricted administrator password login gate styled on the 6-column architectural hairline grid.
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
    <section className="border-b border-[#DCDCE2] bg-[#F8F8FA]">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 lg:grid-cols-6">
        <div className="border-b border-[#DCDCE2] bg-[#161540] px-4 py-10 text-white sm:px-8 lg:col-span-1 lg:border-r lg:border-b-0 lg:py-20">
          <Lock className="h-5 w-5 text-white/80" aria-hidden="true" />
          <p className="mt-4 text-xs font-light tracking-[0.16em] text-white/80 uppercase">
            {dictionary.admin.badge}
          </p>
        </div>

        <div className="px-4 py-12 sm:px-10 lg:col-span-5 lg:py-20">
          <div className="max-w-lg rounded-none border border-[#DCDCE2] bg-white p-6 sm:p-10">
            <h1 className="text-2xl font-light text-[#161540]">{dictionary.admin.loginTitle}</h1>
            <p className="mt-2 text-sm font-light text-[#636262]">
              {dictionary.admin.loginSubtitle}
            </p>

            <form noValidate onSubmit={handleFormSubmit} className="mt-6">
              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-[11px] font-normal tracking-[0.08em] text-[#4C4C4C] uppercase"
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
                  className="mt-2 w-full rounded-none border border-[#DCDCE2] bg-[#F8F8FA] px-3.5 py-2.5 text-sm font-light text-[#161540] transition focus:border-[#161540] focus:bg-white focus:outline-none"
                />
              </div>

              {errorMessage !== null && (
                <div
                  role="alert"
                  className="mt-4 flex items-center gap-2 rounded-none border border-red-300 bg-red-50 p-3 text-xs font-normal text-red-900"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-700" aria-hidden="true" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || password.trim().length === 0}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-none border border-[#161540] bg-[#161540] py-3.5 text-xs font-normal tracking-[0.12em] text-white uppercase transition hover:bg-white hover:text-[#161540] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>
                  {isSubmitting ? dictionary.admin.loggingInButton : dictionary.admin.loginButton}
                </span>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
