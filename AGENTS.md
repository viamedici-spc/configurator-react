# Repository Guidelines

## Project Structure & Module Organization
- `src/` contains the library source:
  - `src/Configuration.tsx` is the provider component: it takes a `SessionContext` and creates/owns the configuration session. It re-creates the session whenever the `SessionContext` changes by referential equality (memoize it on the consumer side).
  - `src/hooks/` holds the public hooks (`useConfiguration`, `useMakeDecision`, `useDecisions`, `useChoiceAttribute`/`useBooleanAttribute`/`useNumericAttribute`/`useComponentAttribute`, `useExplain`, `useConfigurationStoring`, …).
  - `src/internal/` is internal: `contexts.tsx`, the Jotai store/atoms (`jotai/`), the XState `sessionManagementMachine.ts`, `SessionManagementInitializer.tsx`, and `EffectLoader.tsx`.
  - `src/index.ts` is the public entry point (the `Configuration` component and all hooks/types).
- `tests/` holds Vitest tests: `tests/hooks/` (per-hook), `tests/machines/` (the session-management machine), plus shared setup in `tests/Common.tsx`.
- `dist/` is the build output (ESM `index.js`, CJS `index.cjs`, types `index.d.ts`).

## Architecture Overview
- SPC uses a backend Configuration Engine (session-based REST API) that solves configuration decisions and returns consequences.
- `configurator-ts` is the TypeScript client on top of that API (session management, automatic resume, optimistic decisions, wire⇄domain mapping).
- This package (configurator-react) is the React layer on top of `configurator-ts`: it manages the session lifecycle with Jotai + XState and exposes hooks for UI integration. `configurator-framer` builds on this package.
- The `Configuration` component forwards the `configurator-ts` `SessionContext` unchanged, so new session options (e.g. `fixedDecisions`) flow through without a change here — bump the `@viamedici-spc/configurator-ts` dependency to pick them up. Consumers import contract types/errors directly from `configurator-ts`; this package intentionally does not re-export them.

## Build, Test, and Development Commands
- `npm run build` builds the library with Vite and emits bundled type declarations into `dist/`.
- `npm test` runs a type-check of the tests (`tsc -p ./tsconfig.test.json --noEmit`) followed by Vitest once.
- `npm run test:watch` runs Vitest in watch mode.
- `npm run typecheck` runs TypeScript without emitting.

## Coding Style & Naming Conventions
- TypeScript + React; `.tsx` for components/hooks, `.ts` for utilities; 4-space indentation; semicolons.
- Functional style with `@viamedici-spc/fp-ts-extensions`/`fp-ts`; state via `jotai` (+ `jotai-effect`, `jotai-xstate`) and `xstate`; stable hook state via `fp-ts-react-stable-hooks`.
- PascalCase for components (`Configuration.tsx`), camelCase for hooks (`useChoiceAttribute.ts`). Keep the public hook surface in `src/hooks/` and re-export it from `src/index.ts`; keep session/store wiring under `src/internal/`.
- `react` is a peer dependency (`>=17.0.1`); do not add it as a hard dependency.

## Testing Guidelines
- Vitest with `@testing-library/react`. Tests mock the session/context (via `tests/Common.tsx`) — they do not talk to a real engine, so they run offline and fast.
- Test files follow `*.test.tsx` naming, grouped under `tests/hooks/` and `tests/machines/`.
- Run `npm test` before submitting changes.

## Commit & Pull Request Guidelines
- Commit history uses short, sentence-case messages, typically past tense (e.g. “Updated configurator-ts to 4.2.0”).
- Keep commits focused. PRs should include a brief summary and testing notes.

## Configuration Tips
- The package version is set by CI at publish time (`package.json` stays `0.0.0`); a push to a branch publishes a prerelease tagged with the branch name.
- When releasing a change that depends on a new `configurator-ts`, bump the `@viamedici-spc/configurator-ts` dependency to the published (pre)release version first, then release this package.

## Documentation
- The root `README.md` documents installation and usage. Feature notes and conventions live in the `configurator-framer` docs (e.g. decision immutability & trimming).
