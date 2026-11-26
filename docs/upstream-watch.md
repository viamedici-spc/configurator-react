---
status: living
---

# Upstream watch

Things we would do differently if a dependency or a tool allowed it, each with the one command that says whether it does
yet.

⚠️ **Nobody polls this file.** It is read when somebody upgrades the dependency in question.

## fp-ts

### Load the packages in Node.js-based test runners without configuration

- **We would rather** have applications test with Vitest without extra settings.
- **We do instead** document `server.deps.inline: [/fp-ts/, /@viamedici-spc\//]` (README) and use it in
  `vitest.config.mts`.
- **What blocks it:** fp-ts 2.x ships ES modules whose imports have no file extensions; Node.js cannot load them.
- **Check** (an `exports` field means fp-ts may be loadable as ESM):

  ```bash
  npm view fp-ts@latest exports
  ```

- **What it would buy:** the Vitest setting goes away; so does it once the libraries no longer use fp-ts.
- **Upstream:** fp-ts 2.x is in maintenance.
- **Last checked:** fp-ts 2.16.11, 2026-11-26: no `exports` field.

## jotai-xstate

### Keep its declarations out of a consumer's type check without a build step

- **We would rather** publish the declarations as the bundler emits them.
- **We do instead** drop bare imports such as `import "jotai-xstate";` from `dist/index.d.ts` (`tsdown.config.ts`).
- **What blocks it:** jotai-xstate 0.6's declarations do not compile against current xstate, and the declaration bundle
  keeps a bare import of it, so a consumer's full type check fails although no jotai-xstate type is public.
- **Check** (no errors means jotai-xstate's declarations compile again):

  ```bash
  bunx tsc --noEmit --skipLibCheck false node_modules/jotai-xstate/dist/index.d.ts
  ```

- **What it would buy:** the plugin in `tsdown.config.ts` goes away.
- **Upstream:** not reported.
- **Last checked:** jotai-xstate 0.6.1 with xstate 5.33, 2026-11-26: errors.

## Bun

### Lint with `bun lint`

- **We would rather** lint with Bun itself.
- **We do instead** run oxlint (`bun run lint`).
- **Check** (help text instead of "Script not found" means it exists):

  ```bash
  bun lint --help
  ```

- **What it would buy:** one tool less.
- **Upstream:** Bun release notes.
- **Last checked:** Bun 1.4.5, 2026-11-26: not available.

### Publish with `bun publish`

- **We would rather** publish with `bun publish`.
- **We do instead** pack with `bun pm pack` and publish with `npm publish` in the shared CI workflow.
- **Check** (`CLOSED` means it may have landed):

  ```bash
  gh issue view 22423 --repo oven-sh/bun --json state --jq .state
  ```

- **What it would buy:** no Node.js setup in the publish job.
- **Upstream:** https://github.com/oven-sh/bun/issues/22423
- **Last checked:** Bun 1.4.5, 2026-11-26: open.
