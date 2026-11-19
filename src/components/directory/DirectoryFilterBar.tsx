// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

'use client';

import { RotateCcw } from 'lucide-react';
import {
  AVAILABLE_DAYS,
  DISTRICT_CODES,
  EXPERIENCE_LEVELS,
  FILTER_ALL_VALUE,
  isAvailableDay,
  isDistrictCode,
  isExperienceLevel,
  type GoalkeeperFilterCriteria,
} from '@/domain/goalkeeper';
import type { AppDictionary } from '@/i18n';

const BUDGET_TIERS = [350, 450, 600, 1000] as const;

interface SelectOptionItem {
  readonly value: string;
  readonly label: string;
}

interface FilterSelectFieldProps {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly options: readonly SelectOptionItem[];
  readonly onChange: (value: string) => void;
}

/**
 * Technical dark-mode select control pairing an uppercase Geist label with a `#1A232C` input.
 *
 * @param props - `FilterSelectFieldProps` specifying field identity, options, and change callback.
 * @returns Labeled dropdown element.
 */
function FilterSelectField({
  id,
  label,
  value,
  options,
  onChange,
}: FilterSelectFieldProps): React.JSX.Element {
  return (
    <div>
      <label
        htmlFor={id}
        className="block font-heading text-xs font-semibold tracking-[0.06em] text-[#94A3B8] uppercase"
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 w-full rounded-md border border-white/[0.12] bg-[#1A232C] px-3 py-2.5 text-sm text-[#F8FAFC] transition duration-150 focus:border-[#14E777] focus:ring-1 focus:ring-[#14E777] focus:outline-none"
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

/**
 * Props accepted by the `DirectoryFilterBar` component.
 */
export interface DirectoryFilterBarProps {
  /** Active localized copy dictionary. */
  readonly dictionary: AppDictionary;
  /** Current organizer filter selection state. */
  readonly criteria: GoalkeeperFilterCriteria;
  /** Number of matching goalkeepers currently displayed. */
  readonly resultCount: number;
  /** Callback updating filter criteria when any dropdown changes. */
  readonly onCriteriaChange: (next: GoalkeeperFilterCriteria) => void;
  /** Callback resetting all filter controls to their default unfiltered state. */
  readonly onReset: () => void;
}

/**
 * Electric Pitch organizer search control bar filtering goalkeepers by district, experience
 * tier, weekday availability, and maximum match fee.
 *
 * @param props - `DirectoryFilterBarProps` binding filter state and callbacks.
 * @returns Rendered dark glassmorphic filter control panel.
 */
export function DirectoryFilterBar({
  dictionary,
  criteria,
  resultCount,
  onCriteriaChange,
  onReset,
}: DirectoryFilterBarProps): React.JSX.Element {
  const districtOptions: SelectOptionItem[] = [
    { value: FILTER_ALL_VALUE, label: dictionary.filters.allDistricts },
    ...DISTRICT_CODES.map((code) => ({ value: code, label: dictionary.districts[code] })),
  ];
  const experienceOptions: SelectOptionItem[] = [
    { value: FILTER_ALL_VALUE, label: dictionary.filters.allExperiences },
    ...EXPERIENCE_LEVELS.map((tier) => ({
      value: tier,
      label: dictionary.experienceLevels[tier],
    })),
  ];
  const dayOptions: SelectOptionItem[] = [
    { value: FILTER_ALL_VALUE, label: dictionary.filters.allDays },
    ...AVAILABLE_DAYS.map((day) => ({ value: day, label: dictionary.days[day] })),
  ];
  const budgetOptions: SelectOptionItem[] = [
    { value: FILTER_ALL_VALUE, label: dictionary.filters.anyBudget },
    ...BUDGET_TIERS.map((amt) => ({
      value: String(amt),
      label: `${amt} ${dictionary.filters.currencySymbol}`,
    })),
  ];

  return (
    <div className="rounded-lg border border-white/[0.08] bg-[#12181F]/90 p-5 backdrop-blur-md">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FilterSelectField
          id="filter-district"
          label={dictionary.filters.districtLabel}
          value={criteria.district}
          options={districtOptions}
          onChange={(val) => {
            if (val === FILTER_ALL_VALUE || isDistrictCode(val)) {
              onCriteriaChange({ ...criteria, district: val });
            }
          }}
        />
        <FilterSelectField
          id="filter-experience"
          label={dictionary.filters.experienceLabel}
          value={criteria.experienceLevel}
          options={experienceOptions}
          onChange={(val) => {
            if (val === FILTER_ALL_VALUE || isExperienceLevel(val)) {
              onCriteriaChange({ ...criteria, experienceLevel: val });
            }
          }}
        />
        <FilterSelectField
          id="filter-day"
          label={dictionary.filters.dayLabel}
          value={criteria.availableDay}
          options={dayOptions}
          onChange={(val) => {
            if (val === FILTER_ALL_VALUE || isAvailableDay(val)) {
              onCriteriaChange({ ...criteria, availableDay: val });
            }
          }}
        />
        <FilterSelectField
          id="filter-budget"
          label={dictionary.filters.maxBudgetLabel}
          value={criteria.maxFeeTry === null ? FILTER_ALL_VALUE : String(criteria.maxFeeTry)}
          options={budgetOptions}
          onChange={(val) => {
            const parsed = Number(val);
            onCriteriaChange({
              ...criteria,
              maxFeeTry: val === FILTER_ALL_VALUE || !Number.isFinite(parsed) ? null : parsed,
            });
          }}
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
        <p aria-live="polite" className="text-xs text-[#94A3B8]">
          <span className="font-heading font-bold tabular-nums text-[#14E777]">{resultCount}</span>{' '}
          {dictionary.filters.resultsCountSuffix}
        </p>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#94A3B8] underline-offset-4 transition hover:text-[#F8FAFC] hover:underline"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{dictionary.filters.resetFilters}</span>
        </button>
      </div>
    </div>
  );
}
