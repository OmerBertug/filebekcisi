// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

'use client';

import { AlertCircle, SearchX } from 'lucide-react';
import {
  REQUEST_STATES,
  type ApiErrorCode,
  type GoalkeeperProfile,
  type RequestState,
} from '@/domain/goalkeeper';
import type { AppDictionary } from '@/i18n';
import { GoalkeeperCard } from './GoalkeeperCard';

/**
 * Props accepted by the `GoalkeeperGrid` directory presentation component.
 */
export interface GoalkeeperGridProps {
  /** Filtered goalkeeper profiles ready for display. */
  readonly goalkeepers: readonly GoalkeeperProfile[];
  /** Current network fetch lifecycle state (`idle` | `loading` | `success` | `error`). */
  readonly requestState: RequestState;
  /** Structured API error code when `requestState` is `'error'`. */
  readonly errorCode: ApiErrorCode | null;
  /** Active localized copy dictionary. */
  readonly dictionary: AppDictionary;
  /** Callback invoked when the organizer clicks retry after a network error. */
  readonly onRetry: () => void;
  /** Callback invoked when the organizer invites a specific goalkeeper to a match. */
  readonly onSelectForMatch: (profile: GoalkeeperProfile) => void;
}

/**
 * Renders the responsive goalkeeper directory grid along with accessible dark-mode loading,
 * error, and empty-filter feedback panels.
 *
 * @param props - `GoalkeeperGridProps` describing current profiles, loading status, and handlers.
 * @returns Rendered directory state or responsive 3-column card grid.
 */
export function GoalkeeperGrid({
  goalkeepers,
  requestState,
  errorCode,
  dictionary,
  onRetry,
  onSelectForMatch,
}: GoalkeeperGridProps): React.JSX.Element {
  if (requestState === REQUEST_STATES.LOADING) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="mt-6 rounded-lg border border-white/[0.08] bg-[#12181F] p-10 text-center text-sm text-[#94A3B8]"
      >
        {dictionary.grid.loadingMessage}
      </div>
    );
  }

  if (requestState === REQUEST_STATES.ERROR) {
    const errorMessage =
      errorCode !== null ? dictionary.apiErrors[errorCode] : dictionary.grid.errorMessage;
    return (
      <div
        role="alert"
        className="mt-6 flex flex-col items-center rounded-lg border border-[#FFB4AB]/30 bg-[#93000A]/30 p-8 text-center"
      >
        <AlertCircle className="h-8 w-8 text-[#FFB4AB]" aria-hidden="true" />
        <p className="mt-3 text-sm font-medium text-[#FFDBD6]">{errorMessage}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-md border border-[#FFB4AB]/40 bg-[#93000A] px-5 py-2 font-heading text-xs font-semibold tracking-wider text-[#FFDBD6] uppercase transition hover:bg-[#FFB4AB] hover:text-[#690005]"
        >
          {dictionary.grid.retryButton}
        </button>
      </div>
    );
  }

  if (goalkeepers.length === 0) {
    return (
      <div className="mt-6 flex flex-col items-center rounded-lg border border-white/[0.08] bg-[#12181F] p-10 text-center">
        <SearchX className="h-8 w-8 text-[#94A3B8]" aria-hidden="true" />
        <h3 className="mt-3 font-heading text-base font-semibold text-[#F8FAFC]">
          {dictionary.grid.emptyTitle}
        </h3>
        <p className="mt-1.5 max-w-md text-sm text-[#94A3B8]">{dictionary.grid.emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {goalkeepers.map((profile) => (
        <GoalkeeperCard
          key={profile.id}
          profile={profile}
          dictionary={dictionary}
          onSelectForMatch={onSelectForMatch}
        />
      ))}
    </div>
  );
}
