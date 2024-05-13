import {FailureResult} from "@viamedici-spc/configurator-ts";

export type ConfigurationError = FailureResult & {
    retry?: () => void
};

export type EncapsulatedPromise = {
    promise: Promise<void> | null
}

export type ConfigurationInitialization = {
    /**
     * Gets whether the configuration is currently initializing.
     * This information is required for some hooks to be safely used.
     */
    isInitializing: boolean,
    /**
     * Houses a promise when the configuration is in the initializing state.
     * The promise resolves upon completion of the configuration initialization, subsequently becoming null.
     * A new promise is generated each time the configuration re-enters the initializing state.
     *
     * @remarks
     * The promise is wrapped in an object to navigate occasional issues where React fails to propagate updates of a React Context to child elements within a React Suspense barrier.
     * Such situations can lead to the initialization promise persistently remaining non-null, and thus, being continuously thrown by the ConfigurationSuspender even after it has been fulfilled.
     * Upon fulfillment of the promise, the encapsulation is imperatively updated to remove the promise for all listeners inside React Suspense barriers.
     */
    isInitializingPromise: EncapsulatedPromise | null
    error?: ConfigurationError
};

export type ConfigurationUpdating = {
    isUpdating: boolean,
    error?: ConfigurationError
};