---
status: accepted
---

# ADR 0004: configurator-ts and Jotai are peer dependencies

Date: 2026-11-26

## Context

The library's API passes objects of two packages across its boundary. An application builds the `SessionContext` and
handles a `ConfiguratorError` with configurator-ts's types and functions, and it may pass its own Jotai store
(`jotaiStore`) or read the library's atoms with its own Jotai (`useConfiguratorStore`, `useJotaiAtoms`).

Both packages were regular dependencies, configurator-ts at an exact version. An application whose own configurator-ts
or Jotai differed from the library's got a second copy of it, and nothing said so: the type check passes, also with a
Jotai 2 store passed as `jotaiStore`, and only the bundle grows. A second configurator-ts holds its own state, so a log
level the application sets with `setLogLevel` does not reach the session the library creates, and a configurator-ts
fix reaches the application only through a release of this library. `Configuration` provides its store to its
children through a Jotai `Provider`; whether the application's own atoms inside it share that store depends on there
being one Jotai.

## Decision

A package is a peer dependency where the application shares its objects with the library, and a regular dependency
where the library uses it only inside.

- **Peer dependencies:** React (`^18.2 || ^19`, [ADR 0003](0003-react-baseline.md)), configurator-ts (`^5.0.0-0`) and
  Jotai (`^3`). The configurator-ts range starts at the major release the library is developed against and admits its
  prereleases.
- **Regular dependencies:** what the library uses only inside, such as XState, ts-pattern and memize, and the Jotai
  add-ons jotai-effect, jotai-family and jotai-xstate, which peer Jotai themselves and are met by the application's
  copy.
- For its tests, the library has configurator-ts at an exact version and Jotai as dev dependencies.

## Consequences

- An application installs configurator-ts and Jotai next to this package, and each exists once: the library uses the
  application's copies.
- A configurator-ts fix reaches an application with the application's own update, without a release of this library.
- The peer ranges must admit the prereleases the library is developed against.
- configurator-framer, which builds on this library, meets the peers with its own dependencies.

## Alternatives considered

- **An exact dependency, with the README naming the version to install:** manual, and silent when an application gets
  it wrong.
- **Re-export configurator-ts from this package:** a large change of the API, and a configurator-ts fix would still
  need a release of this library.
- **Decide later:** turning a dependency into a peer dependency is a breaking change, so it would cost another major
  release.
