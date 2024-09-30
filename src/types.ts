import {ConfiguratorError} from "@viamedici-spc/configurator-ts";
import {Atom} from "jotai";

export type GuardedAtom<Value> = Atom<Value | ConfigurationUninitialized>;

export type ConfigurationUninitialized = "ConfigurationUninitialized";
export const ConfigurationUninitialized: ConfigurationUninitialized = "ConfigurationUninitialized";

export type ConfiguratorErrorWithRetry = ConfiguratorError & {
    readonly retry?: () => void
};

export type ConfigurationInitialization = {
    /**
     * Gets whether the configuration is currently initializing.
     * This information is required for some hooks to be safely used.
     */
    readonly isInitializing: boolean,
    readonly error?: ConfiguratorErrorWithRetry
};

export type ConfigurationUpdating = {
    readonly isUpdating: boolean,
    readonly error?: ConfiguratorErrorWithRetry
};