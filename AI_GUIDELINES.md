# Permanent AI Agent Instructions for (Project Name)

> [!IMPORTANT]
> Loaded on EVERY session and turn. AI MUST strictly follow all instructions herein and in `knowledge/AI_GUIDELINES.md` without exception.

---

## 1. Zero Any Policy & Modern Strict Type Safety (MANDATORY)

- **Rule 1.1 (100% Strict TypeScript & Zero Any Mandate)**: The `any` type, implicit `any`, unsafe type casting (`as unknown as X`, unverified `as`), and bypassing the type system are strictly forbidden under any circumstances. Type safety is absolute. Use explicit typing, discriminated unions, generic constraints, type narrowing, and runtime schema validation (e.g., Zod, Valibot).
- **Rule 1.2 (Modern Web Standards, Async Management & Safe Error Handling)**: Use modern ECMAScript/TypeScript idioms, strict `null`/`undefined` checking, async/await with robust error handling (Result patterns or structured `try/catch`), and never leave uncaught promises. Never swallow errors or use empty catch blocks without mathematically verified invariants.
- **Rule 1.3 (API Accuracy & Deprecated API Prohibition)**: Adhere strictly to latest stable docs of external packages and frameworks (React, Next.js, Vue, Tailwind CSS, or active workspace libraries). Deprecated lifecycle methods, legacy APIs, obsolete DOM methods, or outdated package signatures are forbidden.
- **Rule 1.4 (Breaking Changes & User Confirmation)**: Inform user and request explicit confirmation before introducing breaking changes, altering public component APIs, or upgrading core dependencies.

---

## 2. Mandatory TSDoc / JSDoc (`/** ... */`) Documentation & Quality Score Rule (MANDATORY)

- **Rule 2.1 (Mandatory Doc-Comments)**: Every new/modified component, custom hook, service function, context/store, utility helper, and exported interface/type MUST include TSDoc (`/** ... */`) doc-comments.
- **Rule 2.2 (Documentation Quality Score Requirement)**: Doc-comments must internally score >=8/10. Lower scores are strictly unacceptable.
- **Rule 2.3 (Meaningful Technical Descriptions)**: Comments must explain purpose, props/parameters, return values, side effects, failure modes, accessibility (a11y) notes, and integration usage. Merely repeating item names is forbidden.
- **Rule 2.4 (English-Only Source Code & Code Comments Mandate)**: Source code, identifiers, component/prop names, state variables, CSS classes/tokens, logs, and comments (`/** */`, `//`) MUST be 100% English. Turkish inside source files is forbidden (user-facing localized UI text belongs exclusively in dedicated i18n/localization files).
- **Rule 2.5 (Turkish Language Mandate for User Plans & Chat Interaction)**: User communication, plans (`implementation_plan.md`), and walkthroughs (`walkthrough.md`) MUST be written in Turkish for optimal clarity.

- ### Documentation Score Standard

```txt
0/10 = Missing documentation.
1/10 = Useless placeholder comment.
2/10 = Extremely vague and not technically helpful.
3/10 = Mostly repeats the item name.
4/10 = Mentions purpose but lacks useful context.
5/10 = Basic explanation, but incomplete.
6/10 = Understandable but missing constraints, behavior, or usage notes.
7/10 = Good enough for humans, but not strong enough for long-term AI context.
8/10 = Acceptable: clear purpose, props/params, behavior, and relevant context.
9/10 = Strong: explains purpose, behavior, constraints, side effects, and integration context.
10/10 = Excellent: future-proof, precise, technically rich, and useful for AI/human maintenance.
```

---

## 3. Persistent Knowledge Base & Memory Bank Synchronization (MANDATORY - Zero Postponement)

- **Rule 3.1 (Dual-Track Targeted Synchronous Documentation Execution)**: Synchronously update targeted docs BEFORE completing response:
  - **Bug Fixes**: Log in `knowledge/history/bug_fixes.md` (Core) or `(sub_project_name)_bug_fixes.md` ((Sub-Project Name)). Never add bug fixes to feature tables.
  - **New Features**: Document in `knowledge/history/web_features.md` (Core) or `(sub_project_name)_features.md` ((Sub-Project Name)) in categorized tables.
  - **Session Progress**: Synchronize in `memory-bank/activeContext.md` & `progress.md` (Core) or `(sub_project_name)_memory_bank/` ((Sub-Project Name)).
- **Rule 3.2 (Zero-Postponement Policy)**: "Will write later" or batching is strictly forbidden. Apply updates immediately in the same turn.
- **Rule 3.3 (Memory Bank Reading on Task Start)**: Read relevant memory bank and history files before starting any task.
- **Rule 3.4 (Dedicated Feature Documentation)**: Create or update a dedicated descriptive `.md` document under `knowledge/` for major new pages, architectural patterns, state systems, or API integrations.

---

## 4. Modular Responsibility, SRP & Clean Boundaries (MANDATORY)

