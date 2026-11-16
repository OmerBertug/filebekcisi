# Goalkeeper Marketplace & Self-Registration Architecture

## 1. Purpose

`FileBekcisi` connects amateur synthetic-turf football match organizers with independent goalkeepers through an intermediary brokerage workflow. The MVP provides two primary capabilities:

1. **Goalkeeper Self-Registration**: Goalkeepers submit their demographic attributes, experience tier, dominant hand, weekly availability, and base match fee.
2. **Directory Filtering & Commission Transparency**: Match organizers filter registered goalkeepers by district, experience tier, weekday, and budget, and inspect the 15% intermediary service commission prior to initiating a match request.

## 2. Layered Module Boundaries

- **Domain Layer (`src/domain/goalkeeper/`)**:
  - `constants.ts`: Canonical `as const` enumerations (`DISTRICT_CODES`, `EXPERIENCE_LEVELS`, `DOMINANT_HANDS`, `AVAILABLE_DAYS`, `REQUEST_STATES`, `VALIDATION_ERROR_CODES`, `API_ERROR_CODES`) and numeric constraints.
  - `types.ts`: Strict interfaces (`GoalkeeperProfile`, `CreateGoalkeeperInput`, `FeeBreakdown`, `Result<T, E>`).
  - `guards.ts`: Runtime type narrowing predicates (`isDistrictCode`, `isExperienceLevel`, `isDominantHand`, `isAvailableDay`) eliminating type assertions on DOM `<select>` inputs.
  - `schemas.ts`: Zod schemas validating both incoming HTTP payloads and persisted JSON records.
  - `pricing.ts`: Pure deterministic functions `calculateMatchFeeBreakdown` and `filterGoalkeepers`.
- **Localization Layer (`src/i18n/`)**:
  - Stores all Turkish (`locales/tr.json`) and English (`locales/en.json`) user-facing copy behind the typed `AppDictionary` contract so `.ts` and `.tsx` modules remain 100% English and locale-independent.
- **Persistence & API Layer (`src/server/repositories/` & `src/app/api/goalkeepers/route.ts`)**:
  - `goalkeeperRepository.ts` reads and writes `data/goalkeepers.json` using temporary file writes followed by atomic `rename` operations.
  - `GET /api/goalkeepers` returns validated goalkeeper profiles; `POST /api/goalkeepers` validates incoming payloads and returns HTTP 201 with the newly created record.
- **Client State & UI Layer (`src/hooks/` & `src/components/`)**:
  - `useGoalkeepers` manages directory loading with `AbortController` cleanup on unmount.
  - `useGoalkeeperRegistrationForm` coordinates controlled form inputs, client-side Zod validation, and API submission.
  - `MarketplaceWorkspace` computes filtered results via `useMemo` and passes stable callbacks via `useCallback` to memoized `GoalkeeperCard` components.
- **Architectural Design System (`src/app/globals.css`, `src/app/layout.tsx` & `src/components/`)**:
  - Uses a 6-column structural hairline grid (`lg:grid-cols-6`) anchored by `1px` `#DCDCE2` dividers, deep institutional navy (`#161540`), crisp neutral surfaces (`#F8F8FA`, `#E8E8EC`, `#FFFFFF`), and `0px` rectangular controls (`rounded-none`).
  - Typography is powered by self-hosted `Plus Jakarta Sans` (`--font-plus-jakarta`, Latin + Latin-Extended variable `.woff2`) for headings/display titles and `Inter` (`--font-inter`, Latin + Latin-Extended variable `.woff2`) for body copy and form inputs.
- **Security & Private Administration (`src/server/security/`, `src/app/api/admin/`, `src/app/admin/`)**:
  - `adminAuth.ts` verifies `ADMIN_PASSWORD` using constant-time SHA-256 digests (`timingSafeEqual`) and issues HMAC-SHA256 signed `HttpOnly` session cookies (`fb_admin_session`).
  - `rateLimiter.ts` enforces sliding-window IP rate limiting (`15 req / 60s`) and request payload byte ceilings (`16 KB`) across registration and login endpoints.
  - `/admin` is unlinked from public navigation, blocked in `/robots.txt` and `X-Robots-Tag: noindex, nofollow`, and allows authorized administrators to toggle `isVerified` status or delete profiles.
