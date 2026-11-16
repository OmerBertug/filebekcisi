# Active Context — FileBekcisi

## Current Focus

Completed corporate architectural redesign, `Plus Jakarta Sans` + `Inter` variable typography, HTTP security hardening, custom 404/error/robots routes, and the restricted `/admin` moderation console (`HttpOnly` HMAC-SHA256 session authentication).

## Active Architecture Decisions

- **Design System**: Standardized on an institutional 6-column hairline grid (`lg:grid-cols-6`), `1px` `#DCDCE2` structural dividers, `#161540` navy accents, `#F8F8FA`/`#FFFFFF` neutral surfaces, `#4C4C4C`/`#636262` body typography, `rounded-none` sharp rectangular controls, and self-hosted `Plus Jakarta Sans` (headings) + `Inter` (body) variable fonts.
- **Security & Admin Moderation**: `/admin` is unlinked from public UI, excluded from crawlers (`robots.ts` + `X-Robots-Tag`), and gated by constant-time `ADMIN_PASSWORD` verification (`timingSafeEqual`) issuing an `HttpOnly`, `SameSite=Strict` HMAC-signed cookie (`fb_admin_session`). Public and admin mutations are protected by sliding-window rate limiting and payload byte caps.
- **Codebase Graph Analysis**: Generated architectural dependency and community cluster reports under `graphify-out/` (151 nodes, 448 edges, 7 communities) for `src/`.

- **Automatic Rule Loading**: Root `AGENTS.md` includes `@[AI_GUIDELINES.md](AI_GUIDELINES.md)` so Antigravity automatically loads and enforces `AI_GUIDELINES.md` on every session and turn without manual user prompting.
- **Workspace Agent Skills**: Installed `ui-ux-pro-max-skill` (7 UI/UX design skills + local datasets/scripts), `obra/superpowers` (15 engineering workflow skills), and `Graphify-Labs/graphify` (`graphify` knowledge-graph skill) alongside `karpathy-guidelines` under `.agents/skills/`.
- **Framework**: Next.js (App Router) with TypeScript strict mode and Tailwind CSS v4.
- **Persistence**: File-backed atomic JSON repository (`data/goalkeepers.json`) behind `goalkeeperRepository.ts`, ready for future migration to SQLite or PostgreSQL without changing client or domain contracts.
- **Commission Calculation**: Standardized at 15% (`PLATFORM_COMMISSION_RATE = 0.15`) via `calculateMatchFeeBreakdown`.
- **Localization**: Full Turkish (`tr`, default) and English (`en`) support isolated in `src/i18n/locales/*.json`.

## Next Candidate Milestones

1. Organizer match request persistence (`POST /api/bookings`) so match invitations are stored and trackable.
2. Goalkeeper profile authentication / edit token so registered goalkeepers can update availability or fees.
3. Urgent match broadcast ("Emergency Goalkeeper Needed") feed with time and turf venue fields.
