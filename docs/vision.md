---
status: accepted
---

# Vision

## Goals

- A configurator in React needs no session plumbing: mount `Configuration`, read with hooks, act with commands.
- Rendering follows React's model: suspense while loading, error boundaries for failures, StrictMode-safe.

## Non-goals

- UI components and styling; applications bring their own (or use configurator-framer in Framer).

## Audiences

Developers of configurator applications in React, and the coding agents that help them.

## Place among the SPC libraries

The library builds on configurator-ts, and configurator-framer builds on it. It adds the React bindings that
configurator-ts does not have: the `Configuration` component, which owns a session for its subtree, and the hooks that
read the configuration and send commands.
