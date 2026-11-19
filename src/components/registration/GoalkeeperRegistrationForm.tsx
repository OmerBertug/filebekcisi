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

/**
 * Goalkeeper self-registration section under Electric Pitch dark styling allowing athletes
 * to publish their profile, net-payout rate preview, and weekly schedule into the directory.
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
    <section id="register-goalkeeper" className="bg-[#0B0F12] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="max-w-3xl">
          <span className="font-heading text-xs font-bold tracking-[0.12em] text-[#14E777] uppercase">
            04 // {dictionary.registration.sectionBadge}
          </span>
          <h2 className="mt-2 font-heading text-2xl font-bold tracking-[-0.02em] text-[#F8FAFC] sm:text-4xl">
            {dictionary.registration.sectionTitle}
          </h2>
          <p className="mt-2 text-base text-[#94A3B8]">{dictionary.registration.sectionSubtitle}</p>
        </div>

        <form
          noValidate
          onSubmit={(event) => {
            void handleSubmit(event);
          }}
          className="mt-8 max-w-3xl rounded-xl border border-white/[0.08] bg-[#12181F]/90 p-6 backdrop-blur-md sm:p-10"
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
              className="mt-6 flex items-center gap-2.5 rounded-md border border-[#14E777]/40 bg-[#14E777]/15 p-4 text-xs font-medium text-[#7FFFA2]"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#14E777]" aria-hidden="true" />
              <span>{dictionary.registration.successMessage}</span>
            </div>
          )}

          {apiErrorCode !== null && (
            <div
              role="alert"
              className="mt-6 flex items-center gap-2.5 rounded-md border border-[#FFB4AB]/30 bg-[#93000A]/30 p-4 text-xs font-medium text-[#FFDBD6]"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-[#FFB4AB]" aria-hidden="true" />
              <span>{dictionary.apiErrors[apiErrorCode]}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#14E777] py-4 font-heading text-sm font-bold text-[#0B0F12] shadow-[0_0_24px_-4px_rgba(20,231,119,0.28)] transition duration-150 hover:bg-[#62FF95] hover:shadow-[0_0_28px_-2px_rgba(20,231,119,0.5)] focus-visible:ring-2 focus-visible:ring-[#14E777] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
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
    </section>
  );
}
