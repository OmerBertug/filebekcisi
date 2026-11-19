// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

'use client';

import { BadgeCheck, ShieldAlert, Trash2 } from 'lucide-react';
import type { GoalkeeperProfile } from '@/domain/goalkeeper';
import type { AppDictionary } from '@/i18n';

interface AdminStatsBarProps {
  readonly goalkeepers: readonly GoalkeeperProfile[];
  readonly dictionary: AppDictionary;
}

/**
 * Three-cell dark glassmorphic KPI summary displaying total, verified, and pending goalkeeper counts.
 */
function AdminStatsBar({ goalkeepers, dictionary }: AdminStatsBarProps): React.JSX.Element {
  const verifiedCount = goalkeepers.filter((item) => item.isVerified).length;
  const pendingCount = goalkeepers.length - verifiedCount;

  return (
    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-lg border border-white/[0.08] bg-[#12181F] p-5">
        <dt className="font-heading text-xs font-semibold tracking-[0.08em] text-[#94A3B8] uppercase">
          {dictionary.admin.totalKeepersLabel}
        </dt>
        <dd className="font-heading mt-1.5 text-3xl font-bold tabular-nums text-[#F8FAFC]">
          {goalkeepers.length}
        </dd>
      </div>
      <div className="rounded-lg border border-[#14E777]/30 bg-[#12181F] p-5">
        <dt className="font-heading text-xs font-semibold tracking-[0.08em] text-[#94A3B8] uppercase">
          {dictionary.admin.verifiedKeepersLabel}
        </dt>
        <dd className="font-heading mt-1.5 text-3xl font-bold tabular-nums text-[#14E777]">
          {verifiedCount}
        </dd>
      </div>
      <div className="rounded-lg border border-white/[0.08] bg-[#12181F] p-5">
        <dt className="font-heading text-xs font-semibold tracking-[0.08em] text-[#94A3B8] uppercase">
          {dictionary.admin.pendingKeepersLabel}
        </dt>
        <dd className="font-heading mt-1.5 text-3xl font-bold tabular-nums text-[#F8FAFC]">
          {pendingCount}
        </dd>
      </div>
    </dl>
  );
}

/**
 * Props accepted by `AdminDashboardTable`.
 */
export interface AdminDashboardTableProps {
  /** Registered goalkeeper profiles loaded from storage. */
  readonly goalkeepers: readonly GoalkeeperProfile[];
  /** Active localized copy dictionary. */
  readonly dictionary: AppDictionary;
  /** ID of the goalkeeper currently undergoing a mutation request, or `null`. */
  readonly busyId: string | null;
  /** Callback toggling the `isVerified` status of a goalkeeper profile. */
  readonly onToggleVerified: (id: string, nextVerified: boolean) => Promise<void>;
  /** Callback deleting a goalkeeper profile from the registry. */
  readonly onDeleteGoalkeeper: (id: string) => Promise<void>;
}

interface KeeperTableRowProps {
  readonly profile: GoalkeeperProfile;
  readonly dictionary: AppDictionary;
  readonly isBusy: boolean;
  readonly onToggleVerified: (id: string, nextVerified: boolean) => Promise<void>;
  readonly onDeleteGoalkeeper: (id: string) => Promise<void>;
}

/**
 * Single goalkeeper row inside `AdminDashboardTable` with verification toggle and delete controls.
 */
function KeeperTableRow({
  profile,
  dictionary,
  isBusy,
  onToggleVerified,
  onDeleteGoalkeeper,
}: KeeperTableRowProps): React.JSX.Element {
  return (
    <tr className="border-t border-white/[0.06] transition hover:bg-[#1A232C]">
      <td className="px-4 py-4">
        <p className="font-heading font-semibold text-[#F8FAFC]">{profile.fullName}</p>
        <p className="text-xs text-[#94A3B8]">
          {dictionary.experienceLevels[profile.experienceLevel]} · {profile.age}{' '}
          {dictionary.card.ageUnit}
        </p>
      </td>
      <td className="px-4 py-4 text-xs text-[#E0E3E7]">{dictionary.districts[profile.district]}</td>
      <td className="px-4 py-4 font-heading text-xs font-semibold tabular-nums text-[#F8FAFC]">
        {profile.matchFeeTry} {dictionary.filters.currencySymbol}
      </td>
      <td className="px-4 py-4 font-heading text-xs tabular-nums text-[#94A3B8]">
        {profile.phone}
      </td>
      <td className="px-4 py-4">
        {profile.isVerified ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-[#10B981]/40 bg-[#10B981]/10 px-2.5 py-0.5 font-heading text-[10px] font-semibold tracking-wider text-[#14E777] uppercase">
            <BadgeCheck className="h-3 w-3" aria-hidden="true" />
            {dictionary.admin.statusVerified}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.12] bg-[#1A232C] px-2.5 py-0.5 font-heading text-[10px] font-medium tracking-wider text-[#94A3B8] uppercase">
            <ShieldAlert className="h-3 w-3" aria-hidden="true" />
            {dictionary.admin.statusPending}
          </span>
        )}
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={isBusy}
            onClick={() => void onToggleVerified(profile.id, !profile.isVerified)}
            className="rounded-md bg-[#14E777] px-3 py-1.5 font-heading text-[11px] font-bold tracking-wider text-[#0B0F12] uppercase transition hover:bg-[#62FF95] disabled:opacity-50"
          >
            {profile.isVerified ? dictionary.admin.revokeButton : dictionary.admin.approveButton}
          </button>
          <button
            type="button"
            disabled={isBusy}
            onClick={() => void onDeleteGoalkeeper(profile.id)}
            className="inline-flex items-center gap-1 rounded-md border border-[#FFB4AB]/40 bg-[#93000A]/30 px-3 py-1.5 font-heading text-[11px] font-semibold tracking-wider text-[#FFB4AB] uppercase transition hover:bg-[#FFB4AB] hover:text-[#690005] disabled:opacity-50"
          >
            <Trash2 className="h-3 w-3" aria-hidden="true" />
            <span>{dictionary.admin.deleteButton}</span>
          </button>
        </div>
      </td>
    </tr>
  );
}

/**
 * Administrator moderation console table under Electric Pitch dark styling allowing authorized
 * staff to approve, revoke, or remove goalkeeper profiles.
 *
 * @param props - `AdminDashboardTableProps` binding profiles and moderation callbacks.
 * @returns Rendered KPI bar and moderation table.
 */
export function AdminDashboardTable({
  goalkeepers,
  dictionary,
  busyId,
  onToggleVerified,
  onDeleteGoalkeeper,
}: AdminDashboardTableProps): React.JSX.Element {
  return (
    <div className="space-y-6">
      <AdminStatsBar goalkeepers={goalkeepers} dictionary={dictionary} />

      {goalkeepers.length === 0 ? (
        <div className="rounded-lg border border-white/[0.08] bg-[#12181F] p-10 text-center text-sm text-[#94A3B8]">
          {dictionary.admin.emptyDirectory}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-white/[0.08] bg-[#12181F]">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-[#1A232C] font-heading text-[11px] font-semibold tracking-[0.1em] text-[#94A3B8] uppercase">
                <th className="px-4 py-3.5">{dictionary.admin.tableHeaderKeeper}</th>
                <th className="px-4 py-3.5">{dictionary.admin.tableHeaderDistrict}</th>
                <th className="px-4 py-3.5">{dictionary.admin.tableHeaderFee}</th>
                <th className="px-4 py-3.5">{dictionary.admin.tableHeaderPhone}</th>
                <th className="px-4 py-3.5">{dictionary.admin.tableHeaderStatus}</th>
                <th className="px-4 py-3.5">{dictionary.admin.tableHeaderActions}</th>
              </tr>
            </thead>
            <tbody>
              {goalkeepers.map((profile) => (
                <KeeperTableRow
                  key={profile.id}
                  profile={profile}
                  dictionary={dictionary}
                  isBusy={busyId === profile.id}
                  onToggleVerified={onToggleVerified}
                  onDeleteGoalkeeper={onDeleteGoalkeeper}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
