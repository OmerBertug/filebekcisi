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
 * Renders the goalkeeper identity row, verification status tag, district label, and rating badge.
 *
 * @param props - `CardHeaderSummaryProps` containing goalkeeper profile and localized copy.
 * @returns Header section inside `GoalkeeperCard`.
 */
function CardHeaderSummary({ profile, dictionary }: CardHeaderSummaryProps): React.JSX.Element {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-[#DCDCE2] pb-4">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-normal tracking-tight text-[#161540]">{profile.fullName}</h3>
          {profile.isVerified ? (
            <span className="inline-flex items-center gap-1 rounded-none border border-[#161540]/25 bg-[#F8F8FA] px-2 py-0.5 text-[10px] font-normal tracking-wider text-[#161540] uppercase">
              <BadgeCheck className="h-3 w-3" aria-hidden="true" />
              {dictionary.card.verifiedBadge}
            </span>
          ) : (
            <span className="inline-flex items-center rounded-none border border-[#DCDCE2] bg-[#F8F8FA] px-2 py-0.5 text-[10px] font-normal tracking-wider text-[#636262] uppercase">
              {dictionary.card.newBadge}
            </span>
          )}
        </div>
        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-light text-[#636262]">
          <MapPin className="h-3.5 w-3.5 text-[#161540]" aria-hidden="true" />
          {dictionary.districts[profile.district]}
        </p>
      </div>

      <div className="flex items-center gap-1 rounded-none bg-[#161540] px-2.5 py-1 text-xs font-normal text-white">
        <Star className="h-3 w-3 fill-white text-white" aria-hidden="true" />
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
  /** Callback triggered when an organizer clicks the match invitation CTA. */
  readonly onSelectForMatch: (profile: GoalkeeperProfile) => void;
}

/**
 * Memoized directory cell presenting a goalkeeper's physical attributes, rating, availability,
 * net match fee, commission-inclusive total, and formal match invitation CTA.
 *
 * @param props - `GoalkeeperCardProps` containing profile data, dictionary, and selection handler.
 * @returns Rendered `<article>` architectural profile cell.
 */
export const GoalkeeperCard = memo(function GoalkeeperCard({
  profile,
  dictionary,
  onSelectForMatch,
}: GoalkeeperCardProps): React.JSX.Element {
  const fee = calculateMatchFeeBreakdown(profile.matchFeeTry);
  const currency = dictionary.filters.currencySymbol;

  return (
    <article className="flex flex-col justify-between rounded-none border border-[#DCDCE2] bg-white p-6 transition hover:border-[#161540]">
      <div>
        <CardHeaderSummary profile={profile} dictionary={dictionary} />

        <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#4C4C4C]">
          <span className="inline-flex items-center gap-1 rounded-none border border-[#DCDCE2] bg-[#F8F8FA] px-2.5 py-1 font-light">
            <User className="h-3.5 w-3.5 text-[#636262]" aria-hidden="true" />
            {profile.age} {dictionary.card.ageUnit}
          </span>
          <span className="inline-flex items-center gap-1 rounded-none border border-[#DCDCE2] bg-[#F8F8FA] px-2.5 py-1 font-light">
            <Ruler className="h-3.5 w-3.5 text-[#636262]" aria-hidden="true" />
            {profile.heightCm} {dictionary.card.heightUnit}
          </span>
          <span className="rounded-none border border-[#161540]/20 bg-[#F8F8FA] px-2.5 py-1 font-normal text-[#161540]">
            {dictionary.experienceLevels[profile.experienceLevel]}
          </span>
        </div>

        <p className="mt-3 text-xs font-light text-[#636262]">
          <span className="font-normal text-[#4C4C4C]">{dictionary.card.dominantHandPrefix}</span>{' '}
          {dictionary.dominantHands[profile.dominantHand]} · {profile.completedMatches}{' '}
          {dictionary.card.matchesCompletedSuffix}
        </p>

        <p className="mt-3 line-clamp-3 text-sm font-light leading-relaxed text-[#4C4C4C]">
          {profile.bio}
        </p>

        <div className="mt-4">
          <p className="flex items-center gap-1.5 text-[11px] font-normal tracking-wider text-[#636262] uppercase">
            <Calendar className="h-3.5 w-3.5 text-[#161540]" aria-hidden="true" />
            {dictionary.card.availableDaysLabel}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {profile.availableDays.map((day) => (
              <span
                key={day}
                className="rounded-none border border-[#DCDCE2] bg-[#F8F8FA] px-2 py-0.5 text-[11px] font-light text-[#4C4C4C]"
              >
                {dictionary.daysShort[day]}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-end justify-between gap-3 border-t border-[#DCDCE2] pt-4">
        <div>
          <p className="text-[11px] font-light tracking-wider text-[#636262] uppercase">
            {dictionary.card.goalkeeperFeeLabel}
          </p>
          <p className="font-heading mt-0.5 text-xl font-light text-[#161540]">
            {fee.listedFeeTry} {currency}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onSelectForMatch(profile)}
          className="inline-flex items-center gap-1.5 rounded-none border border-[#161540] bg-[#161540] px-4 py-2.5 text-[11px] font-normal tracking-[0.1em] text-white uppercase transition hover:bg-white hover:text-[#161540] focus-visible:ring-2 focus-visible:ring-[#161540] focus-visible:outline-none"
        >
          <span>{dictionary.card.inviteButton}</span>
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
});
