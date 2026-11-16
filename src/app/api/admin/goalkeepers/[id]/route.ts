// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  ADMIN_SESSION_COOKIE_NAME,
  API_ERROR_CODES,
  adminUpdateVerificationSchema,
  type GoalkeeperApiResponse,
  type GoalkeeperProfile,
} from '@/domain/goalkeeper';
import {
  deleteGoalkeeperById,
  updateGoalkeeperVerification,
} from '@/server/repositories/goalkeeperRepository';
import { verifyAdminSessionToken } from '@/server/security/adminAuth';

interface RouteContext {
  readonly params: Promise<{ readonly id: string }>;
}

/**
 * Checks whether the current request carries a valid administrator session cookie.
 *
 * @returns `true` if authorized; `false` otherwise.
 */
async function isRequestAuthorized(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  return verifyAdminSessionToken(token);
}

/**
 * Handles `PATCH /api/admin/goalkeepers/[id]` requests to toggle the `isVerified` status
 * of a goalkeeper record. Requires a valid administrator session cookie.
 *
 * @param request - Incoming HTTP `Request` containing `{ isVerified: boolean }`.
 * @param context - Next.js dynamic route parameter context resolving `id`.
 * @returns `NextResponse` containing the updated `GoalkeeperProfile` or structured error.
 */
export async function PATCH(
  request: Request,
  context: RouteContext,
): Promise<NextResponse<GoalkeeperApiResponse<GoalkeeperProfile>>> {
  if (!(await isRequestAuthorized())) {
    return NextResponse.json(
      { ok: false, errorCode: API_ERROR_CODES.UNAUTHORIZED },
      { status: 401 },
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, errorCode: API_ERROR_CODES.INVALID_JSON },
      { status: 400 },
    );
  }

  const parsed = adminUpdateVerificationSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errorCode: API_ERROR_CODES.VALIDATION_FAILED },
      { status: 400 },
    );
  }

  const { id } = await context.params;
  const result = await updateGoalkeeperVerification(id, parsed.data.isVerified);

  if (!result.ok) {
    const status = result.error === API_ERROR_CODES.NOT_FOUND ? 404 : 500;
    return NextResponse.json({ ok: false, errorCode: result.error }, { status });
  }

  return NextResponse.json({ ok: true, data: result.data }, { status: 200 });
}

/**
 * Handles `DELETE /api/admin/goalkeepers/[id]` requests to permanently remove a goalkeeper
 * profile from the registry. Requires a valid administrator session cookie.
 *
 * @param _request - Incoming HTTP `Request`.
 * @param context - Next.js dynamic route parameter context resolving `id`.
 * @returns `NextResponse` containing `{ id: string }` on success or structured error.
 */
export async function DELETE(
  _request: Request,
  context: RouteContext,
): Promise<NextResponse<GoalkeeperApiResponse<{ readonly id: string }>>> {
  if (!(await isRequestAuthorized())) {
    return NextResponse.json(
      { ok: false, errorCode: API_ERROR_CODES.UNAUTHORIZED },
      { status: 401 },
    );
  }

  const { id } = await context.params;
  const result = await deleteGoalkeeperById(id);

  if (!result.ok) {
    const status = result.error === API_ERROR_CODES.NOT_FOUND ? 404 : 500;
    return NextResponse.json({ ok: false, errorCode: result.error }, { status });
  }

  return NextResponse.json({ ok: true, data: { id: result.data } }, { status: 200 });
}
