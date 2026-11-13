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
 * Renders the responsive goalkeeper directory grid along with accessible loading, error,
 * and empty-filter architectural feedback panels.
 *
 * @param props - `GoalkeeperGridProps` describing current profiles, loading status, and handlers.
 * @returns Rendered directory state or responsive card grid.
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
        className="mt-6 rounded-none border border-[#DCDCE2] bg-white p-10 text-center text-sm font-light text-[#636262]"
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
        className="mt-6 flex flex-col items-center rounded-none border border-red-300 bg-red-50 p-8 text-center"
      >
        <AlertCircle className="h-8 w-8 text-red-700" aria-hidden="true" />
        <p className="mt-3 text-sm font-normal text-red-900">{errorMessage}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-none border border-red-700 bg-red-700 px-5 py-2 text-xs font-normal tracking-wider text-white uppercase transition hover:bg-white hover:text-red-700"
        >
          {dictionary.grid.retryButton}
        </button>
      </div>
    );
  }

  if (goalkeepers.length === 0) {
    return (
      <div className="mt-6 flex flex-col items-center rounded-none border border-[#DCDCE2] bg-white p-10 text-center">
        <SearchX className="h-8 w-8 text-[#636262]" aria-hidden="true" />
        <h3 className="mt-3 text-base font-normal text-[#161540]">{dictionary.grid.emptyTitle}</h3>
        <p className="mt-1 max-w-md text-sm font-light text-[#636262]">
          {dictionary.grid.emptyDescription}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
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
