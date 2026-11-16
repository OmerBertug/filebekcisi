// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

import { SECURITY_LIMITS } from '@/domain/goalkeeper';

interface RateLimitBucket {
  readonly timestamps: number[];
}

const clientBuckets = new Map<string, RateLimitBucket>();

/**
 * Extracts a normalized client identifier from incoming HTTP request proxy headers.
 *
 * @param request - Incoming HTTP `Request` instance.
 * @returns Client IP address string or `'local'` fallback.
 */
export function extractClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded !== null && forwarded.trim().length > 0) {
    const firstIp = forwarded.split(',')[0];
    if (firstIp !== undefined && firstIp.trim().length > 0) {
      return firstIp.trim();
    }
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp !== null && realIp.trim().length > 0) {
    return realIp.trim();
  }
  return 'local';
}

/**
 * Enforces an in-memory sliding-window rate limit per client key to mitigate automated spam
 * and brute-force authentication attempts.
 *
 * @param clientKey - Identifier combining route scope and client IP address.
 * @param nowMs - Optional current timestamp in milliseconds (used by unit tests).
 * @returns `true` if the request is permitted; `false` if the rate limit is exceeded.
 */
export function checkRateLimit(clientKey: string, nowMs: number = Date.now()): boolean {
  const windowStart = nowMs - SECURITY_LIMITS.RATE_LIMIT_WINDOW_MS;
  const existing = clientBuckets.get(clientKey);
  const activeTimestamps =
    existing !== undefined ? existing.timestamps.filter((ts) => ts > windowStart) : [];

  if (activeTimestamps.length >= SECURITY_LIMITS.MAX_REQUESTS_PER_WINDOW) {
    clientBuckets.set(clientKey, { timestamps: activeTimestamps });
    return false;
  }

  activeTimestamps.push(nowMs);
  clientBuckets.set(clientKey, { timestamps: activeTimestamps });
  return true;
}

/**
 * Checks whether the declared `Content-Length` header of an incoming request stays within
 * `SECURITY_LIMITS.MAX_PAYLOAD_BYTES`.
 *
 * @param request - Incoming HTTP `Request` instance.
 * @returns `true` if `Content-Length` is absent or less than or equal to the byte limit.
 */
export function isPayloadWithinLimit(request: Request): boolean {
  const contentLengthHeader = request.headers.get('content-length');
  if (contentLengthHeader === null) {
    return true;
  }
  const parsedBytes = Number(contentLengthHeader);
  if (!Number.isFinite(parsedBytes)) {
    return false;
  }
  return parsedBytes <= SECURITY_LIMITS.MAX_PAYLOAD_BYTES;
}

/**
 * Clears all in-memory rate-limit buckets. Intended strictly for deterministic unit testing.
 */
export function resetRateLimiterForTests(): void {
  clientBuckets.clear();
}
