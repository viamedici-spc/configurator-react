import {
    ConfigurationInitializationContext, ConfigurationUpdatingContext
} from "./internal/contexts";
import {useContext} from "react";
import {ConfigurationInitialization, ConfigurationUpdating} from "./types";

/**
 * Gets the initialization information for the configuration.
 * This is safe to use if the configuration is initializing.
 */
export function useConfigurationInitialization(): ConfigurationInitialization {
    return useContext(ConfigurationInitializationContext);
}

/**
 * Gets the updating information for the configuration.
 * This is safe to use if the configuration is initializing.
 */
export function useConfigurationUpdating(): ConfigurationUpdating {
    return useContext(ConfigurationUpdatingContext);
}