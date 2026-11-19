// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Phone, X } from 'lucide-react';
import { BookingCheckoutForm } from '@/components/directory/BookingCheckoutForm';
import {
  calculateMatchFeeBreakdown,
  maskPhoneNumber,
  type BookingRecord,
  type FeeBreakdown,
  type GoalkeeperProfile,
} from '@/domain/goalkeeper';
import type { AppDictionary } from '@/i18n';

interface FeeSummaryBoxProps {
  readonly fee: FeeBreakdown;
  readonly dictionary: AppDictionary;
}

/**
 * Renders the itemized customer checkout financial breakdown inside a luminous `#1A232C`
 * calculation panel with directional neon glow and tabular lining figures.
 *
 * @param props - `FeeSummaryBoxProps` containing computed fee figures and localized labels.
 * @returns Itemized `<dl>` definition list block.
 */
function FeeSummaryBox({ fee, dictionary }: FeeSummaryBoxProps): React.JSX.Element {
  const currency = dictionary.filters.currencySymbol;
  return (
    <div className="mt-4 rounded-lg border border-[#14E777]/35 bg-[#1A232C] p-4 shadow-[0_0_24px_-4px_rgba(20,231,119,0.18)]">
      <h3 className="font-heading text-xs font-bold tracking-[0.12em] text-[#14E777] uppercase">
        {dictionary.bookingModal.feeSummaryTitle}
      </h3>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between text-[#BACBB9]">
          <dt>{dictionary.bookingModal.goalkeeperNetLabel}</dt>
          <dd className="font-heading font-semibold tabular-nums text-[#F8FAFC]">
            {fee.listedFeeTry} {currency}
          </dd>
        </div>
        <div className="flex justify-between text-[#BACBB9]">
          <dt>{dictionary.bookingModal.commissionLabel}</dt>
          <dd className="font-heading font-semibold tabular-nums text-[#4EDEA3]">
            +{fee.customerCommissionTry} {currency}
          </dd>
        </div>
        <div className="flex justify-between border-t border-white/[0.08] pt-2.5 text-base font-bold text-[#F8FAFC]">
          <dt>{dictionary.bookingModal.totalPayableLabel}</dt>
          <dd className="font-heading text-xl tabular-nums text-[#14E777]">
            {fee.totalPayableTry} {currency}
          </dd>
        </div>
      </dl>
    </div>
  );
}

/**
 * Props accepted by the `MatchBookingPreviewModal` dialog component.
 */
export interface MatchBookingPreviewModalProps {
  /** Selected goalkeeper profile to invite, or `null` when modal is closed. */
  readonly profile: GoalkeeperProfile | null;
  /** Active localized copy dictionary. */
  readonly dictionary: AppDictionary;
  /** Callback closing the modal dialog. */
  readonly onClose: () => void;
}

/**
 * Accessible dark booking checkout modal displaying the goalkeeper's listed fee, `+15%` customer
 * service commission, masked contact phone (unlocked upon booking confirmation), and the
 * `BookingCheckoutForm`.
 *
 * Side Effects: Registers a `keydown` listener for `Escape` dismissal while open and cleans up
 * the listener on unmount or close to prevent memory leaks.
 *
 * @param props - `MatchBookingPreviewModalProps` controlling visibility, copy, and dismissal.
 * @returns Modal overlay element when `profile` is non-null, or `null` when closed.
 */
export function MatchBookingPreviewModal({
  profile,
  dictionary,
  onClose,
}: MatchBookingPreviewModalProps): React.JSX.Element | null {
  const [confirmedBooking, setConfirmedBooking] = useState<BookingRecord | null>(null);

  useEffect(() => {
    setConfirmedBooking(null);
    if (profile === null) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [profile, onClose]);

  if (profile === null) {
    return null;
  }

  const fee = calculateMatchFeeBreakdown(profile.matchFeeTry);
  const displayedPhone =
    confirmedBooking !== null ? confirmedBooking.goalkeeperPhone : maskPhoneNumber(profile.phone);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#0B0F12]/80 p-4 backdrop-blur-md"
    >
      <div className="my-auto w-full max-w-lg rounded-xl border border-white/[0.12] bg-[#12181F] p-6 text-[#E0E3E7] shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-white/[0.08] pb-3.5">
          <div>
            <h2
              id="booking-modal-title"
              className="font-heading text-lg font-bold tracking-tight text-[#F8FAFC]"
            >
              {dictionary.bookingModal.title}
            </h2>
            <p className="mt-1 text-xs text-[#94A3B8]">{dictionary.bookingModal.subtitle}</p>
          </div>
          <button
            type="button"
            aria-label={dictionary.bookingModal.closeAriaLabel}
            onClick={onClose}
            className="rounded-md border border-white/[0.12] bg-[#1A232C] p-1.5 text-[#94A3B8] transition hover:border-[#14E777] hover:text-[#F8FAFC]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4 rounded-md border-l-2 border-[#14E777] bg-[#1A232C] p-3.5">
          <p className="font-heading text-sm font-semibold text-[#F8FAFC]">{profile.fullName}</p>
          <p className="mt-0.5 text-xs text-[#94A3B8]">
            {dictionary.districts[profile.district]} ·{' '}
            {dictionary.experienceLevels[profile.experienceLevel]}
          </p>
        </div>

        <FeeSummaryBox fee={fee} dictionary={dictionary} />

        <div className="mt-3.5 flex flex-col gap-1 rounded-md border border-white/[0.08] bg-[#1A232C] px-3.5 py-2.5 text-xs text-[#E0E3E7]">
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 shrink-0 text-[#14E777]" aria-hidden="true" />
            <span>
              <strong className="font-semibold text-[#F8FAFC]">
                {dictionary.bookingModal.contactPhoneLabel}:
              </strong>{' '}
              <span className="font-heading tabular-nums text-[#7FFFA2]">{displayedPhone}</span>
            </span>
          </div>
          {confirmedBooking === null && (
            <p className="text-[11px] text-[#94A3B8]">
              {dictionary.bookingModal.maskedPhoneNotice}
            </p>
          )}
        </div>

        {confirmedBooking !== null ? (
          <div
            role="status"
            className="mt-4 flex items-center gap-2.5 rounded-md border border-[#14E777]/40 bg-[#14E777]/15 p-3.5 text-xs font-medium text-[#7FFFA2]"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#14E777]" aria-hidden="true" />
            <span>{dictionary.bookingModal.requestSentMessage}</span>
          </div>
        ) : (
          <BookingCheckoutForm
            profile={profile}
            dictionary={dictionary}
            onBookingConfirmed={setConfirmedBooking}
          />
        )}
      </div>
    </div>
  );
}
