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
  'mt-2 w-full rounded-none border border-[#DCDCE2] bg-[#F8F8FA] px-3.5 py-2.5 text-sm font-light text-[#161540] transition placeholder:text-[#828282] focus:border-[#161540] focus:bg-white focus:outline-none';
const LABEL_CLASS = 'block text-[11px] font-normal tracking-[0.08em] text-[#4C4C4C] uppercase';

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
 * Shared architectural select field used across athletic qualification attributes.
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
 * Multi-select architectural button grid allowing goalkeepers to toggle available weekdays.
 *
 * @param props - `WeekdayPickerProps` holding selected day codes and validation error text.
 * @returns Accessible weekday toggle button group.
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
      <p className="mt-1 text-xs font-light text-[#636262]">
        {dictionary.registration.availableDaysHint}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {AVAILABLE_DAYS.map((day) => {
          const isSelected = selectedDays.includes(day);
          return (
            <button
              key={day}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onToggleDay(day)}
              className={`rounded-none border px-3.5 py-2 text-[11px] font-normal tracking-wider uppercase transition ${
                isSelected
                  ? 'border-[#161540] bg-[#161540] text-white'
                  : 'border-[#DCDCE2] bg-white text-[#4C4C4C] hover:border-[#161540] hover:text-[#161540]'
              }`}
            >
              {dictionary.days[day]}
            </button>
          );
        })}
      </div>
      {errorText !== null && (
        <p role="alert" className="mt-1.5 text-xs font-normal text-red-700">
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
 * Three-column athletic qualification row covering experience tier, dominant hand, and net fee.
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
          <p role="alert" className="mt-1.5 text-xs font-normal text-red-700">
            {dictionary.validation[fieldErrors.matchFeeTry]}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Renders athletic attributes, match fee with real-time brokerage commission preview,
 * available weekday toggles, and goalkeeper bio input.
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

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-none border border-[#DCDCE2] bg-[#F8F8FA] px-4 py-3 text-xs font-light text-[#161540]">
        <span>
          {dictionary.registration.feePreviewGoalkeeperGets}{' '}
          <strong className="font-normal">
            {feePreview.goalkeeperFeeTry} {currency}
          </strong>
        </span>
        <span>
          {dictionary.registration.feePreviewOrganizerPays}{' '}
          <strong className="font-normal">
            {feePreview.totalPayableTry} {currency}
          </strong>
        </span>
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
          <p role="alert" className="mt-1.5 text-xs font-normal text-red-700">
            {dictionary.validation[fieldErrors.bio]}
          </p>
        )}
      </div>
    </div>
  );
}
