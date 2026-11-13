// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  REQUEST_STATES,
  type ApiErrorCode,
  type GoalkeeperProfile,
  type RequestState,
} from '@/domain/goalkeeper';
import { fetchGoalkeepersList } from '@/services/goalkeeperApiClient';

/**
 * State and imperative actions returned by the `useGoalkeepers` directory hook.
 */
export interface UseGoalkeepersResult {
  readonly goalkeepers: readonly GoalkeeperProfile[];
  readonly requestState: RequestState;
  readonly errorCode: ApiErrorCode | null;
  readonly prependGoalkeeper: (profile: GoalkeeperProfile) => void;
  readonly reload: () => void;
}

/**
 * Custom React hook managing goalkeeper directory fetching, abort cleanup, and optimistic insertion.
 *
 * Automatically cancels in-flight HTTP requests via `AbortController` when the consuming component
 * unmounts or triggers a reload, preventing stale state updates and memory leaks.
 *
 * @returns `UseGoalkeepersResult` exposing the goalkeeper collection, status, and mutation helpers.
 */
export function useGoalkeepers(): UseGoalkeepersResult {
  const [goalkeepers, setGoalkeepers] = useState<readonly GoalkeeperProfile[]>([]);
  const [requestState, setRequestState] = useState<RequestState>(REQUEST_STATES.LOADING);
  const [errorCode, setErrorCode] = useState<ApiErrorCode | null>(null);
  const [reloadCounter, setReloadCounter] = useState<number>(0);

  useEffect(() => {
    const controller = new AbortController();
    setRequestState(REQUEST_STATES.LOADING);
    setErrorCode(null);

    const loadDirectory = async (): Promise<void> => {
      try {
        const result = await fetchGoalkeepersList(controller.signal);
        if (controller.signal.aborted) {
          return;
        }
        if (result.ok) {
          setGoalkeepers(result.data);
          setRequestState(REQUEST_STATES.SUCCESS);
        } else {
          setErrorCode(result.error);
          setRequestState(REQUEST_STATES.ERROR);
        }
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
      }
    };

    void loadDirectory();

    return () => {
      controller.abort();
    };
  }, [reloadCounter]);

  const prependGoalkeeper = useCallback((profile: GoalkeeperProfile): void => {
    setGoalkeepers((previous) => [profile, ...previous]);
  }, []);

  const reload = useCallback((): void => {
    setReloadCounter((count) => count + 1);
  }, []);

  return {
    goalkeepers,
    requestState,
    errorCode,
    prependGoalkeeper,
    reload,
  };
}
