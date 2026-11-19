// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

'use client';

import { memo } from 'react';
import { ArrowUpRight, BadgeCheck, Calendar, MapPin, Ruler, Star, User } from 'lucide-react';
import { calculateMatchFeeBreakdown, type GoalkeeperProfile } from '@/domain/goalkeeper';
import type { AppDictionary } from '@/i18n';

interface CardHeaderSummaryProps {
  readonly profile: GoalkeeperProfile;
  readonly dictionary: AppDictionary;
}

/**
 * Renders the goalkeeper identity row, glowing verification pill, district indicator, and
 * tabular numeric rating badge inside `GoalkeeperCard`.
 *
 * @param props - `CardHeaderSummaryProps` containing goalkeeper profile and localized copy.
 * @returns Header section inside `GoalkeeperCard`.
 */
function CardHeaderSummary({ profile, dictionary }: CardHeaderSummaryProps): React.JSX.Element {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] pb-4">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-heading text-lg font-semibold tracking-[-0.005em] text-[#F8FAFC]">
            {profile.fullName}
          </h3>
          {profile.isVerified ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-[#10B981]/40 bg-[#10B981]/10 px-2.5 py-0.5 font-heading text-[11px] font-semibold tracking-wider text-[#14E777] uppercase">
              <BadgeCheck className="h-3 w-3" aria-hidden="true" />
              {dictionary.card.verifiedBadge}
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full border border-white/[0.12] bg-[#1A232C] px-2.5 py-0.5 font-heading text-[11px] font-medium tracking-wider text-[#94A3B8] uppercase">
              {dictionary.card.newBadge}
            </span>
          )}
        </div>
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[#94A3B8]">
          <MapPin className="h-3.5 w-3.5 text-[#10B981]" aria-hidden="true" />
          {dictionary.districts[profile.district]}
        </p>
      </div>

      <div className="inline-flex items-center gap-1 rounded-full border border-[#14E777]/35 bg-[#1A232C] px-2.5 py-1 font-heading text-xs font-bold tabular-nums text-[#14E777]">
        <Star className="h-3 w-3 fill-[#14E777] text-[#14E777]" aria-hidden="true" />
        <span>{profile.rating.toFixed(1)}</span>
      </div>
    </div>
  );
}

/**
 * Props accepted by the `GoalkeeperCard` profile summary component.
 */
export interface GoalkeeperCardProps {
  /** Goalkeeper profile entity rendered by the card. */
  readonly profile: GoalkeeperProfile;
  /** Active localized copy dictionary. */
  readonly dictionary: AppDictionary;
  /** Callback triggered when an organizer clicks the match booking CTA. */
  readonly onSelectForMatch: (profile: GoalkeeperProfile) => void;
}

/**
 * Memoized dark glassmorphic directory card presenting goalkeeper metrics, physical attributes,
 * weekly availability pills, listed per-match rate, and electric neon-lime booking CTA.
 *
 * @param props - `GoalkeeperCardProps` containing profile data, dictionary, and selection handler.
 * @returns Rendered `<article>` goalkeeper card.
 */
export const GoalkeeperCard = memo(function GoalkeeperCard({
  profile,
  dictionary,
  onSelectForMatch,
}: GoalkeeperCardProps): React.JSX.Element {
  const fee = calculateMatchFeeBreakdown(profile.matchFeeTry);
  const currency = dictionary.filters.currencySymbol;

  return (
    <article className="flex flex-col justify-between rounded-lg border border-white/[0.08] bg-[#12181F]/90 p-6 backdrop-blur-md transition duration-150 hover:border-[#14E777]/35 hover:bg-[#1A232C]/90">
      <div>
        <CardHeaderSummary profile={profile} dictionary={dictionary} />

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-[#1A232C] px-2.5 py-1 text-[#E0E3E7]">
            <User className="h-3.5 w-3.5 text-[#94A3B8]" aria-hidden="true" />
            {profile.age} {dictionary.card.ageUnit}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-[#1A232C] px-2.5 py-1 text-[#E0E3E7]">
            <Ruler className="h-3.5 w-3.5 text-[#94A3B8]" aria-hidden="true" />
            {profile.heightCm} {dictionary.card.heightUnit}
          </span>
          <span className="rounded-full border border-[#10B981]/30 bg-[#10B981]/10 px-2.5 py-1 font-medium text-[#4EDEA3]">
            {dictionary.experienceLevels[profile.experienceLevel]}
          </span>
        </div>

        <p className="mt-3 text-xs text-[#94A3B8]">
          <span className="font-medium text-[#E0E3E7]">{dictionary.card.dominantHandPrefix}</span>{' '}
          {dictionary.dominantHands[profile.dominantHand]} ·{' '}
          <span className="tabular-nums">{profile.completedMatches}</span>{' '}
          {dictionary.card.matchesCompletedSuffix}
        </p>

        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[#BACBB9]">{profile.bio}</p>

        <div className="mt-4">
          <p className="flex items-center gap-1.5 font-heading text-[11px] font-semibold tracking-wider text-[#94A3B8] uppercase">
            <Calendar className="h-3.5 w-3.5 text-[#10B981]" aria-hidden="true" />
            {dictionary.card.availableDaysLabel}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {profile.availableDays.map((day) => (
              <span
                key={day}
                className="rounded-full border border-white/[0.08] bg-[#1A232C] px-2.5 py-0.5 text-[11px] text-[#E0E3E7]"
              >
                {dictionary.daysShort[day]}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-end justify-between gap-3 border-t border-white/[0.06] pt-4">
        <div>
          <p className="font-heading text-[11px] font-medium tracking-wider text-[#94A3B8] uppercase">
            {dictionary.card.goalkeeperFeeLabel}
          </p>
          <p className="font-heading mt-0.5 text-2xl font-bold tracking-tight tabular-nums text-[#F8FAFC]">
            {fee.listedFeeTry} {currency}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onSelectForMatch(profile)}
          className="inline-flex items-center gap-1.5 rounded-md bg-[#14E777] px-4 py-2.5 font-heading text-xs font-bold tracking-wide text-[#0B0F12] transition duration-150 hover:bg-[#62FF95] hover:shadow-[0_0_20px_-4px_rgba(20,231,119,0.45)] focus-visible:ring-2 focus-visible:ring-[#14E777] focus-visible:outline-none"
        >
          <span>{dictionary.card.inviteButton}</span>
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
});
