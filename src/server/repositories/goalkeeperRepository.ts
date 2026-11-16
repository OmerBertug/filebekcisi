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

/**
 * Resolves the target JSON storage file path.
 *
 * Honors `customFilePath` first (used by isolated integration tests), then falls back to
 * `process.env.GOALKEEPERS_DATA_PATH`, and finally defaults to `<cwd>/data/goalkeepers.json`.
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
 * Reads and schema-validates persisted goalkeeper profiles from disk.
 *
 * Returns an empty array if the storage file does not yet exist (`ENOENT`), enabling clean
 * first-boot initialization without throwing unhandled I/O exceptions.
 *
 * @param customFilePath - Optional file path override for test isolation.
 * @returns `Result` wrapping the validated `GoalkeeperProfile[]` list or `STORAGE_READ_FAILED`.
 */
export async function listGoalkeepers(
  customFilePath?: string,
): Promise<Result<GoalkeeperProfile[], ApiErrorCode>> {
  const filePath = resolveGoalkeepersDataPath(customFilePath);

  try {
    const rawContent = await readFile(filePath, 'utf-8');
    const parsedJson: unknown = JSON.parse(rawContent);
    const validated = goalkeeperListSchema.safeParse(parsedJson);

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
 * Atomically writes the full goalkeeper profile collection to JSON storage.
 *
 * Writes to a sibling temporary file before renaming over the target file so concurrent readers
 * never observe truncated JSON payloads.
 *
 * @param profiles - Complete ordered array of `GoalkeeperProfile` entities to persist.
 * @param filePath - Absolute destination path for the JSON dataset.
 * @returns `Result` indicating success (`undefined`) or `STORAGE_WRITE_FAILED`.
 */
async function writeGoalkeepersAtomically(
  profiles: readonly GoalkeeperProfile[],
  filePath: string,
): Promise<Result<void, ApiErrorCode>> {
  try {
    const directory = path.dirname(filePath);
    await mkdir(directory, { recursive: true });

    const tempPath = `${filePath}.${randomUUID()}.tmp`;
    const serialized = `${JSON.stringify(profiles, null, 2)}\n`;
    await writeFile(tempPath, serialized, 'utf-8');
    await rename(tempPath, filePath);

    return { ok: true, data: undefined };
  } catch {
    return { ok: false, error: API_ERROR_CODES.STORAGE_WRITE_FAILED };
  }
}

/**
 * Creates a new persisted `GoalkeeperProfile` from validated registration input and prepends it
 * to the directory dataset so newly registered goalkeepers appear first.
 *
 * @param input - Sanitized goalkeeper self-registration attributes.
 * @param customFilePath - Optional file path override for isolated test suites.
 * @returns `Result` containing the newly persisted `GoalkeeperProfile` or an `ApiErrorCode`.
 */
export async function registerGoalkeeper(
  input: CreateGoalkeeperInput,
  customFilePath?: string,
): Promise<Result<GoalkeeperProfile, ApiErrorCode>> {
  const filePath = resolveGoalkeepersDataPath(customFilePath);
  const existingResult = await listGoalkeepers(filePath);

  if (!existingResult.ok) {
    return existingResult;
  }

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

  const updatedProfiles: GoalkeeperProfile[] = [newProfile, ...existingResult.data];
  const writeResult = await writeGoalkeepersAtomically(updatedProfiles, filePath);

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
  const filePath = resolveGoalkeepersDataPath(customFilePath);
  const existingResult = await listGoalkeepers(filePath);

  if (!existingResult.ok) {
    return existingResult;
  }

  const targetIndex = existingResult.data.findIndex((item) => item.id === id);
  const existingProfile = existingResult.data[targetIndex];
  if (targetIndex === -1 || existingProfile === undefined) {
    return { ok: false, error: API_ERROR_CODES.NOT_FOUND };
  }

  const updatedProfile: GoalkeeperProfile = {
    ...existingProfile,
    isVerified,
  };
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
 * Deletes a persisted goalkeeper profile identified by `id` from JSON storage.
 *
 * @param id - Target goalkeeper profile identifier to remove.
 * @param customFilePath - Optional file path override for isolated test suites.
 * @returns `Result` containing the deleted profile `id` or `NOT_FOUND` / storage error.
 */
export async function deleteGoalkeeperById(
  id: string,
  customFilePath?: string,
): Promise<Result<string, ApiErrorCode>> {
  const filePath = resolveGoalkeepersDataPath(customFilePath);
  const existingResult = await listGoalkeepers(filePath);

  if (!existingResult.ok) {
    return existingResult;
  }

  const remaining = existingResult.data.filter((item) => item.id !== id);
  if (remaining.length === existingResult.data.length) {
    return { ok: false, error: API_ERROR_CODES.NOT_FOUND };
  }

  const writeResult = await writeGoalkeepersAtomically(remaining, filePath);
  if (!writeResult.ok) {
    return writeResult;
  }

  return { ok: true, data: id };
}
