# Changes

## React 18.2 or 19, ESM only

- **React baseline:** React is a peer dependency of `^18.2 || ^19`; React 17 is no longer supported.
- **ES modules only:** the package ships one ES module with its type declarations and no CommonJS build anymore. Use it
  through a bundler. Applications that test with Vitest need one setting for fp-ts (see the README).
- **Jotai 3:** the library uses Jotai 3 internally (with `jotai-family`); applications are not affected unless they
  reach into the library's atoms.

# Improvements

- **`scheduleTask` returns its result:** the command of `useTaskScheduling` resolves with a `ScheduleTaskResult` (the
  number of tasks still waiting), as configurator-ts's `scheduleTask` does; its type said `void` before.

# Fixes

- **StrictMode:** a configurator no longer loads forever (or leaks a session) under React's StrictMode, and a session
  that finishes creating after the component unmounted is closed.
- **Hooks mounted later resolve again:** with newer Jotai versions, hooks mounted after the initial load could stay
  suspended forever.
- **Installing with npm works again:** the package no longer runs a `postinstall` script that failed for consumers.
