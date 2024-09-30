import {Configuration} from "@viamedici-spc/configurator-ts";
import {ConfigurationUninitialized} from "../types";
import {prepareAtomValueUsageWithSuspense} from "./AtomValueUsageHelper";

/**
 * Gets the current configuration data and allows to restore a configuration.
 * @throws If configuration is initializing.
 */
const useConfiguration: {
    (): Configuration;
    (suspend: false): Configuration | ConfigurationUninitialized;
} = prepareAtomValueUsageWithSuspense<Configuration>(s => s.guardedConfigurationAtom, s => s.configurationAtom);

export default useConfiguration;