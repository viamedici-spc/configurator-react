---
status: accepted
---

# ADR 0001: The library targets browsers and ships ES modules only

Date: 2026-11-26

## Context

configurator-react runs in configurator applications in the browser: through a bundler, or inside the self-contained
bundle of configurator-framer loaded from a CDN. The package used to ship ES modules and CommonJS side by side, without
`"type": "module"`, to keep older bundlers working; the ES build was not standard ESM.

## Decision

The package is ESM only (`"type": "module"`, `exports` with the ES module and its declarations) and supports browsers
through a bundler or a CDN bundle. Node.js is not a supported runtime. All dependencies stay external.

## Consequences

- No CommonJS build; `require` is not supported.
- Plain Node.js cannot import the package: it loads fp-ts's ES files, but cannot resolve their imports, which have no
  file extension. The tests run on Vitest in Node.js, with `server.deps.inline` (below).
- In server-side rendering frameworks the library runs on the client only.
- Test runners that run in Node.js (Vitest) must let their bundler transform fp-ts and the SPC packages
  (`server.deps.inline`, see the README); the alternative, inlining fp-ts into this package, was not chosen: it would
  duplicate fp-ts for consumers that use it directly.

## Alternatives considered

- **Keep CommonJS beside ESM:** no supported environment needs it, and it made the ES build non-standard.
- **Support Node.js:** not a runtime this library targets: it renders in the browser, and in server-side rendering
  frameworks on the client only.
