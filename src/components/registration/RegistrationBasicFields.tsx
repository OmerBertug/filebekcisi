// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

'use client';

import {
  DISTRICT_CODES,
  GOALKEEPER_CONSTRAINTS,
  isDistrictCode,
  type GoalkeeperFormDraft,
  type RegistrationFieldErrors,
  type ValidationErrorCode,
} from '@/domain/goalkeeper';
import type { AppDictionary } from '@/i18n';

const INPUT_CLASS =
  'mt-1.5 w-full rounded-md border border-white/[0.12] bg-[#0B0F12] px-3.5 py-2.5 text-sm text-[#F8FAFC] placeholder:text-[#64748B] transition duration-150 focus:border-[#14E777] focus:ring-1 focus:ring-[#14E777] focus:outline-none';
const LABEL_CLASS = 'block font-heading text-xs font-semibold tracking-wide text-[#E0E3E7]';

interface LabeledInputFieldProps {
  readonly id: string;
  readonly label: string;
  readonly type: 'text' | 'tel' | 'number';
  readonly value: string;
  readonly placeholder?: string;
  readonly min?: number;
  readonly max?: number;
  readonly errorCode: ValidationErrorCode | undefined;
  readonly dictionary: AppDictionary;
  readonly onChange: (value: string) => void;
}

/**
 * Accessible dark-mode single-line input control binding label, error alert, and ARIA attributes.
 *
 * @param props - `LabeledInputFieldProps` configuring field validation and change listener.
 * @returns Rendered labeled `<input>` group.
 */
function LabeledInputField({
  id,
  label,
  type,
  value,
  placeholder,
  min,
  max,
  errorCode,
  dictionary,
  onChange,
}: LabeledInputFieldProps): React.JSX.Element {
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className={LABEL_CLASS}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        min={min}
        max={max}
        value={value}
        placeholder={placeholder}
        aria-invalid={errorCode !== undefined}
        aria-describedby={errorCode !== undefined ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={INPUT_CLASS}
      />
      {errorCode !== undefined && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs font-medium text-[#FFB4AB]">
          {dictionary.validation[errorCode]}
        </p>
      )}
    </div>
  );
}

/**
 * Props accepted by `RegistrationBasicFields`.
 */
export interface RegistrationBasicFieldsProps {
  /** Controlled registration form draft state. */
  readonly draft: GoalkeeperFormDraft;
  /** Active field-level validation error map. */
  readonly fieldErrors: RegistrationFieldErrors;
  /** Active localized copy dictionary. */
  readonly dictionary: AppDictionary;
  /** Typed field updater callback from `useGoalkeeperRegistrationForm`. */
  readonly onUpdateField: <TKey extends keyof GoalkeeperFormDraft>(
    key: TKey,
    value: GoalkeeperFormDraft[TKey],
  ) => void;
}

/**
 * Renders personal and demographic form inputs (full name, phone, primary district, age, height)
 * for goalkeeper onboarding with accessible `aria-invalid` and `aria-describedby` bindings.
 *
 * @param props - `RegistrationBasicFieldsProps` binding form draft state and error descriptors.
 * @returns Grid of labeled personal profile inputs.
 */
export function RegistrationBasicFields({
  draft,
  fieldErrors,
  dictionary,
  onUpdateField,
}: RegistrationBasicFieldsProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <LabeledInputField
        id="reg-fullName"
        label={dictionary.registration.fullNameLabel}
        type="text"
        value={draft.fullName}
        placeholder={dictionary.registration.fullNamePlaceholder}
        errorCode={fieldErrors.fullName}
        dictionary={dictionary}
        onChange={(val) => onUpdateField('fullName', val)}
      />

      <LabeledInputField
        id="reg-phone"
        label={dictionary.registration.phoneLabel}
        type="tel"
        value={draft.phone}
        placeholder={dictionary.registration.phonePlaceholder}
        errorCode={fieldErrors.phone}
        dictionary={dictionary}
        onChange={(val) => onUpdateField('phone', val)}
      />

      <div>
        <label htmlFor="reg-district" className={LABEL_CLASS}>
          {dictionary.registration.districtLabel}
        </label>
        <select
          id="reg-district"
          value={draft.district}
          onChange={(e) => {
            if (isDistrictCode(e.target.value)) {
              onUpdateField('district', e.target.value);
            }
          }}
          className={INPUT_CLASS}
        >
          {DISTRICT_CODES.map((code) => (
            <option key={code} value={code}>
              {dictionary.districts[code]}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <LabeledInputField
          id="reg-age"
          label={dictionary.registration.ageLabel}
          type="number"
          min={GOALKEEPER_CONSTRAINTS.MIN_AGE}
          max={GOALKEEPER_CONSTRAINTS.MAX_AGE}
          value={draft.age}
          errorCode={fieldErrors.age}
          dictionary={dictionary}
          onChange={(val) => onUpdateField('age', val)}
        />
        <LabeledInputField
          id="reg-heightCm"
          label={dictionary.registration.heightLabel}
          type="number"
          min={GOALKEEPER_CONSTRAINTS.MIN_HEIGHT_CM}
          max={GOALKEEPER_CONSTRAINTS.MAX_HEIGHT_CM}
          value={draft.heightCm}
          errorCode={fieldErrors.heightCm}
          dictionary={dictionary}
          onChange={(val) => onUpdateField('heightCm', val)}
        />
      </div>
    </div>
  );
}
