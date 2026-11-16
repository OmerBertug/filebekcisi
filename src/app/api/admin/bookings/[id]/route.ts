// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  ADMIN_SESSION_COOKIE_NAME,
  API_ERROR_CODES,
  type GoalkeeperApiResponse,
} from '@/domain/goalkeeper';
import { deleteBookingById } from '@/server/repositories/bookingRepository';
import { verifyAdminSessionToken } from '@/server/security/adminAuth';

interface RouteContext {
  readonly params: Promise<{ readonly id: string }>;
}

/**
 * Handles `DELETE /api/admin/bookings/[id]` requests to remove a match booking record.
 * Requires a valid administrator session cookie.
 *
 * @param _request - Incoming HTTP `Request`.
 * @param context - Next.js dynamic route parameter context resolving `id`.
 * @returns `NextResponse` containing `{ id: string }` on success or structured error.
 */
export async function DELETE(
  _request: Request,
  context: RouteContext,
): Promise<NextResponse<GoalkeeperApiResponse<{ readonly id: string }>>> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  if (!verifyAdminSessionToken(token)) {
    return NextResponse.json(
      { ok: false, errorCode: API_ERROR_CODES.UNAUTHORIZED },
      { status: 401 },
    );
  }

  const { id } = await context.params;
  const result = await deleteBookingById(id);

  if (!result.ok) {
    const status = result.error === API_ERROR_CODES.NOT_FOUND ? 404 : 500;
    return NextResponse.json({ ok: false, errorCode: result.error }, { status });
  }

  return NextResponse.json({ ok: true, data: { id: result.data } }, { status: 200 });
}
