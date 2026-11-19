// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

'use client';

import {
  AVAILABLE_DAYS,
  DOMINANT_HANDS,
  EXPERIENCE_LEVELS,
  GOALKEEPER_CONSTRAINTS,
  calculateMatchFeeBreakdown,
  isDominantHand,
  isExperienceLevel,
  type AvailableDay,
  type GoalkeeperFormDraft,
  type RegistrationFieldErrors,
} from '@/domain/goalkeeper';
import type { AppDictionary } from '@/i18n';

const INPUT_CLASS =
  'mt-1.5 w-full rounded-md border border-white/[0.12] bg-[#0B0F12] px-3.5 py-2.5 text-sm text-[#F8FAFC] placeholder:text-[#64748B] transition duration-150 focus:border-[#14E777] focus:ring-1 focus:ring-[#14E777] focus:outline-none';
const LABEL_CLASS = 'block font-heading text-xs font-semibold tracking-wide text-[#E0E3E7]';

interface SelectOptionItem {
  readonly value: string;
  readonly label: string;
}

interface AthleticSelectControlProps {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly options: readonly SelectOptionItem[];
  readonly onChange: (value: string) => void;
}

/**
 * Shared dark-mode select control across athletic qualification attributes.
 */
function AthleticSelectControl({
  id,
  label,
  value,
  options,
  onChange,
}: AthleticSelectControlProps): React.JSX.Element {
  return (
    <div>
      <label htmlFor={id} className={LABEL_CLASS}>
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={INPUT_CLASS}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface WeekdayPickerProps {
  readonly selectedDays: readonly AvailableDay[];
  readonly errorText: string | null;
  readonly dictionary: AppDictionary;
  readonly onToggleDay: (day: AvailableDay) => void;
}

/**
 * Capsule pill weekday selector allowing goalkeepers to toggle available matchdays.
 */
function WeekdayPicker({
  selectedDays,
  errorText,
  dictionary,
  onToggleDay,
}: WeekdayPickerProps): React.JSX.Element {
  return (
    <div>
      <p className={LABEL_CLASS}>{dictionary.registration.availableDaysLabel}</p>
      <p className="mt-1 text-xs text-[#94A3B8]">{dictionary.registration.availableDaysHint}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {AVAILABLE_DAYS.map((day) => {
          const isSelected = selectedDays.includes(day);
          return (
            <button
              key={day}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onToggleDay(day)}
              className={`rounded-full border px-3.5 py-1.5 font-heading text-xs font-medium tracking-wide transition duration-150 ${
                isSelected
                  ? 'border-[#14E777] bg-[#14E777]/[0.12] text-[#14E777]'
                  : 'border-white/[0.12] bg-[#1A232C] text-[#94A3B8] hover:border-white/30 hover:text-[#F8FAFC]'
              }`}
            >
              {dictionary.days[day]}
            </button>
          );
        })}
      </div>
      {errorText !== null && (
        <p role="alert" className="mt-1.5 text-xs font-medium text-[#FFB4AB]">
          {errorText}
        </p>
      )}
    </div>
  );
}

/**
 * Props accepted by `RegistrationSportFields`.
 */
export interface RegistrationSportFieldsProps {
  /** Controlled registration form draft state. */
  readonly draft: GoalkeeperFormDraft;
  /** Active field-level validation error map. */
  readonly fieldErrors: RegistrationFieldErrors;
  /** Active localized copy dictionary. */
  readonly dictionary: AppDictionary;
  /** Typed field updater callback. */
  readonly onUpdateField: <TKey extends keyof GoalkeeperFormDraft>(
    key: TKey,
    value: GoalkeeperFormDraft[TKey],
  ) => void;
  /** Callback toggling individual weekday availability tokens. */
  readonly onToggleDay: (day: AvailableDay) => void;
}

/**
 * Three-column athletic qualification row covering experience tier, dominant hand, and listed fee.
 */
function AthleticAttributesRow({
  draft,
  fieldErrors,
  dictionary,
  onUpdateField,
}: Omit<RegistrationSportFieldsProps, 'onToggleDay'>): React.JSX.Element {
  const experienceOptions = EXPERIENCE_LEVELS.map((tier) => ({
    value: tier,
    label: dictionary.experienceLevels[tier],
  }));
  const handOptions = DOMINANT_HANDS.map((hand) => ({
    value: hand,
    label: dictionary.dominantHands[hand],
  }));

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
      <AthleticSelectControl
        id="reg-experience"
        label={dictionary.registration.experienceLabel}
        value={draft.experienceLevel}
        options={experienceOptions}
        onChange={(val) => {
          if (isExperienceLevel(val)) {
            onUpdateField('experienceLevel', val);
          }
        }}
      />
      <AthleticSelectControl
        id="reg-hand"
        label={dictionary.registration.dominantHandLabel}
        value={draft.dominantHand}
        options={handOptions}
        onChange={(val) => {
          if (isDominantHand(val)) {
            onUpdateField('dominantHand', val);
          }
        }}
      />
      <div>
        <label htmlFor="reg-fee" className={LABEL_CLASS}>
          {dictionary.registration.matchFeeLabel}
        </label>
        <input
          id="reg-fee"
          type="number"
          min={GOALKEEPER_CONSTRAINTS.MIN_FEE_TRY}
          max={GOALKEEPER_CONSTRAINTS.MAX_FEE_TRY}
          step={25}
          value={draft.matchFeeTry}
          aria-invalid={fieldErrors.matchFeeTry !== undefined}
          onChange={(e) => onUpdateField('matchFeeTry', e.target.value)}
          className={INPUT_CLASS}
        />
        {fieldErrors.matchFeeTry !== undefined && (
          <p role="alert" className="mt-1.5 text-xs font-medium text-[#FFB4AB]">
            {dictionary.validation[fieldErrors.matchFeeTry]}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Renders athletic attributes, glowing Electric Pitch dynamic net-payout calculation card,
 * capsule weekday toggles, and goalkeeper bio input.
 *
 * @param props - `RegistrationSportFieldsProps` binding athletic fields and callbacks.
 * @returns Athletic attributes form section.
 */
export function RegistrationSportFields(props: RegistrationSportFieldsProps): React.JSX.Element {
  const { draft, fieldErrors, dictionary, onUpdateField, onToggleDay } = props;
  const numericFee = Number(draft.matchFeeTry);
  const feePreview = calculateMatchFeeBreakdown(Number.isFinite(numericFee) ? numericFee : 0);
  const currency = dictionary.filters.currencySymbol;

  return (
    <div className="mt-5 space-y-5">
      <AthleticAttributesRow
        draft={draft}
        fieldErrors={fieldErrors}
        dictionary={dictionary}
        onUpdateField={onUpdateField}
      />

      <div className="grid grid-cols-1 gap-4 rounded-lg border border-[#14E777]/35 bg-[#1A232C] p-5 shadow-[0_0_24px_-4px_rgba(20,231,119,0.18)] sm:grid-cols-2">
        <div>
          <p className="text-xs text-[#94A3B8]">
            {dictionary.registration.feePreviewOrganizerPays}
          </p>
          <p className="font-heading mt-1 text-2xl font-bold tracking-tight tabular-nums text-[#F8FAFC]">
            {feePreview.listedFeeTry} {currency}
          </p>
        </div>
        <div>
          <p className="text-xs text-[#BACBB9]">
            {dictionary.registration.feePreviewGoalkeeperGets}
          </p>
          <p className="font-heading mt-1 text-3xl font-bold tracking-[-0.02em] tabular-nums text-[#14E777]">
            {feePreview.goalkeeperNetPayoutTry} {currency}
          </p>
        </div>
      </div>

      <WeekdayPicker
        selectedDays={draft.availableDays}
        errorText={
          fieldErrors.availableDays !== undefined
            ? dictionary.validation[fieldErrors.availableDays]
            : null
        }
        dictionary={dictionary}
        onToggleDay={onToggleDay}
      />

      <div>
        <label htmlFor="reg-bio" className={LABEL_CLASS}>
          {dictionary.registration.bioLabel}
        </label>
        <textarea
          id="reg-bio"
          rows={3}
          maxLength={GOALKEEPER_CONSTRAINTS.MAX_BIO_LENGTH}
          value={draft.bio}
          placeholder={dictionary.registration.bioPlaceholder}
          aria-invalid={fieldErrors.bio !== undefined}
          onChange={(e) => onUpdateField('bio', e.target.value)}
          className={INPUT_CLASS}
        />
        {fieldErrors.bio !== undefined && (
          <p role="alert" className="mt-1.5 text-xs font-medium text-[#FFB4AB]">
            {dictionary.validation[fieldErrors.bio]}
          </p>
        )}
      </div>
    </div>
  );
}
