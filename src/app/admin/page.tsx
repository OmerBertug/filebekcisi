// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

import type { Metadata } from 'next';
import { AdminWorkspace } from '@/components/admin/AdminWorkspace';

/**
 * Route metadata explicitly instructing search engine crawlers never to index `/admin`.
 */
export const metadata: Metadata = {
  title: 'FileBekcisi — Administration',
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Thin entry route for `/admin` delegating authentication and moderation UI to `AdminWorkspace`.
 *
 * @returns Rendered `AdminWorkspace` element.
 */
export default function AdminPage(): React.JSX.Element {
  return <AdminWorkspace />;
}
