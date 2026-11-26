---
status: accepted
---

# configurator-react

## Purpose

React bindings for configurator-ts: the `Configuration` component opens and owns a configuration session for its
subtree, and hooks read the configuration (attributes, decisions, satisfaction) and send commands (make decisions,
explain, store and restore, reset). Reading hooks suspend until the session is ready, so an application renders with
`Suspense` and error boundaries instead of loading flags.

Out of scope: UI components (configurator-framer brings those for Framer), and anything configurator-ts does below the
React layer.

## Public contract

- The entry point `src/index.ts` exports `Configuration`, the hooks in `src/hooks/` and their result types.
- Reading hooks come in a suspending form and a form that returns `ConfigurationUninitialized` instead
  (`useX(…, false)`).

## Invariants

- **At most one session stays open per `Configuration`.** It is created when the component mounts, updated when its
  `sessionContext` changes and closed when it unmounts, also when it unmounts while the session is still being created.
  Under StrictMode, which mounts effects twice, a second session is created and the first one is closed.
- **State is reached through hooks only**, never through a context or an atom directly.
- **React, configurator-ts and Jotai are peer dependencies** (`^18.2 || ^19`, `^5.0.0-0`, `^3`): the library uses the
  application's copies ([ADR 0004](adr/0004-peer-dependencies.md)).

## Architecture

`Configuration` provides a Jotai store and atoms (`src/internal/jotai/`). An XState machine
(`src/internal/sessionManagementMachine.ts`) creates, updates and closes the session; subscription atoms forward the
session's change events into atoms; suspending atoms resolve once the session is ready.

## Supported environments

Browsers with React 18.2 or 19, as ESM through a bundler; not Node.js
([ADR 0001](adr/0001-browser-target-and-esm-only.md), [ADR 0003](adr/0003-react-baseline.md)). Test runners in Node.js
need the setting described in the README.

## Commands

| Command | What it does |
|---|---|
| `bun install` | Installs the dependencies (Bun is the package manager; the test app is a workspace package). |
| `bun run verify` | The gate, its steps in parallel: type check of sources, tests, the test app (against the sources, with its Vite configuration) and the configuration files at the root and `package-check/`, lint, format check, tests, build with package checks (`package.json` unchanged, consumer type check, publint, arethetypeswrong). |
| `bun run test` | Runs the tests with Vitest (jsdom, Testing Library). |
| `bun run build` | Builds `dist/`. |
| `bun run --filter configurator-react-test-app start` | Starts the test app (needs a build of the library): a development playground that runs the library from the workspace against the public demo deployment; not a demo. |
| `bun fmt` | Formats the code. |

## Links

- [AGENTS.md](../AGENTS.md), [upstream-watch.md](upstream-watch.md).
