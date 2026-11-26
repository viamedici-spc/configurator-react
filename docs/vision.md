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
