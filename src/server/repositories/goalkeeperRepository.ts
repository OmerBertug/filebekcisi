// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  API_ERROR_CODES,
  GOALKEEPER_CONSTRAINTS,
  goalkeeperListSchema,
  type ApiErrorCode,
  type CreateGoalkeeperInput,
  type GoalkeeperProfile,
  type Result,
} from '@/domain/goalkeeper';
import {
  ensurePostgresSchema,
  getSqlClient,
  parseGoalkeeperRows,
} from '@/server/db/postgresClient';

/**
 * Resolves the target JSON storage file path when operating in local JSON fallback mode.
 *
 * @param customFilePath - Optional explicit file path override for sandboxed test execution.
 * @returns Absolute filesystem path to the JSON goalkeeper store.
 */
export function resolveGoalkeepersDataPath(customFilePath?: string): string {
  if (customFilePath !== undefined && customFilePath.length > 0) {
    return path.resolve(customFilePath);
  }
  const envPath = process.env.GOALKEEPERS_DATA_PATH;
  if (envPath !== undefined && envPath.length > 0) {
    return path.resolve(envPath);
  }
  return path.join(process.cwd(), 'data', 'goalkeepers.json');
}

/**
 * Atomically writes the full goalkeeper profile collection to local JSON storage.
 */
async function writeGoalkeepersAtomically(
  profiles: readonly GoalkeeperProfile[],
  filePath: string,
): Promise<Result<void, ApiErrorCode>> {
  try {
    await mkdir(path.dirname(filePath), { recursive: true });
    const tempPath = `${filePath}.${randomUUID()}.tmp`;
    await writeFile(tempPath, `${JSON.stringify(profiles, null, 2)}\n`, 'utf-8');
    await rename(tempPath, filePath);
    return { ok: true, data: undefined };
  } catch {
    return { ok: false, error: API_ERROR_CODES.STORAGE_WRITE_FAILED };
  }
}

/**
 * Reads and schema-validates persisted goalkeeper profiles from PostgreSQL (when `DATABASE_URL`
 * is configured and no test override path is given) or local JSON storage.
 *
 * @param customFilePath - Optional file path override for test isolation.
 * @returns `Result` wrapping the validated `GoalkeeperProfile[]` list or `STORAGE_READ_FAILED`.
 */
export async function listGoalkeepers(
  customFilePath?: string,
): Promise<Result<GoalkeeperProfile[], ApiErrorCode>> {
  const sql = customFilePath === undefined ? getSqlClient() : null;
  if (sql !== null) {
    try {
      await ensurePostgresSchema(sql);
      const rows = await sql`SELECT payload FROM goalkeepers ORDER BY created_at DESC`;
      return { ok: true, data: parseGoalkeeperRows(rows) };
    } catch {
      return { ok: false, error: API_ERROR_CODES.STORAGE_READ_FAILED };
    }
  }

  const filePath = resolveGoalkeepersDataPath(customFilePath);
  try {
    const rawContent = await readFile(filePath, 'utf-8');
    const validated = goalkeeperListSchema.safeParse(JSON.parse(rawContent));
    if (!validated.success) {
      return { ok: false, error: API_ERROR_CODES.STORAGE_READ_FAILED };
    }
    return { ok: true, data: validated.data };
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return { ok: true, data: [] };
    }
    return { ok: false, error: API_ERROR_CODES.STORAGE_READ_FAILED };
  }
}

/**
 * Creates a new persisted `GoalkeeperProfile` in PostgreSQL or local JSON storage.
 *
 * @param input - Sanitized goalkeeper self-registration attributes.
 * @param customFilePath - Optional file path override for isolated test suites.
 * @returns `Result` containing the newly persisted `GoalkeeperProfile` or an `ApiErrorCode`.
 */
