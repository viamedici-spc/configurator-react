---
status: accepted
---

# ADR 0003: React 18.2 or 19 as peer, Jotai 3, developed on React 19

Date: 2026-11-26

## Context

The library allowed React 17 and newer, was tested on React 17 with the retired react-hooks testing library, and used
Jotai 2 with jotai-effect 1. Newer Jotai 2 versions (2.18 and up) with jotai-effect 1 broke hooks mounted after the
initial load, Jotai 3 needs React 18, and React 18's StrictMode exposed a session machine that stayed shut down after
the second mount.

## Decision

- React is a peer dependency of `^18.2 || ^19`. Development and the main test run use React 19; CI runs the tests on
  React 18 as well.
- Jotai 3, `jotai-family` for atom families, jotai-effect 2 and jotai-xstate 0.6. Subscriptions are kept alive by a
  derived atom, not an effect: while it is mounted, every subscribed atom stays mounted, also while one of them suspends
  or throws, and that does not depend on when effects run.
- Tests use Testing Library 16 (`renderHook`), Vitest 5 and jsdom; the lifecycle tests run the `Configuration`
  component with and without StrictMode at the root of the render.

## Consequences

- React 17 is no longer supported.
- The suspend-and-resume behaviour is tested the way an application sees it, through a `Suspense` boundary.

## Alternatives considered

- **Keep React 17:** Jotai 3 and current Testing Library require React 18.
- **React 19 only:** applications on React 18 (Framer, for one) could not upgrade.
- **An effect that reads every subscribed atom:** it works with jotai-effect 2 too. The derived atom was kept because
  it keeps the atoms mounted without depending on when effects run.
