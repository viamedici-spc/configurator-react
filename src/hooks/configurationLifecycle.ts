import {
    useAtomsContext, useConfiguratorStore
} from "../internal/contexts";
import {ConfigurationInitialization, ConfigurationUpdating} from "../types";
import {useAtomValue} from "jotai";

/**
 * Gets the initialization information for the Configuration.
 */
export function useConfigurationInitialization(): ConfigurationInitialization {
    const {selectors: {configurationInitializationAtom}} = useAtomsContext();
    const store = useConfiguratorStore();
    return useAtomValue(configurationInitializationAtom, {store});
}

/**
 * Gets the updating information for the Configuration.
 */
export function useConfigurationUpdating(): ConfigurationUpdating {
    const {selectors: {configurationUpdatingAtom}} = useAtomsContext();
    const store = useConfiguratorStore();
    return useAtomValue(configurationUpdatingAtom, {store});
}