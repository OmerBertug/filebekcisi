// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { z } from 'zod';
import {
  bookingRecordSchema,
  goalkeeperListSchema,
  goalkeeperProfileSchema,
  type BookingRecord,
  type GoalkeeperProfile,
} from '@/domain/goalkeeper';

const rawRowSchema = z.object({
  payload: z.unknown(),
});

const countRowSchema = z.object({
  total: z.union([z.number(), z.string()]),
});

let cachedSqlClient: NeonQueryFunction<false, false> | null = null;
let cachedConnectionString: string | null = null;
let schemaInitialized = false;

/**
 * Resolves the active PostgreSQL connection string from standard or custom-prefixed Neon/Vercel
 * environment variables (`DATABASE_URL`, `POSTGRES_URL`, `NEON_DATABASE_URL`, or any env var
 * starting with `postgres://` or `postgresql://`).
 *
 * @returns Trimmed PostgreSQL connection URL or `null` when no database is configured.
 */
export function resolveDatabaseUrl(): string | null {
  const priorityCandidates = [
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL,
    process.env.NEON_DATABASE_URL,
    process.env.DATABASE_URL_UNPOOLED,
    process.env.POSTGRES_URL_NON_POOLING,
  ];

  for (const candidate of priorityCandidates) {
    if (candidate !== undefined && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }

  for (const [, value] of Object.entries(process.env)) {
    if (
      value !== undefined &&
      (value.startsWith('postgres://') || value.startsWith('postgresql://'))
    ) {
      return value.trim();
    }
  }

  return null;
}

/**
 * Lazily initializes and returns the Neon serverless SQL tagged-template executor.
 *
 * @returns Configured `NeonQueryFunction` or `null` when running in local/tmp JSON fallback mode.
 */
export function getSqlClient(): NeonQueryFunction<false, false> | null {
  const connectionString = resolveDatabaseUrl();
  if (connectionString === null) {
    return null;
  }
  if (cachedSqlClient === null || cachedConnectionString !== connectionString) {
    cachedSqlClient = neon(connectionString);
    cachedConnectionString = connectionString;
    schemaInitialized = false;
  }
  return cachedSqlClient;
}

/**
 * Seeds the `goalkeepers` PostgreSQL table from `data/goalkeepers.json` when the table is empty.
 */
async function seedInitialGoalkeepersIfNeeded(sql: NeonQueryFunction<false, false>): Promise<void> {
  const countRows = await sql`SELECT COUNT(*)::int AS total FROM goalkeepers`;
  const firstRow = countRows[0];
  const parsedCount = countRowSchema.safeParse(firstRow);
  const existingTotal = parsedCount.success ? Number(parsedCount.data.total) : 0;

  if (existingTotal > 0) {
    return;
  }

  try {
    const seedPath = path.join(process.cwd(), 'data', 'goalkeepers.json');
    const rawSeed = await readFile(seedPath, 'utf-8');
    const parsedSeed = goalkeeperListSchema.safeParse(JSON.parse(rawSeed));
    if (!parsedSeed.success) {
      return;
    }

    for (const profile of parsedSeed.data) {
      await sql`
        INSERT INTO goalkeepers (id, payload, created_at)
        VALUES (${profile.id}, ${JSON.stringify(profile)}::jsonb, ${profile.createdAt}::timestamptz)
        ON CONFLICT (id) DO NOTHING
      `;
    }
  } catch {
    // Seed file is optional in cloud environments.
  }
}

/**
 * Ensures the `goalkeepers` and `bookings` PostgreSQL tables exist and seeds initial profiles
 * on first connection.
 *
 * @param sql - Active Neon SQL query function.
 */
export async function ensurePostgresSchema(sql: NeonQueryFunction<false, false>): Promise<void> {
  if (schemaInitialized) {
    return;
  }

  await sql`
    CREATE TABLE IF NOT EXISTS goalkeepers (
      id TEXT PRIMARY KEY,
      payload JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      payload JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await seedInitialGoalkeepersIfNeeded(sql);
  schemaInitialized = true;
}

/**
 * Unwraps a raw SQL row's `payload` column whether the driver returns a parsed object or JSON text.
 */
function unwrapRowPayload(row: unknown): unknown {
  const parsedRow = rawRowSchema.safeParse(row);
  if (!parsedRow.success) {
    return null;
  }
  const rawPayload = parsedRow.data.payload;
  if (typeof rawPayload === 'string') {
    try {
      return JSON.parse(rawPayload);
    } catch {
      return null;
    }
  }
  return rawPayload;
}

/**
 * Validates raw SQL rows returned from the `goalkeepers` table using `goalkeeperProfileSchema`.
 *
 * @param rows - Untrusted row objects returned by the Neon driver.
 * @returns Array of validated `GoalkeeperProfile` entities.
 */
export function parseGoalkeeperRows(rows: readonly unknown[]): GoalkeeperProfile[] {
  const validated: GoalkeeperProfile[] = [];
  for (const row of rows) {
    const candidate = unwrapRowPayload(row);
    const parsed = goalkeeperProfileSchema.safeParse(candidate);
    if (parsed.success) {
      validated.push(parsed.data);
    }
  }
  return validated;
}

/**
 * Validates raw SQL rows returned from the `bookings` table using `bookingRecordSchema`.
 *
 * @param rows - Untrusted row objects returned by the Neon driver.
 * @returns Array of validated `BookingRecord` entities.
 */
export function parseBookingRows(rows: readonly unknown[]): BookingRecord[] {
  const validated: BookingRecord[] = [];
  for (const row of rows) {
    const candidate = unwrapRowPayload(row);
    const parsed = bookingRecordSchema.safeParse(candidate);
    if (parsed.success) {
      validated.push(parsed.data);
    }
  }
  return validated;
}
