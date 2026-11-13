// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

import { NextResponse } from 'next/server';
import {
  API_ERROR_CODES,
  validateCreateGoalkeeperInput,
  type GoalkeeperApiResponse,
  type GoalkeeperProfile,
} from '@/domain/goalkeeper';
import { listGoalkeepers, registerGoalkeeper } from '@/server/repositories/goalkeeperRepository';

/**
 * Handles `GET /api/goalkeepers` requests to retrieve all registered goalkeeper profiles.
 *
 * Reads persisted profiles via `listGoalkeepers` and returns a strongly typed
 * `GoalkeeperApiResponse<GoalkeeperProfile[]>` JSON payload with HTTP 200 on success or
 * HTTP 500 if storage reading fails.
 *
 * @returns `NextResponse` containing the discriminated union API envelope.
 */
export async function GET(): Promise<NextResponse<GoalkeeperApiResponse<GoalkeeperProfile[]>>> {
  const result = await listGoalkeepers();

  if (!result.ok) {
    return NextResponse.json({ ok: false, errorCode: result.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data: result.data }, { status: 200 });
}

/**
 * Handles `POST /api/goalkeepers` requests for goalkeeper self-registration.
 *
 * Safely parses the incoming JSON body, validates fields against `createGoalkeeperSchema`,
 * persists the new goalkeeper profile, and returns HTTP 201 with the created entity.
 * Malformed JSON or invalid field values return HTTP 400 with structured error codes.
 *
 * @param request - Incoming HTTP `Request` containing goalkeeper registration JSON.
 * @returns `NextResponse` containing either the created `GoalkeeperProfile` or validation errors.
 */
export async function POST(
  request: Request,
): Promise<NextResponse<GoalkeeperApiResponse<GoalkeeperProfile>>> {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, errorCode: API_ERROR_CODES.INVALID_JSON },
      { status: 400 },
    );
  }

  const validation = validateCreateGoalkeeperInput(rawBody);
  if (!validation.ok) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: API_ERROR_CODES.VALIDATION_FAILED,
        fieldErrors: validation.error,
      },
      { status: 400 },
    );
  }

  const savedResult = await registerGoalkeeper(validation.data);
  if (!savedResult.ok) {
    return NextResponse.json({ ok: false, errorCode: savedResult.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data: savedResult.data }, { status: 201 });
}
