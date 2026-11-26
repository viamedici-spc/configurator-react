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
  bunx tsc --noEmit --skipLibCheck false --ignoreConfig node_modules/jotai-xstate/dist/index.d.ts
  ```

- **What it would buy:** the plugin in `tsdown.config.ts` goes away.
- **Upstream:** not reported.
- **Last checked:** jotai-xstate 0.6.1 with xstate 5.33.4, 2026-11-26: TS2305 (`__ResolvedTypesMetaFrom`) and TS2314.

## Bun

### Lint with `bun lint`

- **We would rather** lint with Bun itself.
- **We do instead** run oxlint (`bun run lint`).
- **What blocks it:** Bun has no released linter.
- **Check** (a line means Bun lists `lint` among its own commands; inside this repository `bun lint` would run the
  package's `lint` script instead):

  ```bash
  bun --help | grep -w lint
  ```

- **What it would buy:** one tool less.
- **Upstream:** Bun release notes.
- **Last checked:** Bun 1.4.5, 2026-11-26: no `lint` command.

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

## TypeScript and tsdown

### Declarations with TypeScript 7.1 and tsdown 0.24

- **We would rather** emit the declarations with TypeScript 7.1 and follow tsdown's releases.
- **We do instead** keep `typescript` at 7.0.2 and tsdown below 0.24 (`^0.23.7`). The build warns that tsdown's `tsgo`
  generator on TypeScript 7.0 is deprecated and goes away in tsdown's next minor.
- **What blocks it:** TypeScript 7.1 is not released; only its beta and nightly builds are published.
- **Check** (7.1 or later means it is released; then raise `typescript` first and tsdown after, not before):

  ```bash
  npm view typescript dist-tags.latest
  ```

- **What it would buy:** the deprecation warning goes away, and tsdown can move past 0.23.
- **Upstream:** TypeScript's release notes.
- **Last checked:** 2026-11-26: latest 7.0.2, 7.1 only as 7.1.0-beta.
