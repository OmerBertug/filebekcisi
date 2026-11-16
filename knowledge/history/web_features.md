# Web Platform Feature History — FileBekcisi

## Directory & Matchmaking Features

| Date       | Feature ID | Module                                                  | Description                                                                                                          | Status    |
| :--------- | :--------- | :------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------- | :-------- |
| 2026-11-07 | `FEAT-001` | `src/components/home/`                                  | Landing hero banner, live goalkeeper counter, and three-step intermediary brokerage explainer.                       | Completed |
| 2026-11-07 | `FEAT-002` | `src/components/directory/`                             | Multi-criteria goalkeeper directory filtering by district, experience tier, available weekday, and maximum fee.      | Completed |
| 2026-11-07 | `FEAT-003` | `src/components/directory/MatchBookingPreviewModal.tsx` | Accessible match invitation modal displaying itemized goalkeeper payout and 15% intermediary commission calculation. | Completed |

## Goalkeeper Onboarding & Persistence Features

| Date       | Feature ID | Module                                                                              | Description                                                                                                                                                                        | Status    |
| :--------- | :--------- | :---------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------- |
| 2026-11-07 | `FEAT-004` | `src/components/registration/`                                                      | Goalkeeper self-registration form with client-side Zod validation, live fee preview, and multi-day availability selector.                                                          | Completed |
| 2026-11-07 | `FEAT-005` | `src/app/api/goalkeepers/` & `src/server/repositories/`                             | REST API (`GET` / `POST`) backed by atomic JSON file persistence and runtime schema validation.                                                                                    | Completed |
| 2026-11-07 | `FEAT-006` | `src/i18n/`                                                                         | Centralized localization catalog (`tr` and `en`) decoupling UI copy from TypeScript components and domain schemas.                                                                 | Completed |
| 2026-11-13 | `FEAT-007` | `src/components/` & `src/i18n/locales/*.json`                                       | Corporate architectural 6-column hairline grid design system (`#161540` navy, `#DCDCE2` structural borders, sharp 0px edges, and formal institutional copy).                       | Completed |
| 2026-11-13 | `FEAT-008` | `src/app/layout.tsx`, `src/app/globals.css`, `src/app/fonts/`                       | Self-hosted variable typography pairing (`Plus Jakarta Sans` for headings/display and `Inter` for body/controls) via `next/font/local`.                                            | Completed |
| 2026-11-13 | `FEAT-009` | `src/app/admin/`, `src/app/api/admin/`, `src/server/security/`                      | Restricted `/admin` moderation console with `HttpOnly` HMAC-SHA256 session authentication, constant-time password checks, and verification/delete actions.                         | Completed |
| 2026-11-13 | `FEAT-010` | `next.config.ts`, `src/app/not-found.tsx`, `src/app/error.tsx`, `src/app/robots.ts` | HTTP security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`), API sliding-window rate limiting, 404/error views, and `robots.txt`. | Completed |
| 2026-11-13 | `FEAT-008` | `src/app/layout.tsx`, `src/app/globals.css`, `src/app/fonts/`                       | Self-hosted variable typography pairing (`Plus Jakarta Sans` for headings/display and `Inter` for body/controls) via `next/font/local`.                                            | Completed |
