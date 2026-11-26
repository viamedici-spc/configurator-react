# Changes

## React 18.2 or 19, ESM only

- **React baseline:** React is a peer dependency of `^18.2 || ^19`; React 17 is no longer supported.
- **ES modules only:** the package ships one ES module with its type declarations and no CommonJS build anymore. Use it
  through a bundler. Applications that test with Vitest need one setting for fp-ts (see the README).

## Peer dependencies

- **configurator-ts and Jotai are peer dependencies:** install `@viamedici-spc/configurator-ts` 5 and `jotai` 3 next to
  this package. The library uses your application's copies, so each exists once; before, an application with a
  different version got a second copy.
- **configurator-ts 5:** the configurator-ts types in this library's API are those of version 5; its own changes are in
  the [configurator-ts releases](https://github.com/viamedici-spc/configurator-ts/releases).
- **Jotai 3:** an application that passes its own store (`jotaiStore`), or uses `useConfiguratorStore` or
  `useJotaiAtoms`, works with Jotai 3, and the atom families of `useJotaiAtoms` come from `jotai-family`.

## Readonly types

- **Every public type is readonly:** the properties of the hooks' result types, `ConfigurationProps` and
  `UseJotaiAtomsResult` are `readonly`. Code that changed such an object after receiving it has to build a new one
  instead.

# Improvements

- **`scheduleTask` returns its result:** the command of `useTaskScheduling` resolves with a `ScheduleTaskResult` (the
  number of tasks still waiting), as configurator-ts's `scheduleTask` does; its type said `void` before.

# Fixes

- **StrictMode:** a configurator no longer loads forever (or leaks a session) under React's StrictMode, and a session
  that finishes creating after the component unmounted is closed.
- **Hooks mounted later resolve again:** with newer Jotai versions, hooks mounted after the initial load could stay
  suspended forever.
- **Installing with npm works again:** the package no longer runs a `postinstall` script that failed for consumers.
