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
 * Renders the itemized customer checkout financial summary table inside `MatchBookingPreviewModal`.
 * Shows the goalkeeper listed price (`listedFeeTry`), `+15%` customer service commission,
 * and total customer payable amount (`totalPayableTry`).
 *
 * @param props - `FeeSummaryBoxProps` containing computed fee figures and localized labels.
 * @returns Itemized `<dl>` definition list block.
 */
function FeeSummaryBox({ fee, dictionary }: FeeSummaryBoxProps): React.JSX.Element {
  const currency = dictionary.filters.currencySymbol;
  return (
    <div className="mt-4 rounded-none border border-[#DCDCE2] bg-[#F8F8FA] p-4">
      <h3 className="text-[11px] font-normal tracking-[0.12em] text-[#636262] uppercase">
        {dictionary.bookingModal.feeSummaryTitle}
      </h3>
      <dl className="mt-2.5 space-y-2 text-sm font-light">
        <div className="flex justify-between text-[#4C4C4C]">
          <dt>{dictionary.bookingModal.goalkeeperNetLabel}</dt>
          <dd className="font-normal text-[#161540]">
            {fee.listedFeeTry} {currency}
          </dd>
        </div>
        <div className="flex justify-between text-[#4C4C4C]">
          <dt>{dictionary.bookingModal.commissionLabel}</dt>
          <dd className="font-normal text-[#161540]">
            +{fee.customerCommissionTry} {currency}
          </dd>
        </div>
        <div className="flex justify-between border-t border-[#DCDCE2] pt-2 text-base font-normal text-[#161540]">
          <dt>{dictionary.bookingModal.totalPayableLabel}</dt>
          <dd>
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
 * Accessible booking checkout modal displaying the goalkeeper's listed fee, `+15%` customer
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
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#161540]/75 p-4 backdrop-blur-xs"
    >
      <div className="my-auto w-full max-w-lg rounded-none border border-[#161540] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-[#DCDCE2] pb-3.5">
          <div>
            <h2
              id="booking-modal-title"
              className="text-base font-normal tracking-wide text-[#161540] uppercase"
            >
              {dictionary.bookingModal.title}
            </h2>
            <p className="mt-1 text-xs font-light text-[#636262]">
              {dictionary.bookingModal.subtitle}
            </p>
          </div>
          <button
            type="button"
            aria-label={dictionary.bookingModal.closeAriaLabel}
            onClick={onClose}
            className="rounded-none border border-[#DCDCE2] p-1.5 text-[#636262] transition hover:border-[#161540] hover:text-[#161540]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-3.5 border-l-2 border-[#161540] bg-[#F8F8FA] p-3">
          <p className="text-sm font-normal text-[#161540]">{profile.fullName}</p>
          <p className="mt-0.5 text-xs font-light text-[#636262]">
            {dictionary.districts[profile.district]} ·{' '}
            {dictionary.experienceLevels[profile.experienceLevel]}
          </p>
        </div>

        <FeeSummaryBox fee={fee} dictionary={dictionary} />

        <div className="mt-3.5 flex flex-col gap-1 rounded-none border border-[#DCDCE2] bg-[#F8F8FA] px-3.5 py-2.5 text-xs text-[#161540]">
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 shrink-0 text-[#161540]" aria-hidden="true" />
            <span className="font-light">
              <strong className="font-normal">{dictionary.bookingModal.contactPhoneLabel}:</strong>{' '}
              {displayedPhone}
            </span>
          </div>
          {confirmedBooking === null && (
            <p className="text-[11px] font-light text-[#636262]">
              {dictionary.bookingModal.maskedPhoneNotice}
            </p>
          )}
        </div>

        {confirmedBooking !== null ? (
          <div
            role="status"
            className="mt-4 flex items-center gap-2 rounded-none border border-[#161540] bg-[#161540] p-3.5 text-xs font-light text-white"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-white" aria-hidden="true" />
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
