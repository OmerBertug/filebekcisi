// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GoalkeeperRegistrationForm } from '@/components/registration/GoalkeeperRegistrationForm';
import type { GoalkeeperProfile } from '@/domain/goalkeeper';
import { getDictionary } from '@/i18n';

const enDictionary = getDictionary('en');

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('GoalkeeperRegistrationForm', () => {
  it('displays field validation alerts and blocks network call when required fields are invalid', async () => {
    const onRegistered = vi.fn();
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    render(
      <GoalkeeperRegistrationForm
        dictionary={enDictionary}
        onGoalkeeperRegistered={onRegistered}
      />,
    );

    const submitBtn = screen.getByRole('button', {
      name: enDictionary.registration.submitButton,
    });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(enDictionary.validation.invalid_name)).toBeInTheDocument();
    expect(screen.getByText(enDictionary.validation.invalid_phone)).toBeInTheDocument();
    expect(screen.getByText(enDictionary.validation.invalid_bio)).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(onRegistered).not.toHaveBeenCalled();
  });

  it('submits valid goalkeeper registration payload and invokes onGoalkeeperRegistered', async () => {
    const createdProfile: GoalkeeperProfile = {
      id: 'gk-created-1',
      fullName: 'Hakan Arslan',
      district: 'istanbul_kadikoy',
      age: 24,
      heightCm: 185,
      experienceLevel: 'amateur',
      dominantHand: 'right',
      matchFeeTry: 400,
      phone: '+90 555 222 33 44',
      availableDays: ['friday', 'saturday'],
      bio: 'Agile goalkeeper experienced in high-tempo turf matches.',
      rating: 5.0,
      completedMatches: 0,
      isVerified: false,
      createdAt: '2026-11-07T10:00:00.000Z',
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true, data: createdProfile }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const onRegistered = vi.fn();

    render(
      <GoalkeeperRegistrationForm
        dictionary={enDictionary}
        onGoalkeeperRegistered={onRegistered}
      />,
    );

    fireEvent.change(screen.getByLabelText(enDictionary.registration.fullNameLabel), {
      target: { value: 'Hakan Arslan' },
    });
    fireEvent.change(screen.getByLabelText(enDictionary.registration.phoneLabel), {
      target: { value: '+90 555 222 33 44' },
    });
    fireEvent.change(screen.getByLabelText(enDictionary.registration.bioLabel), {
      target: { value: 'Agile goalkeeper experienced in high-tempo turf matches.' },
    });

    fireEvent.click(screen.getByRole('button', { name: enDictionary.registration.submitButton }));

    await waitFor(() => {
      expect(onRegistered).toHaveBeenCalledWith(createdProfile);
    });
    expect(screen.getByText(enDictionary.registration.successMessage)).toBeInTheDocument();
  });

  it('renders localized network error banner when fetch rejects', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Connection refused'));
    const onRegistered = vi.fn();

    render(
      <GoalkeeperRegistrationForm
        dictionary={enDictionary}
        onGoalkeeperRegistered={onRegistered}
      />,
    );

    fireEvent.change(screen.getByLabelText(enDictionary.registration.fullNameLabel), {
      target: { value: 'Hakan Arslan' },
    });
    fireEvent.change(screen.getByLabelText(enDictionary.registration.phoneLabel), {
      target: { value: '+90 555 222 33 44' },
    });
    fireEvent.change(screen.getByLabelText(enDictionary.registration.bioLabel), {
      target: { value: 'Agile goalkeeper experienced in high-tempo turf matches.' },
    });

    fireEvent.click(screen.getByRole('button', { name: enDictionary.registration.submitButton }));

    expect(await screen.findByText(enDictionary.apiErrors.network_error)).toBeInTheDocument();
    expect(onRegistered).not.toHaveBeenCalled();
  });
});
