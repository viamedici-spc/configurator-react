import {
    useAtomsContext

} from "../internal/contexts";
import {ConfigurationInitialization, ConfigurationUpdating} from "../types";
import {useAtomValue} from "jotai";

/**
 * Gets the initialization information for the configuration.
 * This is safe to use if the configuration is initializing.
 */
export function useConfigurationInitialization(): ConfigurationInitialization {
    const {selectors: {configurationInitializationAtom}} = useAtomsContext();
    return useAtomValue(configurationInitializationAtom);
}

/**
 * Gets the updating information for the configuration.
 * This is safe to use if the configuration is initializing.
 */
export function useConfigurationUpdating(): ConfigurationUpdating {
    const {selectors: {configurationUpdatingAtom}} = useAtomsContext();
    return useAtomValue(configurationUpdatingAtom);
}