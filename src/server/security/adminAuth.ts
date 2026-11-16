// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { SECURITY_LIMITS } from '@/domain/goalkeeper';

const DEFAULT_ADMIN_PASSWORD = 'FileBekcisi2026!';
const DEFAULT_SESSION_SECRET = 'fb-institutional-hmac-secret-2026-default';

/**
 * Resolves the expected administrator password from environment configuration,
 * falling back to `DEFAULT_ADMIN_PASSWORD` in local development when unset.
 *
 * @returns Active administrator password string.
 */
function resolveAdminPassword(): string {
  const configured = process.env.ADMIN_PASSWORD;
  if (configured !== undefined && configured.trim().length > 0) {
    return configured.trim();
  }
  return DEFAULT_ADMIN_PASSWORD;
}

/**
 * Resolves the HMAC-SHA256 signing secret used to authenticate administrator session cookies.
 *
 * @returns Active session signing secret string.
 */
function resolveSessionSecret(): string {
  const configured = process.env.ADMIN_SESSION_SECRET;
  if (configured !== undefined && configured.trim().length > 0) {
    return configured.trim();
  }
  return DEFAULT_SESSION_SECRET;
}

/**
 * Computes an HMAC-SHA256 hex signature for the given expiration timestamp string.
 *
 * @param expiresAtMsString - Expiration UNIX timestamp in milliseconds encoded as a string.
 * @returns Hexadecimal HMAC-SHA256 digest.
 */
function signExpirationPayload(expiresAtMsString: string): string {
  return createHmac('sha256', resolveSessionSecret())
    .update(`admin:${expiresAtMsString}`)
    .digest('hex');
}

/**
 * Verifies a candidate administrator password in constant time using SHA-256 digests and
 * `timingSafeEqual` to prevent timing side-channel attacks.
 *
 * @param candidate - Untrusted password string submitted by the client.
 * @returns `true` if `candidate` matches the configured `ADMIN_PASSWORD`.
 */
export function verifyAdminPassword(candidate: string): boolean {
  const expectedDigest = createHash('sha256').update(resolveAdminPassword()).digest();
  const candidateDigest = createHash('sha256').update(candidate).digest();
  return timingSafeEqual(expectedDigest, candidateDigest);
}

/**
 * Generates an HMAC-SHA256 signed session token encoding its expiration timestamp.
 *
 * @param nowMs - Optional current timestamp in milliseconds (injected in unit tests).
 * @returns Signed token formatted as `<expiresAtMs>.<hmacHex>`.
 */
export function createAdminSessionToken(nowMs: number = Date.now()): string {
  const expiresAtMs = nowMs + SECURITY_LIMITS.SESSION_TTL_SECONDS * 1000;
  const expiresPart = String(expiresAtMs);
  const signature = signExpirationPayload(expiresPart);
  return `${expiresPart}.${signature}`;
}

/**
 * Verifies an HMAC-SHA256 signed administrator session cookie token for structural validity,
 * non-expiration, and constant-time signature authenticity.
 *
 * @param token - Cookie value extracted from incoming HTTP request headers.
 * @param nowMs - Optional current timestamp in milliseconds (injected in unit tests).
 * @returns `true` when the session token is authentic and unexpired.
 */
export function verifyAdminSessionToken(
  token: string | undefined,
  nowMs: number = Date.now(),
): boolean {
  if (token === undefined || token.length === 0) {
    return false;
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return false;
  }

  const [expiresPart, providedSignature] = parts;
  if (expiresPart === undefined || providedSignature === undefined) {
    return false;
  }

  const expiresAtMs = Number(expiresPart);
  if (!Number.isFinite(expiresAtMs) || expiresAtMs <= nowMs) {
    return false;
  }

  const expectedSignature = signExpirationPayload(expiresPart);
  const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');
  const providedBuffer = Buffer.from(providedSignature, 'utf-8');

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, providedBuffer);
}
