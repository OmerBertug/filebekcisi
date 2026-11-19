// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, LogOut, Shield } from 'lucide-react';
import { AdminBookingsTable } from '@/components/admin/AdminBookingsTable';
import { AdminDashboardTable } from '@/components/admin/AdminDashboardTable';
import { AdminLoginPanel } from '@/components/admin/AdminLoginPanel';
import { SiteFooter } from '@/components/layout/SiteFooter';
import type { ApiErrorCode, BookingRecord, GoalkeeperProfile, Result } from '@/domain/goalkeeper';
import { useGoalkeepers } from '@/hooks/useGoalkeepers';
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  getDictionary,
  type AppDictionary,
  type SupportedLocale,
} from '@/i18n';
import {
  fetchAdminBookings,
  fetchAdminSession,
  loginAdmin,
  logoutAdmin,
  removeBooking,
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
 * Top navigation bar for `/admin` with return link, locale switcher, and session sign-out button.
 */
function AdminTopBar({
  dictionary,
  locale,
  isAuthenticated,
  onLocaleChange,
  onLogout,
}: AdminTopBarProps): React.JSX.Element {
  return (
    <header className="border-b border-white/[0.08] bg-[#0B0F12]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md border border-[#14E777]/35 bg-[#14E777]/10 text-[#14E777]">
            <Shield className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="font-heading text-sm font-bold tracking-[0.12em] text-[#F8FAFC] uppercase">
              {dictionary.meta.brandName}
            </p>
            <p className="text-[11px] text-[#94A3B8]">{dictionary.admin.badge}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.12] bg-[#12181F] px-3.5 py-2 font-heading text-xs font-semibold tracking-wide text-[#F8FAFC] transition hover:border-[#14E777]/50 hover:bg-[#1A232C]"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{dictionary.admin.backToSite}</span>
          </Link>
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => void onLogout()}
              className="inline-flex items-center gap-1.5 rounded-md border border-white/25 bg-transparent px-3.5 py-2 font-heading text-xs font-semibold tracking-wide text-[#F8FAFC] transition hover:border-[#FFB4AB]/50 hover:text-[#FFB4AB]"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{dictionary.admin.logoutButton}</span>
            </button>
          )}
          <div
            role="group"
            aria-label={dictionary.meta.switchLocaleLabel}
            className="flex items-center rounded-md border border-white/[0.08] bg-[#12181F] p-0.5"
          >
            {SUPPORTED_LOCALES.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={item === locale}
                onClick={() => onLocaleChange(item)}
                className={`rounded px-2.5 py-1 font-heading text-[11px] font-semibold uppercase ${
                  item === locale
                    ? 'bg-[#14E777] text-[#0B0F12]'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC]'
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
  readonly bookings: readonly BookingRecord[];
  readonly dictionary: AppDictionary;
  readonly busyId: string | null;
  readonly onToggleVerified: (id: string, nextVerified: boolean) => Promise<void>;
  readonly onDeleteGoalkeeper: (id: string) => Promise<void>;
  readonly onDeleteBooking: (id: string) => Promise<void>;
}

/**
 * Renders the authenticated moderation header, goalkeeper roster table, and bookings table.
 */
function AuthenticatedConsoleBody({
  goalkeepers,
  bookings,
  dictionary,
  busyId,
  onToggleVerified,
  onDeleteGoalkeeper,
  onDeleteBooking,
}: AuthenticatedConsoleBodyProps): React.JSX.Element {
  return (
    <section className="border-b border-white/[0.06] bg-[#0B0F12] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="mb-8 border-b border-white/[0.06] pb-6">
          <span className="font-heading text-xs font-bold tracking-[0.12em] text-[#14E777] uppercase">
            {dictionary.admin.badge}
          </span>
          <h1 className="mt-2 font-heading text-2xl font-bold text-[#F8FAFC] sm:text-3xl">
            {dictionary.admin.title}
          </h1>
          <p className="mt-2 text-sm text-[#94A3B8]">{dictionary.admin.subtitle}</p>
        </div>

        <AdminDashboardTable
          goalkeepers={goalkeepers}
          dictionary={dictionary}
          busyId={busyId}
          onToggleVerified={onToggleVerified}
          onDeleteGoalkeeper={onDeleteGoalkeeper}
        />
        <AdminBookingsTable
          bookings={bookings}
          dictionary={dictionary}
          busyBookingId={busyId}
          onDeleteBooking={onDeleteBooking}
        />
      </div>
    </section>
  );
}

/**
 * Client workspace orchestrating administrator session verification, password login,
 * goalkeeper moderation, and customer booking inspection inside `/admin`.
 *
 * @returns Rendered administrator console view.
 */
export function AdminWorkspace(): React.JSX.Element {
  const [locale, setLocale] = useState<SupportedLocale>(DEFAULT_LOCALE);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState<boolean>(false);
  const [authErrorCode, setAuthErrorCode] = useState<ApiErrorCode | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [bookings, setBookings] = useState<readonly BookingRecord[]>([]);

  const { goalkeepers, reload } = useGoalkeepers();
  const dictionary = getDictionary(locale);

  const loadBookings = useCallback(async (signal?: AbortSignal): Promise<void> => {
    const result = await fetchAdminBookings(signal);
    if (result.ok) {
      setBookings(result.data);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchAdminSession(controller.signal)
      .then((res) => {
        if (res.ok && res.data.authenticated) {
          setIsAuthenticated(true);
          return loadBookings(controller.signal);
        }
        return undefined;
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [loadBookings]);

  const runMutation = useCallback(
    async <TData,>(
      id: string,
      action: () => Promise<Result<TData, ApiErrorCode>>,
      refresh: () => void | Promise<void>,
    ): Promise<void> => {
      setBusyId(id);
      const result = await action();
      setBusyId(null);
      if (result.ok) {
        await refresh();
      }
    },
    [],
  );

  const handleLogin = useCallback(
    async (password: string): Promise<void> => {
      setIsSubmittingAuth(true);
      setAuthErrorCode(null);
      const result = await loginAdmin(password);
      setIsSubmittingAuth(false);
      if (!result.ok) {
        setAuthErrorCode(result.error);
        return;
      }
      setIsAuthenticated(result.data.authenticated);
      if (result.data.authenticated) {
        await loadBookings();
      }
    },
    [loadBookings],
  );

  const handleLogout = useCallback(async (): Promise<void> => {
    await logoutAdmin();
    setIsAuthenticated(false);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#0B0F12] text-[#E0E3E7]">
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
            bookings={bookings}
            dictionary={dictionary}
            busyId={busyId}
            onToggleVerified={(id, next) =>
              runMutation(id, () => setGoalkeeperVerification(id, next), reload)
            }
            onDeleteGoalkeeper={(id) => runMutation(id, () => removeGoalkeeper(id), reload)}
            onDeleteBooking={(id) => runMutation(id, () => removeBooking(id), loadBookings)}
          />
        )}
      </main>
      <SiteFooter dictionary={dictionary} />
    </div>
  );
}
