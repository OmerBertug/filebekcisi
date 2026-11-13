// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

import { MarketplaceWorkspace } from '@/components/home/MarketplaceWorkspace';

/**
 * Thin root entry page delegating UI rendering and state orchestration to `MarketplaceWorkspace`.
 *
 * Adheres to Single Responsibility Principle by keeping the route file free of business logic.
 *
 * @returns Rendered `MarketplaceWorkspace` element.
 */
export default function HomePage(): React.JSX.Element {
  return <MarketplaceWorkspace />;
}
