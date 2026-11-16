// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

import type { MetadataRoute } from 'next';

/**
 * Generates `/robots.txt` rules allowing public indexing of the main directory while blocking
 * search engine crawlers from `/admin` and `/api` routes.
 *
 * @returns Next.js `MetadataRoute.Robots` descriptor.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/'],
    },
  };
}