- **Rule 4.1 (Single Responsibility Per File - SRP)**: Every `.ts`, `.tsx`, `.js`, or CSS/style module must have ONE specific responsibility. Keep entry pages (`page.tsx`, `App.tsx`) thin and delegate UI and logic to specialized subcomponents, hooks, and services. Strict separation of UI rendering from business logic is enforced.
- **Rule 4.2 (Anti-God Component & Anti-God Object Mandate)**: Monolithic "god components" managing multiple disconnected UI sections or massive state stores controlling unrelated domains are strictly forbidden. Decompose large views into focused sub-components and domain-driven stores/slices.
- **Rule 4.3 (File & Function Size Limits - Balanced Standard)**:
  - Source files MUST NOT exceed **300 lines** (Hard Limit).
  - UI Components (`.tsx`, `.jsx`, `.vue`) should stay within **200–250 lines** (extract sub-components or custom hooks when approaching this threshold).
  - Custom Hooks, Stores & State modules MUST NOT exceed **150 lines**.
  - Functions and component render bodies MUST NOT exceed **50–70 lines**. Break monolithic routines into private helper functions or dedicated submodules.
- **Rule 4.4 (Strict File Boundary Enforcement)**: Existing module boundaries are absolute. Never merge files, collapse modules, or centralize logic without explicit instruction.
- **Rule 4.5 (Module Root Purity & Modern Export Layout Mandate)**: Barrel/entry files (`index.ts` or `index.js`) MUST strictly serve solely as connection and export points containing ONLY export declarations (`export * from ...;`, `export { ... } from ...;`). Writing implementation logic, JSX, functions, state, or algorithms inside entry index files is strictly forbidden and must be placed in dedicated submodules. Circular dependencies across barrel exports are strictly banned.

---

## 5. Scope Isolation, Architecture Preservation & AI Behavior Lock (MANDATORY)

- **Rule 5.1 (Scope Isolation)**: Only modify the explicitly requested file or module. Unrequested changes or refactoring outside the target area are forbidden.
- **Rule 5.2 (No Implicit Refactoring)**: Reorganizing or rewriting code without instruction is forbidden. Existing architecture is stable and production-grade.
- **Rule 5.3 (AI Behavior Lock & Uncertainty Resolution)**: Never assume missing context or guess. If uncertain or facing ambiguity, ASK the user.

---

## 6. Comprehensive Quality, Formatting & Performance Verification (MANDATORY)

- **Rule 6.1 (Multi-Tool Verification Suite)**: Whenever source code or configs (`.ts`, `.tsx`, `.js`, `.json`, `.css`) are modified, execute before completion:
  1. `npm run lint` / `pnpm lint` (0 warnings / 0 errors via ESLint/Biome).
  2. `npx tsc --noEmit` (100% type-safe compilation, 0 errors).
  3. `npx prettier --check .` (100% compliant formatting).
  4. `npm test` / `pnpm test` (100% passed unit and integration tests).
  *(Skip checks if only markdown files (`.md`) or docs are modified).*
- **Rule 6.2 (Quantitative Performance & Core Web Vitals Reporting)**: When modifying source code, report: Core Web Vitals impact (LCP, CLS, INP), bundle size delta, memoization stability, and asset optimization (image sizing, font display, lazy loading).
- **Rule 6.3 (Mandatory Verification Report Block)**: When source code changes are made, final response MUST include:
  - 🛠️ **ESLint / Linter**: 0 warnings / 0 errors
  - 🔷 **TypeScript (`tsc`)**: 0 type errors (`tsc --noEmit`)
  - 🎨 **Code Format**: 100% Compliant (`prettier --check`)
  - 🧪 **Test Suite**: All tests passed (X passed, 0 failed)
  - ⚡ **Performance & Web Vitals**: [Quantitative impact, e.g., "Zero layout shift (CLS: 0.0), optimized asset load"]
  - 🔄 **Re-render & State Efficiency**: [Memoized hot paths / Clean unmount cycles]
  - 📦 **Bundle Size Impact**: [Impact delta, e.g., "+0 KB / Tree-shaken"]
- **Rule 6.4 (Mandatory Unit & Component Testing)**: Whenever core business logic, utility math/parsers, auth/permission guards, complex custom hooks, or state reducers are modified, unit/component tests (`*.test.ts`, `*.test.tsx`) MUST be written to verify invariants and edge cases (empty states, network errors, boundary values, async timeouts). Pure decorative presentation layouts are exempt.

---

## 7. Copyright and SPDX Header Rule (MANDATORY)

- **Rule 7.1 (Header Requirement)**: Every project source file (`.ts`, `.tsx`, `.js`, `.css`) MUST begin with the exact two-line header:
  ```typescript
  // SPDX-License-Identifier: (License name)
  // Copyright (c) 2026 (Github Name) / (Project Name). All rights reserved.
  ```
- **Rule 7.2 (Preservation & Creation)**: Prepend header to new source files and preserve it during all modifications.

---

## 8. Git Push, Public Exporter & Human-Engineer Commit Standards (MANDATORY)

