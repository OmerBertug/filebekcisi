// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, LogOut, Shield } from 'lucide-react';
import { AdminDashboardTable } from '@/components/admin/AdminDashboardTable';
import { AdminLoginPanel } from '@/components/admin/AdminLoginPanel';
import { SiteFooter } from '@/components/layout/SiteFooter';
import type { ApiErrorCode, GoalkeeperProfile } from '@/domain/goalkeeper';
import { useGoalkeepers } from '@/hooks/useGoalkeepers';
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  getDictionary,
  type AppDictionary,
  type SupportedLocale,
} from '@/i18n';
import {
  fetchAdminSession,
  loginAdmin,
  logoutAdmin,
  removeGoalkeeper,
  setGoalkeeperVerification,
} from '@/services/adminApiClient';

interface AdminTopBarProps {
  readonly dictionary: AppDictionary;
  readonly locale: SupportedLocale;
  readonly isAuthenticated: boolean;
  readonly onLocaleChange: (locale: SupportedLocale) => void;
  readonly onLogout: () => Promise<void>;
}

/**
 * Top navigation bar for the private `/admin` route with platform return link, locale switcher,
 * and session sign-out button.
 */
function AdminTopBar({
  dictionary,
  locale,
  isAuthenticated,
  onLocaleChange,
  onLogout,
}: AdminTopBarProps): React.JSX.Element {
  return (
    <header className="border-b border-[#DCDCE2] bg-white">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-none bg-[#161540] text-white">
            <Shield className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="font-heading text-sm font-medium tracking-[0.14em] text-[#161540] uppercase">
              {dictionary.meta.brandName}
            </p>
            <p className="text-[11px] font-light tracking-wider text-[#636262]">
              {dictionary.admin.badge}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-none border border-[#DCDCE2] bg-[#F8F8FA] px-3.5 py-2 text-xs font-normal tracking-wider text-[#161540] uppercase transition hover:border-[#161540] hover:bg-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{dictionary.admin.backToSite}</span>
          </Link>

          {isAuthenticated && (
            <button
              type="button"
              onClick={() => void onLogout()}
              className="inline-flex items-center gap-1.5 rounded-none border border-[#161540] bg-[#161540] px-3.5 py-2 text-xs font-normal tracking-wider text-white uppercase transition hover:bg-white hover:text-[#161540]"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{dictionary.admin.logoutButton}</span>
            </button>
          )}

          <div
            role="group"
            aria-label={dictionary.meta.switchLocaleLabel}
            className="flex items-center border border-[#DCDCE2] bg-white p-0.5"
          >
            {SUPPORTED_LOCALES.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={item === locale}
                onClick={() => onLocaleChange(item)}
                className={`px-2 py-1 text-[11px] font-normal uppercase ${
                  item === locale ? 'bg-[#161540] text-white' : 'text-[#636262]'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

interface AuthenticatedConsoleBodyProps {
  readonly goalkeepers: readonly GoalkeeperProfile[];
  readonly dictionary: AppDictionary;
  readonly busyId: string | null;
  readonly onToggleVerified: (id: string, nextVerified: boolean) => Promise<void>;
  readonly onDeleteGoalkeeper: (id: string) => Promise<void>;
}

/**
 * Renders the 6-column header and goalkeeper moderation table once the administrator is signed in.
 */
function AuthenticatedConsoleBody({
  goalkeepers,
  dictionary,
  busyId,
  onToggleVerified,
  onDeleteGoalkeeper,
}: AuthenticatedConsoleBodyProps): React.JSX.Element {
  return (
    <section className="border-b border-[#DCDCE2]">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 border-b border-[#DCDCE2] bg-white lg:grid-cols-6">
        <div className="border-b border-[#DCDCE2] bg-[#161540] px-4 py-8 text-white sm:px-8 lg:col-span-1 lg:border-r lg:border-b-0">
          <span className="block text-[11px] font-light tracking-[0.16em] text-white/75 uppercase">
            {dictionary.admin.badge}
          </span>
        </div>
        <div className="px-4 py-8 sm:px-10 lg:col-span-5">
          <h1 className="text-2xl font-light text-[#161540] sm:text-3xl">
            {dictionary.admin.title}
          </h1>
          <p className="mt-2 text-sm font-light text-[#636262]">{dictionary.admin.subtitle}</p>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-10">
        <AdminDashboardTable
          goalkeepers={goalkeepers}
          dictionary={dictionary}
          busyId={busyId}
          onToggleVerified={onToggleVerified}
          onDeleteGoalkeeper={onDeleteGoalkeeper}
        />
      </div>
    </section>
  );
}

/**
 * Client workspace orchestrating administrator session verification, password login,
 * and goalkeeper verification/deletion inside `/admin`.
 *
 * @returns Rendered administrator console view.
 */
export function AdminWorkspace(): React.JSX.Element {
  const [locale, setLocale] = useState<SupportedLocale>(DEFAULT_LOCALE);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState<boolean>(false);
  const [authErrorCode, setAuthErrorCode] = useState<ApiErrorCode | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const { goalkeepers, reload } = useGoalkeepers();
  const dictionary = getDictionary(locale);

  useEffect(() => {
    const controller = new AbortController();
    fetchAdminSession(controller.signal)
      .then((result) => {
        if (result.ok) {
          setIsAuthenticated(result.data.authenticated);
        }
      })
      .catch(() => {
        // Ignore AbortError on unmount.
      });
    return () => {
      controller.abort();
    };
  }, []);

  const handleLogin = useCallback(async (password: string): Promise<void> => {
    setIsSubmittingAuth(true);
    setAuthErrorCode(null);
    const result = await loginAdmin(password);
    setIsSubmittingAuth(false);
    if (!result.ok) {
      setAuthErrorCode(result.error);
      return;
    }
    setIsAuthenticated(result.data.authenticated);
  }, []);

  const handleLogout = useCallback(async (): Promise<void> => {
    await logoutAdmin();
    setIsAuthenticated(false);
  }, []);

  const handleToggleVerified = useCallback(
    async (id: string, nextVerified: boolean): Promise<void> => {
      setBusyId(id);
      const result = await setGoalkeeperVerification(id, nextVerified);
      setBusyId(null);
      if (result.ok) {
        reload();
      }
    },
    [reload],
  );

  const handleDeleteGoalkeeper = useCallback(
    async (id: string): Promise<void> => {
      setBusyId(id);
      const result = await removeGoalkeeper(id);
      setBusyId(null);
      if (result.ok) {
        reload();
      }
    },
    [reload],
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F8FA] text-[#4C4C4C]">
      <AdminTopBar
        dictionary={dictionary}
        locale={locale}
        isAuthenticated={isAuthenticated}
        onLocaleChange={setLocale}
        onLogout={handleLogout}
      />
      <main className="flex-1">
        {!isAuthenticated ? (
          <AdminLoginPanel
            dictionary={dictionary}
            isSubmitting={isSubmittingAuth}
            errorCode={authErrorCode}
            onSubmitPassword={handleLogin}
          />
        ) : (
          <AuthenticatedConsoleBody
            goalkeepers={goalkeepers}
            dictionary={dictionary}
            busyId={busyId}
            onToggleVerified={handleToggleVerified}
            onDeleteGoalkeeper={handleDeleteGoalkeeper}
          />
        )}
      </main>
      <SiteFooter dictionary={dictionary} />
    </div>
  );
}