export async function registerGoalkeeper(
  input: CreateGoalkeeperInput,
  customFilePath?: string,
): Promise<Result<GoalkeeperProfile, ApiErrorCode>> {
  const newProfile: GoalkeeperProfile = {
    id: `gk-${randomUUID()}`,
    fullName: input.fullName,
    district: input.district,
    age: input.age,
    heightCm: input.heightCm,
    experienceLevel: input.experienceLevel,
    dominantHand: input.dominantHand,
    matchFeeTry: input.matchFeeTry,
    phone: input.phone,
    availableDays: [...input.availableDays],
    bio: input.bio,
    rating: GOALKEEPER_CONSTRAINTS.DEFAULT_NEW_RATING,
    completedMatches: 0,
    isVerified: false,
    createdAt: new Date().toISOString(),
  };

  const sql = customFilePath === undefined ? getSqlClient() : null;
  if (sql !== null) {
    try {
      await ensurePostgresSchema(sql);
      await sql`
        INSERT INTO goalkeepers (id, payload, created_at)
        VALUES (${newProfile.id}, ${JSON.stringify(newProfile)}::jsonb, ${newProfile.createdAt}::timestamptz)
      `;
      return { ok: true, data: newProfile };
    } catch {
      return { ok: false, error: API_ERROR_CODES.STORAGE_WRITE_FAILED };
    }
  }

  const filePath = resolveGoalkeepersDataPath(customFilePath);
  const existingResult = await listGoalkeepers(filePath);
  if (!existingResult.ok) {
    return existingResult;
  }

  const writeResult = await writeGoalkeepersAtomically(
    [newProfile, ...existingResult.data],
    filePath,
  );
  if (!writeResult.ok) {
    return writeResult;
  }
  return { ok: true, data: newProfile };
}

/**
 * Updates the `isVerified` status of a persisted goalkeeper profile identified by `id`.
 *
 * @param id - Target goalkeeper profile identifier.
 * @param isVerified - New verification flag set by an administrator.
 * @param customFilePath - Optional file path override for isolated test suites.
 * @returns `Result` containing the updated `GoalkeeperProfile` or `NOT_FOUND` / storage error.
 */
export async function updateGoalkeeperVerification(
  id: string,
  isVerified: boolean,
  customFilePath?: string,
): Promise<Result<GoalkeeperProfile, ApiErrorCode>> {
  const existingResult = await listGoalkeepers(customFilePath);
  if (!existingResult.ok) {
    return existingResult;
  }

  const targetIndex = existingResult.data.findIndex((item) => item.id === id);
  const existingProfile = existingResult.data[targetIndex];
  if (targetIndex === -1 || existingProfile === undefined) {
    return { ok: false, error: API_ERROR_CODES.NOT_FOUND };
  }

  const updatedProfile: GoalkeeperProfile = { ...existingProfile, isVerified };
  const sql = customFilePath === undefined ? getSqlClient() : null;

  if (sql !== null) {
    try {
      await sql`
        UPDATE goalkeepers
        SET payload = ${JSON.stringify(updatedProfile)}::jsonb
        WHERE id = ${id}
      `;
      return { ok: true, data: updatedProfile };
    } catch {
      return { ok: false, error: API_ERROR_CODES.STORAGE_WRITE_FAILED };
    }
  }

  const filePath = resolveGoalkeepersDataPath(customFilePath);
  const updatedList = existingResult.data.map((item, idx) =>
    idx === targetIndex ? updatedProfile : item,
  );
  const writeResult = await writeGoalkeepersAtomically(updatedList, filePath);
  if (!writeResult.ok) {
    return writeResult;
  }
  return { ok: true, data: updatedProfile };
}

/**
 * Deletes a persisted goalkeeper profile identified by `id` from PostgreSQL or JSON storage.
 *
 * @param id - Target goalkeeper profile identifier to remove.
 * @param customFilePath - Optional file path override for isolated test suites.
 * @returns `Result` containing the deleted profile `id` or `NOT_FOUND` / storage error.
 */
export async function deleteGoalkeeperById(
  id: string,
  customFilePath?: string,
): Promise<Result<string, ApiErrorCode>> {
  const existingResult = await listGoalkeepers(customFilePath);
  if (!existingResult.ok) {
    return existingResult;
  }

  const remaining = existingResult.data.filter((item) => item.id !== id);
  if (remaining.length === existingResult.data.length) {
    return { ok: false, error: API_ERROR_CODES.NOT_FOUND };
  }

  const sql = customFilePath === undefined ? getSqlClient() : null;
  if (sql !== null) {
    try {
      await sql`DELETE FROM goalkeepers WHERE id = ${id}`;
      return { ok: true, data: id };
    } catch {
      return { ok: false, error: API_ERROR_CODES.STORAGE_WRITE_FAILED };
    }
  }

  const filePath = resolveGoalkeepersDataPath(customFilePath);
  const writeResult = await writeGoalkeepersAtomically(remaining, filePath);
  if (!writeResult.ok) {
    return writeResult;
  }
  return { ok: true, data: id };
}
