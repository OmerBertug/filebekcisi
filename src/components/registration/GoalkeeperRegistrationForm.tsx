// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

'use client';

import { AlertCircle, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { REQUEST_STATES, type GoalkeeperProfile } from '@/domain/goalkeeper';
import { useGoalkeeperRegistrationForm } from '@/hooks/useGoalkeeperRegistrationForm';
import type { AppDictionary } from '@/i18n';
import { RegistrationBasicFields } from './RegistrationBasicFields';
import { RegistrationSportFields } from './RegistrationSportFields';

/**
 * Props accepted by the `GoalkeeperRegistrationForm` onboarding section component.
 */
export interface GoalkeeperRegistrationFormProps {
  /** Active localized copy dictionary. */
  readonly dictionary: AppDictionary;
  /** Callback fired immediately when a new goalkeeper profile is persisted via the API. */
  readonly onGoalkeeperRegistered: (profile: GoalkeeperProfile) => void;
}

interface RegistrationSectionHeaderProps {
  readonly dictionary: AppDictionary;
}

/**
 * Architectural 6-column header band introducing the goalkeeper registration workflow.
 *
 * @param props - `RegistrationSectionHeaderProps` holding localized badge and title text.
 * @returns Hairline-divided grid header band.
 */
function RegistrationSectionHeader({
  dictionary,
}: RegistrationSectionHeaderProps): React.JSX.Element {
  return (
    <div className="mx-auto grid max-w-[1440px] grid-cols-1 border-b border-[#DCDCE2] bg-[#F8F8FA] lg:grid-cols-6">
      <div className="border-b border-[#DCDCE2] px-4 py-8 sm:px-8 lg:col-span-1 lg:border-r lg:border-b-0">
        <span className="block text-[11px] font-light tracking-[0.18em] text-[#636262] uppercase">
          04
        </span>
        <h2 className="mt-2 text-sm font-light tracking-[0.14em] text-[#161540] uppercase">
          {dictionary.registration.sectionBadge}
        </h2>
      </div>

      <div className="px-4 py-8 sm:px-10 lg:col-span-5">
        <p className="text-2xl font-light text-[#161540] sm:text-3xl">
          {dictionary.registration.sectionTitle}
        </p>
        <p className="mt-2 max-w-3xl text-sm font-light text-[#636262] sm:text-base">
          {dictionary.registration.sectionSubtitle}
        </p>
      </div>
    </div>
  );
}

/**
 * Institutional goalkeeper self-registration section structured on a 6-column architectural
 * hairline grid, allowing athletes to publish their profile, match fee, and weekly schedule.
 *
 * Delegates state and schema validation to `useGoalkeeperRegistrationForm` and splits input
 * controls across `RegistrationBasicFields` and `RegistrationSportFields`.
 *
 * @param props - `GoalkeeperRegistrationFormProps` providing localized copy and completion handler.
 * @returns Semantic `<section>` wrapping the self-registration `<form>`.
 */
export function GoalkeeperRegistrationForm({
  dictionary,
  onGoalkeeperRegistered,
}: GoalkeeperRegistrationFormProps): React.JSX.Element {
  const {
    draft,
    fieldErrors,
    submitState,
    apiErrorCode,
    updateField,
    toggleAvailableDay,
    handleSubmit,
  } = useGoalkeeperRegistrationForm(onGoalkeeperRegistered);

  const isSubmitting = submitState === REQUEST_STATES.LOADING;

  return (
    <section id="register-goalkeeper" className="border-b border-[#DCDCE2] bg-[#E8E8EC]/40">
      <RegistrationSectionHeader dictionary={dictionary} />

      <div className="mx-auto grid max-w-[1440px] grid-cols-1 lg:grid-cols-6">
        <div className="hidden border-r border-[#DCDCE2] lg:col-span-1 lg:block" />

        <div className="px-4 py-10 sm:px-10 lg:col-span-5">
          <form
            noValidate
            onSubmit={(event) => {
              void handleSubmit(event);
            }}
            className="max-w-3xl rounded-none border border-[#DCDCE2] bg-white p-6 sm:p-10"
          >
            <RegistrationBasicFields
              draft={draft}
              fieldErrors={fieldErrors}
              dictionary={dictionary}
              onUpdateField={updateField}
            />

            <RegistrationSportFields
              draft={draft}
              fieldErrors={fieldErrors}
              dictionary={dictionary}
              onUpdateField={updateField}
              onToggleDay={toggleAvailableDay}
            />

            {submitState === REQUEST_STATES.SUCCESS && (
              <div
                role="status"
                className="mt-6 flex items-center gap-2.5 rounded-none border border-[#161540] bg-[#161540] p-4 text-xs font-light text-white"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-white" aria-hidden="true" />
                <span>{dictionary.registration.successMessage}</span>
              </div>
            )}

            {apiErrorCode !== null && (
              <div
                role="alert"
                className="mt-6 flex items-center gap-2.5 rounded-none border border-red-300 bg-red-50 p-4 text-xs font-normal text-red-900"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-red-700" aria-hidden="true" />
                <span>{dictionary.apiErrors[apiErrorCode]}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-none border border-[#161540] bg-[#161540] py-4 text-xs font-normal tracking-[0.14em] text-white uppercase transition hover:bg-white hover:text-[#161540] focus-visible:ring-2 focus-visible:ring-[#161540] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span>
                {isSubmitting
                  ? dictionary.registration.submittingButton
                  : dictionary.registration.submitButton}
              </span>
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
