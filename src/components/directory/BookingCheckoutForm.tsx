// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

'use client';

import { useState, type FormEvent } from 'react';
import { AlertCircle, ArrowUpRight } from 'lucide-react';
import {
  AVAILABLE_DAYS,
  isAvailableDay,
  validateCreateBookingInput,
  type ApiErrorCode,
  type AvailableDay,
  type BookingFieldErrors,
  type BookingRecord,
  type GoalkeeperProfile,
} from '@/domain/goalkeeper';
import type { AppDictionary } from '@/i18n';
import { submitMatchBooking } from '@/services/goalkeeperApiClient';

const INPUT_CLASS =
  'mt-1.5 w-full rounded-none border border-[#DCDCE2] bg-[#F8F8FA] px-3 py-2 text-xs font-light text-[#161540] transition placeholder:text-[#828282] focus:border-[#161540] focus:bg-white focus:outline-none';
const LABEL_CLASS = 'block text-[10px] font-normal tracking-[0.08em] text-[#4C4C4C] uppercase';

interface CheckoutDraftState {
  readonly organizerName: string;
  readonly organizerPhone: string;
  readonly venueName: string;
  readonly matchDate: AvailableDay;
  readonly matchTime: string;
}

interface CheckoutFieldsGridProps {
  readonly draft: CheckoutDraftState;
  readonly fieldErrors: BookingFieldErrors;
  readonly dictionary: AppDictionary;
  readonly onUpdate: <TKey extends keyof CheckoutDraftState>(
    key: TKey,
    value: CheckoutDraftState[TKey],
  ) => void;
}

/**
 * Renders the customer identity and match schedule fields inside `BookingCheckoutForm`.
 */
function CheckoutFieldsGrid({
  draft,
  fieldErrors,
  dictionary,
  onUpdate,
}: CheckoutFieldsGridProps): React.JSX.Element {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="bk-organizerName" className={LABEL_CLASS}>
            {dictionary.bookingModal.organizerNameLabel}
          </label>
          <input
            id="bk-organizerName"
            type="text"
            value={draft.organizerName}
            placeholder={dictionary.bookingModal.organizerNamePlaceholder}
            onChange={(e) => onUpdate('organizerName', e.target.value)}
            className={INPUT_CLASS}
          />
          {fieldErrors.organizerName !== undefined && (
            <p role="alert" className="mt-1 text-[11px] text-red-700">
              {dictionary.validation[fieldErrors.organizerName]}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="bk-organizerPhone" className={LABEL_CLASS}>
            {dictionary.bookingModal.organizerPhoneLabel}
          </label>
          <input
            id="bk-organizerPhone"
            type="tel"
            value={draft.organizerPhone}
            placeholder={dictionary.bookingModal.organizerPhonePlaceholder}
            onChange={(e) => onUpdate('organizerPhone', e.target.value)}
            className={INPUT_CLASS}
          />
          {fieldErrors.organizerPhone !== undefined && (
            <p role="alert" className="mt-1 text-[11px] text-red-700">
              {dictionary.validation[fieldErrors.organizerPhone]}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="bk-venueName" className={LABEL_CLASS}>
            {dictionary.bookingModal.venueNameLabel}
          </label>
          <input
            id="bk-venueName"
            type="text"
            value={draft.venueName}
            placeholder={dictionary.bookingModal.venueNamePlaceholder}
            onChange={(e) => onUpdate('venueName', e.target.value)}
            className={INPUT_CLASS}
          />
          {fieldErrors.venueName !== undefined && (
            <p role="alert" className="mt-1 text-[11px] text-red-700">
              {dictionary.validation[fieldErrors.venueName]}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="bk-matchDate" className={LABEL_CLASS}>
            {dictionary.bookingModal.matchDateLabel}
          </label>
          <select
            id="bk-matchDate"
            value={draft.matchDate}
            onChange={(e) => {
              if (isAvailableDay(e.target.value)) {
                onUpdate('matchDate', e.target.value);
              }
            }}
            className={INPUT_CLASS}
          >
            {AVAILABLE_DAYS.map((day) => (
              <option key={day} value={day}>
                {dictionary.days[day]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="bk-matchTime" className={LABEL_CLASS}>
            {dictionary.bookingModal.matchTimeLabel}
          </label>
          <input
            id="bk-matchTime"
            type="text"
            value={draft.matchTime}
            placeholder={dictionary.bookingModal.matchTimePlaceholder}
            onChange={(e) => onUpdate('matchTime', e.target.value)}
            className={INPUT_CLASS}
          />
          {fieldErrors.matchTime !== undefined && (
            <p role="alert" className="mt-1 text-[11px] text-red-700">
              {dictionary.validation[fieldErrors.matchTime]}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Props accepted by the `BookingCheckoutForm` component.
 */
export interface BookingCheckoutFormProps {
  /** Selected goalkeeper profile being booked. */
  readonly profile: GoalkeeperProfile;
  /** Active localized copy dictionary. */
  readonly dictionary: AppDictionary;
  /** Callback invoked when the booking purchase completes on the server. */
  readonly onBookingConfirmed: (booking: BookingRecord) => void;
}

/**
 * Interactive checkout form inside `MatchBookingPreviewModal` collecting customer name,
 * phone number, turf venue, match weekday, and time slot before submitting to `POST /api/bookings`.
 *
 * @param props - `BookingCheckoutFormProps` binding target goalkeeper and confirmation handler.
 * @returns Rendered booking checkout `<form>` element.
 */
export function BookingCheckoutForm({
  profile,
  dictionary,
  onBookingConfirmed,
}: BookingCheckoutFormProps): React.JSX.Element {
  const [draft, setDraft] = useState<CheckoutDraftState>({
    organizerName: '',
    organizerPhone: '',
    venueName: '',
    matchDate: profile.availableDays[0] ?? 'friday',
    matchTime: '21:00 - 22:00',
  });
  const [fieldErrors, setFieldErrors] = useState<BookingFieldErrors>({});
  const [apiErrorCode, setApiErrorCode] = useState<ApiErrorCode | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleUpdate = <TKey extends keyof CheckoutDraftState>(
    key: TKey,
    value: CheckoutDraftState[TKey],
  ): void => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setApiErrorCode(null);

    const validation = validateCreateBookingInput({
      goalkeeperId: profile.id,
      ...draft,
    });
    if (!validation.ok) {
      setFieldErrors(validation.error);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);
    const result = await submitMatchBooking(validation.data);
    setIsSubmitting(false);

    if (!result.ok) {
      if (result.error.fieldErrors !== undefined) {
        setFieldErrors(result.error.fieldErrors);
      }
      setApiErrorCode(result.error.errorCode);
      return;
    }
    onBookingConfirmed(result.data);
  };

  return (
    <form noValidate onSubmit={(e) => void handleSubmit(e)} className="mt-4 space-y-3">
      <CheckoutFieldsGrid
        draft={draft}
        fieldErrors={fieldErrors}
        dictionary={dictionary}
        onUpdate={handleUpdate}
      />

      {apiErrorCode !== null && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-none border border-red-300 bg-red-50 p-2.5 text-xs text-red-900"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-red-700" aria-hidden="true" />
          <span>{dictionary.apiErrors[apiErrorCode]}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-none border border-[#161540] bg-[#161540] py-3.5 text-xs font-normal tracking-[0.12em] text-white uppercase transition hover:bg-white hover:text-[#161540] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span>
          {isSubmitting
            ? dictionary.bookingModal.submittingButton
            : dictionary.bookingModal.confirmRequestButton}
        </span>
        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </form>
  );
}
