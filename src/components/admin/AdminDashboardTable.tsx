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
 * Three-cell architectural KPI summary displaying total, verified, and pending goalkeeper counts.
 */
function AdminStatsBar({ goalkeepers, dictionary }: AdminStatsBarProps): React.JSX.Element {
  const verifiedCount = goalkeepers.filter((item) => item.isVerified).length;
  const pendingCount = goalkeepers.length - verifiedCount;

  return (
    <dl className="grid grid-cols-1 divide-y divide-[#DCDCE2] border border-[#DCDCE2] bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      <div className="p-5">
        <dt className="text-[11px] font-normal tracking-[0.12em] text-[#636262] uppercase">
          {dictionary.admin.totalKeepersLabel}
        </dt>
        <dd className="font-heading mt-1.5 text-2xl font-light text-[#161540]">
          {goalkeepers.length}
        </dd>
      </div>
      <div className="p-5">
        <dt className="text-[11px] font-normal tracking-[0.12em] text-[#636262] uppercase">
          {dictionary.admin.verifiedKeepersLabel}
        </dt>
        <dd className="font-heading mt-1.5 text-2xl font-light text-[#161540]">{verifiedCount}</dd>
      </div>
      <div className="p-5">
        <dt className="text-[11px] font-normal tracking-[0.12em] text-[#636262] uppercase">
          {dictionary.admin.pendingKeepersLabel}
        </dt>
        <dd className="font-heading mt-1.5 text-2xl font-light text-[#161540]">{pendingCount}</dd>
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
    <tr className="border-t border-[#DCDCE2] transition hover:bg-[#F8F8FA]">
      <td className="px-4 py-4">
        <p className="font-normal text-[#161540]">{profile.fullName}</p>
        <p className="text-xs font-light text-[#636262]">
          {dictionary.experienceLevels[profile.experienceLevel]} · {profile.age}{' '}
          {dictionary.card.ageUnit}
        </p>
      </td>
      <td className="px-4 py-4 text-xs font-light text-[#4C4C4C]">
        {dictionary.districts[profile.district]}
      </td>
      <td className="px-4 py-4 text-xs font-normal text-[#161540]">
        {profile.matchFeeTry} {dictionary.filters.currencySymbol}
      </td>
      <td className="px-4 py-4 text-xs font-light text-[#4C4C4C]">{profile.phone}</td>
      <td className="px-4 py-4">
        {profile.isVerified ? (
          <span className="inline-flex items-center gap-1 rounded-none border border-[#161540]/30 bg-[#F8F8FA] px-2 py-0.5 text-[10px] font-normal tracking-wider text-[#161540] uppercase">
            <BadgeCheck className="h-3 w-3" aria-hidden="true" />
            {dictionary.admin.statusVerified}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-none border border-[#DCDCE2] bg-white px-2 py-0.5 text-[10px] font-normal tracking-wider text-[#636262] uppercase">
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
            className="rounded-none border border-[#161540] bg-[#161540] px-3 py-1.5 text-[11px] font-normal tracking-wider text-white uppercase transition hover:bg-white hover:text-[#161540] disabled:opacity-50"
          >
            {profile.isVerified ? dictionary.admin.revokeButton : dictionary.admin.approveButton}
          </button>
          <button
            type="button"
            disabled={isBusy}
            onClick={() => void onDeleteGoalkeeper(profile.id)}
            className="inline-flex items-center gap-1 rounded-none border border-red-700 bg-white px-3 py-1.5 text-[11px] font-normal tracking-wider text-red-700 uppercase transition hover:bg-red-700 hover:text-white disabled:opacity-50"
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
 * Administrator moderation console table allowing authorized staff to approve, revoke, or remove
 * goalkeeper profiles.
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
        <div className="rounded-none border border-[#DCDCE2] bg-white p-10 text-center text-sm font-light text-[#636262]">
          {dictionary.admin.emptyDirectory}
        </div>
      ) : (
        <div className="overflow-x-auto border border-[#DCDCE2] bg-white">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-[#F8F8FA] text-[11px] font-normal tracking-[0.1em] text-[#636262] uppercase">
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
