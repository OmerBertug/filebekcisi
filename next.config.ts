// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

import type { NextConfig } from 'next';

/**
 * Next.js application configuration for the FileBekcisi platform.
 *
 * Enables React strict mode to surface lifecycle and side-effect defects during development,
 * disables the X-Powered-By response header for baseline HTTP hardening, and enforces typed
 * build verification.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
