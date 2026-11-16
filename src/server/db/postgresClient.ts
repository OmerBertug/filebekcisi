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

const goalkeeperRowSchema = z.object({
  payload: goalkeeperProfileSchema,
});

const bookingRowSchema = z.object({
  payload: bookingRecordSchema,
});

const countRowSchema = z.object({
  total: z.union([z.number(), z.string()]),
});

let cachedSqlClient: NeonQueryFunction<false, false> | null = null;
let schemaInitialized = false;

/**
 * Resolves the active PostgreSQL connection string from `DATABASE_URL` or `POSTGRES_URL`.
 *
 * @returns Trimmed connection URL or `null` when no PostgreSQL database is configured.
 */
export function resolveDatabaseUrl(): string | null {
  const candidates = [process.env.DATABASE_URL, process.env.POSTGRES_URL];
  for (const candidate of candidates) {
    if (candidate !== undefined && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }
  return null;
}

/**
 * Lazily initializes and returns the Neon serverless SQL tagged-template executor.
 *
 * Safe at Next.js build time because `neon()` is only invoked when `DATABASE_URL` or
 * `POSTGRES_URL` is present at runtime.
 *
 * @returns Configured `NeonQueryFunction` or `null` when running in local JSON fallback mode.
 */
export function getSqlClient(): NeonQueryFunction<false, false> | null {
  const connectionString = resolveDatabaseUrl();
  if (connectionString === null) {
    return null;
  }
  if (cachedSqlClient === null) {
    cachedSqlClient = neon(connectionString);
  }
  return cachedSqlClient;
}

/**
 * Seeds the `goalkeepers` PostgreSQL table from `data/goalkeepers.json` when the table is empty.
 *
 * @param sql - Active Neon SQL query function.
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
 * Validates raw SQL rows returned from the `goalkeepers` table using `goalkeeperProfileSchema`.
 *
 * @param rows - Untrusted row objects returned by the Neon driver.
 * @returns Array of validated `GoalkeeperProfile` entities.
 */
export function parseGoalkeeperRows(rows: readonly unknown[]): GoalkeeperProfile[] {
  const validated: GoalkeeperProfile[] = [];
  for (const row of rows) {
    const parsed = goalkeeperRowSchema.safeParse(row);
    if (parsed.success) {
      validated.push(parsed.data.payload);
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
    const parsed = bookingRowSchema.safeParse(row);
    if (parsed.success) {
      validated.push(parsed.data.payload);
    }
  }
  return validated;
}
