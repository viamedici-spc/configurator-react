import {ConfiguratorError} from "@viamedici-spc/configurator-ts";
import {Atom} from "jotai";

/**
 * Represents an Atom which is guarded against access while the Configuration is not fully initialized.
 */
export type GuardedAtom<Value> = Atom<NonNullable<Value> | ConfigurationUninitialized>;

export type ConfigurationUninitialized = "ConfigurationUninitialized";
export const ConfigurationUninitialized: ConfigurationUninitialized = "ConfigurationUninitialized";

/**
 * Represents an error that occurred during initializing or updating a Session.
 */
export type ConfiguratorErrorWithRetry = ConfiguratorError & {
    /**
     * Retry the failed operation.
     */
    readonly retry?: () => void
};

export type ConfigurationInitialization = {
    /**
     * Gets whether the Configuration is currently initializing.
     */
    readonly isInitializing: boolean,
    readonly error?: ConfiguratorErrorWithRetry
};

export type ConfigurationUpdating = {
    /**
     * Gets whether the Configuration is currently updating.
     */
    readonly isUpdating: boolean,
    readonly error?: ConfiguratorErrorWithRetry
};