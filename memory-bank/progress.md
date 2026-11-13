# Project Progress — FileBekcisi

## Completed

- [x] High-level marketplace product plan, feature roadmap, and commission model definition.
- [x] Strict TypeScript, ESLint v9 flat config, Prettier, Tailwind CSS v4, and Vitest test harness setup.
- [x] Domain constants, runtime type guards, Zod validation schemas, and 15% fee breakdown engine.
- [x] Centralized `tr` and `en` i18n dictionaries with live header locale toggle.
- [x] Atomic JSON repository (`data/goalkeepers.json`) with seeded goalkeeper profiles and `/api/goalkeepers` (`GET` & `POST`) endpoints.
- [x] Interactive goalkeeper directory with multi-criteria filtering and booking fee preview modal.
- [x] Goalkeeper self-registration form (`GoalkeeperRegistrationForm`) with field-level validation and live directory insertion.
- [x] Unit and component test suites covering domain math, repository I/O, and registration form interactions.
- [x] Configured workspace-level `AGENTS.md` rule file referencing `AI_GUIDELINES.md` for automatic per-session rule injection.
- [x] Installed 22 agent skills from `nextlevelbuilder/ui-ux-pro-max-skill` and `obra/superpowers` into `.agents/skills/`.
- [x] Installed `graphify` skill from `Graphify-Labs/graphify` into `.agents/skills/graphify/SKILL.md` and generated `graphify-out/` codebase knowledge graph for `src/`.
- [x] Redesigned UI components and formal Turkish/English copy into a corporate architectural 6-column hairline grid layout (`FEAT-007`).

## Pending / Future Roadmap

- [ ] Persistent match booking requests (`data/bookings.json` or relational DB).
- [ ] Goalkeeper authentication and schedule management dashboard.
- [ ] Organizer post-match rating and verification workflow.
- [ ] Payment escrow gateway integration (Iyzico / PayTR marketplace sub-merchant API).
