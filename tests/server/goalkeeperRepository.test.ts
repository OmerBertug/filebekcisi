// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { API_ERROR_CODES } from '@/domain/goalkeeper';
import { listGoalkeepers, registerGoalkeeper } from '@/server/repositories/goalkeeperRepository';

describe('goalkeeperRepository', () => {
  let tempDir = '';
  let tempFile = '';

  beforeEach(async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), 'filebekcisi-test-'));
    tempFile = path.join(tempDir, 'goalkeepers.json');
  });

  afterEach(async () => {
    if (tempDir.length > 0) {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('returns an empty list when the JSON storage file does not yet exist', async () => {
    const result = await listGoalkeepers(tempFile);
    expect(result).toEqual({ ok: true, data: [] });
  });

  it('persists newly registered goalkeepers and prepends them in chronological order', async () => {
    const first = await registerGoalkeeper(
      {
        fullName: 'Mert Demir',
        district: 'istanbul_besiktas',
        age: 24,
        heightCm: 186,
        experienceLevel: 'academy',
        dominantHand: 'right',
        matchFeeTry: 450,
        phone: '+90 532 100 20 30',
        availableDays: ['wednesday', 'friday'],
        bio: 'Trained youth academy goalkeeper available for evening matches.',
      },
      tempFile,
    );

    expect(first.ok).toBe(true);

    const second = await registerGoalkeeper(
      {
        fullName: 'Caner Yilmaz',
        district: 'izmir_karsiyaka',
        age: 28,
        heightCm: 189,
        experienceLevel: 'semi_pro',
        dominantHand: 'left',
        matchFeeTry: 500,
        phone: '+90 532 999 88 77',
        availableDays: ['saturday'],
        bio: 'Strong aerial command and quick throw distribution on synthetic turf.',
      },
      tempFile,
    );

    expect(second.ok).toBe(true);

    const listed = await listGoalkeepers(tempFile);
    expect(listed.ok).toBe(true);
    if (listed.ok) {
      expect(listed.data).toHaveLength(2);
      expect(listed.data[0]?.fullName).toBe('Caner Yilmaz');
      expect(listed.data[1]?.fullName).toBe('Mert Demir');
    }
  });

  it('returns STORAGE_READ_FAILED when JSON file contains malformed content', async () => {
    await writeFile(tempFile, '{corrupted-json', 'utf-8');
    const result = await listGoalkeepers(tempFile);
    expect(result).toEqual({ ok: false, error: API_ERROR_CODES.STORAGE_READ_FAILED });
  });
});
