// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

'use client';

import { useCallback, useState, type FormEvent } from 'react';
import {
  INITIAL_GOALKEEPER_FORM_DRAFT,
  REQUEST_STATES,
  buildCandidateGoalkeeperInput,
  validateCreateGoalkeeperInput,
  type ApiErrorCode,
  type AvailableDay,
  type GoalkeeperFormDraft,
  type GoalkeeperProfile,
  type RegistrationFieldErrors,
  type RequestState,
} from '@/domain/goalkeeper';
import { submitGoalkeeperRegistration } from '@/services/goalkeeperApiClient';

/**
 * Return contract of `useGoalkeeperRegistrationForm` encapsulating draft values, field errors,
 * submission status, and typed change handlers.
 */
export interface UseGoalkeeperRegistrationResult {
  readonly draft: GoalkeeperFormDraft;
  readonly fieldErrors: RegistrationFieldErrors;
  readonly submitState: RequestState;
  readonly apiErrorCode: ApiErrorCode | null;
  readonly updateField: <TKey extends keyof GoalkeeperFormDraft>(
    key: TKey,
    value: GoalkeeperFormDraft[TKey],
  ) => void;
  readonly toggleAvailableDay: (day: AvailableDay) => void;
  readonly handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}

/**
 * Custom React hook managing goalkeeper self-registration form state, client-side Zod validation,
 * API submission, and post-registration reset behavior.
 *
 * @param onRegistered - Callback invoked with the newly created `GoalkeeperProfile` on HTTP 201.
 * @returns `UseGoalkeeperRegistrationResult` binding state and handlers to registration inputs.
 */
export function useGoalkeeperRegistrationForm(
  onRegistered: (profile: GoalkeeperProfile) => void,
): UseGoalkeeperRegistrationResult {
  const [draft, setDraft] = useState<GoalkeeperFormDraft>(INITIAL_GOALKEEPER_FORM_DRAFT);
  const [fieldErrors, setFieldErrors] = useState<RegistrationFieldErrors>({});
  const [submitState, setSubmitState] = useState<RequestState>(REQUEST_STATES.IDLE);
  const [apiErrorCode, setApiErrorCode] = useState<ApiErrorCode | null>(null);

  const updateField = useCallback(
    <TKey extends keyof GoalkeeperFormDraft>(key: TKey, value: GoalkeeperFormDraft[TKey]): void => {
      setDraft((prev) => ({ ...prev, [key]: value }));
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
      if (submitState === REQUEST_STATES.SUCCESS) {
        setSubmitState(REQUEST_STATES.IDLE);
      }
    },
    [submitState],
  );

  const toggleAvailableDay = useCallback((day: AvailableDay): void => {
    setDraft((prev) => {
      const exists = prev.availableDays.includes(day);
      const nextDays = exists
        ? prev.availableDays.filter((item) => item !== day)
        : [...prev.availableDays, day];
      return { ...prev, availableDays: nextDays };
    });
    setFieldErrors((prev) => ({ ...prev, availableDays: undefined }));
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>): Promise<void> => {
      event.preventDefault();
      setApiErrorCode(null);

      const validation = validateCreateGoalkeeperInput(buildCandidateGoalkeeperInput(draft));
      if (!validation.ok) {
        setFieldErrors(validation.error);
        setSubmitState(REQUEST_STATES.ERROR);
        return;
      }

      setFieldErrors({});
      setSubmitState(REQUEST_STATES.LOADING);

      const result = await submitGoalkeeperRegistration(validation.data);
      if (!result.ok) {
        setApiErrorCode(result.error.errorCode);
        if (result.error.fieldErrors !== undefined) {
          setFieldErrors(result.error.fieldErrors);
        }
        setSubmitState(REQUEST_STATES.ERROR);
        return;
      }

      setDraft(INITIAL_GOALKEEPER_FORM_DRAFT);
      setSubmitState(REQUEST_STATES.SUCCESS);
      onRegistered(result.data);
    },
    [draft, onRegistered],
  );

  return {
    draft,
    fieldErrors,
    submitState,
    apiErrorCode,
    updateField,
    toggleAvailableDay,
    handleSubmit,
  };
}
