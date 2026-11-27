import type {ConfiguratorError} from "@viamedici-spc/configurator-ts";
import type {Atom} from "jotai";

/**
 * Represents an Atom which is guarded against access while the Configuration is not fully initialized.
 */
export type GuardedAtom<Value> = Atom<Value | ConfigurationUninitialized>;

export type ConfigurationUninitialized = "ConfigurationUninitialized";
export const ConfigurationUninitialized: ConfigurationUninitialized = "ConfigurationUninitialized";

/**
 * Represents an error that occurred during initializing or updating a Session.
 */
export type ConfiguratorErrorWithRetry = ConfiguratorError & {
    /**
     * Retries the failed session creation or update.
     *
     * It works while the state that carries the error is subscribed, which `useConfigurationInitialization` and
     * `useConfigurationUpdating` always do. Read with `store.get` alone from an atom of `useJotaiAtoms`, without a
     * subscription, it does nothing.
     */
    readonly retry?: () => void;
};

export type ConfigurationInitialization = {
    /**
     * Gets whether the Configuration is currently initializing.
     */
    readonly isInitializing: boolean;
    readonly error?: ConfiguratorErrorWithRetry;
};

export type ConfigurationUpdating = {
    /**
     * Gets whether the Configuration is currently updating.
     */
    readonly isUpdating: boolean;
    readonly error?: ConfiguratorErrorWithRetry;
};