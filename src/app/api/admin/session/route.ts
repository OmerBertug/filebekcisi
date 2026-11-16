// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  ADMIN_SESSION_COOKIE_NAME,
  API_ERROR_CODES,
  SECURITY_LIMITS,
  adminLoginSchema,
  type AdminSessionStatus,
  type GoalkeeperApiResponse,
} from '@/domain/goalkeeper';
import {
  createAdminSessionToken,
  verifyAdminPassword,
  verifyAdminSessionToken,
} from '@/server/security/adminAuth';
import {
  checkRateLimit,
  extractClientIp,
  isPayloadWithinLimit,
} from '@/server/security/rateLimiter';

/**
 * Handles `GET /api/admin/session` requests to verify whether the current client possesses
 * a valid, unexpired HMAC-signed administrator session cookie.
 *
 * @returns `NextResponse` containing `{ ok: true, data: { authenticated: boolean } }`.
 */
export async function GET(): Promise<NextResponse<GoalkeeperApiResponse<AdminSessionStatus>>> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  const authenticated = verifyAdminSessionToken(sessionCookie);

  return NextResponse.json({ ok: true, data: { authenticated } }, { status: 200 });
}

/**
 * Handles `POST /api/admin/session` requests to authenticate an administrator password
 * and issue an `HttpOnly`, `SameSite=Strict` signed session cookie.
 *
 * @param request - Incoming HTTP `Request` containing `{ password: string }`.
 * @returns `NextResponse` with `authenticated: true` on success or `401`/`429` on failure.
 */
export async function POST(
  request: Request,
): Promise<NextResponse<GoalkeeperApiResponse<AdminSessionStatus>>> {
  if (!isPayloadWithinLimit(request)) {
    return NextResponse.json(
      { ok: false, errorCode: API_ERROR_CODES.PAYLOAD_TOO_LARGE },
      { status: 413 },
    );
  }

  const clientKey = `admin-login:${extractClientIp(request)}`;
  if (!checkRateLimit(clientKey)) {
    return NextResponse.json(
      { ok: false, errorCode: API_ERROR_CODES.RATE_LIMITED },
      { status: 429 },
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

  const parsed = adminLoginSchema.safeParse(rawBody);
  if (!parsed.success || !verifyAdminPassword(parsed.data.password)) {
    return NextResponse.json(
      { ok: false, errorCode: API_ERROR_CODES.UNAUTHORIZED },
      { status: 401 },
    );
  }

  const token = createAdminSessionToken();
  const response = NextResponse.json<GoalkeeperApiResponse<AdminSessionStatus>>(
    { ok: true, data: { authenticated: true } },
    { status: 200 },
  );

  response.cookies.set({
    name: ADMIN_SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SECURITY_LIMITS.SESSION_TTL_SECONDS,
  });

  return response;
}

/**
 * Handles `DELETE /api/admin/session` requests to clear the administrator session cookie.
 *
 * @returns `NextResponse` confirming session termination.
 */
export async function DELETE(): Promise<NextResponse<GoalkeeperApiResponse<AdminSessionStatus>>> {
  const response = NextResponse.json<GoalkeeperApiResponse<AdminSessionStatus>>(
    { ok: true, data: { authenticated: false } },
    { status: 200 },
  );

  response.cookies.set({
    name: ADMIN_SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });

  return response;
}