- **Rule 8.1 (AI-Free Human Engineer Commit Messages)**: Commit messages must be concise, technical, human-engineer format (`feat(scope): ...`, `fix(scope): ...`), completely free of marketing adjectives or AI phrasing.
- **Rule 8.2 (Private Repo Workflow)**: After verifying with tests and receiving explicit approval (e.g. "githuba yolla", "push to github", "kural 8"), commit and push to private repository (`git add .`, `git commit -m "..."`, `git push`).
- **Rule 8.3 (Mandatory Dual Synchronous Public Export Workflow)**: Immediately after pushing to private repo, automatically execute `python scripts/export_public.py --push` in the same turn (if present). This sanitizes code and strips internal docs before pushing to public repo (`https://github.com/(Github Name)/(Project Name).git`).
- **Rule 8.4 (Private File & Memory Bank Confidentiality in Commits)**: Commits, PRs, and releases MUST NEVER mention internal-only files or memory banks (`knowledge/`, `memory-bank/`, `AI_GUIDELINES.md`, etc.). Only public technical changes may be described.

---

## 9. Strict Redundant Re-render & Memory Leak Prevention Rule (MANDATORY)

- **Rule 9.1 (No Unnecessary Re-renders & State Duplication)**: Storing derived state in component state (`useState`) when it can be computed during render is strictly forbidden. Avoid unnecessary re-renders caused by passing unstable object/array references as props.
- **Rule 9.2 (Targeted Memoization & Reference Stability)**: Use `useCallback`, `useMemo`, or React Compiler patterns where computationally or referentially justified (e.g., dependency arrays, heavy transformations, debounced callbacks). Premature or indiscriminate memoization without technical necessity is forbidden.
- **Rule 9.3 (Mandatory Cleanup on Asynchronous Side Effects)**: Every `useEffect`, subscription, WebSocket, timer (`setInterval`/`setTimeout`), or DOM event listener MUST return a cleanup function to prevent memory leaks and unmounted component state updates.
- **Rule 9.4 (Hot Render Path Allocation & Asset Bloat Lock)**: Creating large closures, instantiating expensive classes, inline regex compilation, or loading unoptimized high-resolution media inside frequently re-rendered UI hot paths is a direct rule violation. Use dynamic imports (`React.lazy` / `next/dynamic`) for non-critical routes and heavy dialogs.

---

## 10. Absolute Prohibition of Hardcoded Magic String Heuristics (MANDATORY)

- **Rule 10.1 (Universal Ban on String-Based Subsystem Logic)**: Application decisions MUST NEVER inspect raw string literals or UI element text (`status === "done"`, `text.includes(...)`, arbitrary CSS class checks).
- **Rule 10.2 (100% Data-Driven & Explicit Type System Mandate)**: Decisions must be driven directly by type-safe TypeScript enums, string literal union types (`type Status = 'idle' | 'loading' | 'success' | 'error'`), `as const` mapping objects, typed API models, or validated schemas.
- **Rule 10.3 (Asset, Language & Localization Independence)**: UI must function flawlessly with dynamic localization (i18n). Hardcoding user-facing copy directly into business logic or components is forbidden; all copy must be retrieved from centralized localization catalogs/tokens.
- **Rule 10.4 (Application-Wide Industrial Solution Mandate)**: Never write temporary string checks or one-off workarounds for specific page instances. Solutions must be generic, modular, reusable, and follow modern web architecture.

---

## 11. Strict Prohibition of Linter and Type Warning Suppression Directives (MANDATORY)

- **Rule 11.1 (Universal Ban on Linter & Type Suppressions)**: Directives like `// @ts-ignore`, `// @ts-nocheck`, `// @ts-expect-error`, `/* eslint-disable */`, `// eslint-disable-next-line`, and all other warning suppression comments are universally banned without exception.
- **Rule 11.2 (Refactor Over Suppression)**: Refactor underlying architecture: split overloaded components, narrow ambiguous types with type guards, define explicit interfaces, and apply idiomatic TypeScript patterns.
- **Rule 11.3 (Root-Cause Engineering)**: Resolve type mismatches and linter warnings at root cause; never sweep warnings under the rug with bypass comments.

---

## 12. Neutral & Brand-Free Technical Documentation Standard (MANDATORY)

- **Rule 12.1 (No Third-Party Software / Brand Name-Dropping)**: Never reference irrelevant third-party commercial applications or frameworks as subjective quality buzzwords ("Vercel-level", "Apple-style polish", "Stripe-standard"). Describe technical patterns directly (e.g., "optimistic UI updates", "accessible focus ring navigation").
- **Rule 12.2 (No Hype or Superlative Adjectives)**: Subjective marketing words ("pixel-perfect", "revolutionary", "flawless", "lightning-fast", "world-class") are forbidden.
- **Rule 12.3 (Factual, Concise & Objective Engineering Language)**: Documentation, component docs, and comments must describe only what the code does, props/state specifications, accessibility (a11y) standards, and architectural purpose in objective engineering language.
