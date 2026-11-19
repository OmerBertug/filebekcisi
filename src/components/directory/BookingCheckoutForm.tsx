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
  type ValidationErrorCode,
} from '@/domain/goalkeeper';
import type { AppDictionary } from '@/i18n';
import { submitMatchBooking } from '@/services/goalkeeperApiClient';

const INPUT_CLASS =
  'mt-1.5 w-full rounded-md border border-white/[0.12] bg-[#0B0F12] px-3 py-2 text-xs text-[#F8FAFC] placeholder:text-[#64748B] transition duration-150 focus:border-[#14E777] focus:ring-1 focus:ring-[#14E777] focus:outline-none';
const LABEL_CLASS =
  'block font-heading text-[11px] font-semibold tracking-wide text-[#E0E3E7] uppercase';

interface CheckoutDraftState {
  readonly organizerName: string;
  readonly organizerPhone: string;
  readonly venueName: string;
  readonly matchDate: AvailableDay;
  readonly matchTime: string;
}

interface CheckoutInputFieldProps {
  readonly id: string;
  readonly label: string;
  readonly type: 'text' | 'tel';
  readonly value: string;
  readonly placeholder: string;
  readonly errorCode: ValidationErrorCode | undefined;
  readonly dictionary: AppDictionary;
  readonly onChange: (value: string) => void;
}

/**
 * Shared dark-mode input field used across customer contact and venue inputs.
 */
function CheckoutInputField({
  id,
  label,
  type,
  value,
  placeholder,
  errorCode,
  dictionary,
  onChange,
}: CheckoutInputFieldProps): React.JSX.Element {
  return (
    <div>
      <label htmlFor={id} className={LABEL_CLASS}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={INPUT_CLASS}
      />
      {errorCode !== undefined && (
        <p role="alert" className="mt-1 text-[11px] text-[#FFB4AB]">
          {dictionary.validation[errorCode]}
        </p>
      )}
    </div>
  );
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
 * Renders customer contact details and match scheduling controls inside `BookingCheckoutForm`.
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
        <CheckoutInputField
          id="bk-organizerName"
          label={dictionary.bookingModal.organizerNameLabel}
          type="text"
          value={draft.organizerName}
          placeholder={dictionary.bookingModal.organizerNamePlaceholder}
          errorCode={fieldErrors.organizerName}
          dictionary={dictionary}
          onChange={(val) => onUpdate('organizerName', val)}
        />
        <CheckoutInputField
          id="bk-organizerPhone"
          label={dictionary.bookingModal.organizerPhoneLabel}
          type="tel"
          value={draft.organizerPhone}
          placeholder={dictionary.bookingModal.organizerPhonePlaceholder}
          errorCode={fieldErrors.organizerPhone}
          dictionary={dictionary}
          onChange={(val) => onUpdate('organizerPhone', val)}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <CheckoutInputField
          id="bk-venueName"
          label={dictionary.bookingModal.venueNameLabel}
          type="text"
          value={draft.venueName}
          placeholder={dictionary.bookingModal.venueNamePlaceholder}
          errorCode={fieldErrors.venueName}
          dictionary={dictionary}
          onChange={(val) => onUpdate('venueName', val)}
        />
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
        <CheckoutInputField
          id="bk-matchTime"
          label={dictionary.bookingModal.matchTimeLabel}
          type="text"
          value={draft.matchTime}
          placeholder={dictionary.bookingModal.matchTimePlaceholder}
          errorCode={fieldErrors.matchTime}
          dictionary={dictionary}
          onChange={(val) => onUpdate('matchTime', val)}
        />
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
 * Interactive dark-mode checkout form inside `MatchBookingPreviewModal` collecting customer name,
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

    const validation = validateCreateBookingInput({ goalkeeperId: profile.id, ...draft });
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
          className="flex items-center gap-2 rounded-md border border-[#FFB4AB]/30 bg-[#93000A]/30 p-2.5 text-xs text-[#FFDBD6]"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-[#FFB4AB]" aria-hidden="true" />
          <span>{dictionary.apiErrors[apiErrorCode]}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#14E777] py-3.5 font-heading text-xs font-bold tracking-wider text-[#0B0F12] uppercase shadow-[0_0_24px_-4px_rgba(20,231,119,0.3)] transition duration-150 hover:bg-[#62FF95] disabled:cursor-not-allowed disabled:opacity-60"
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
