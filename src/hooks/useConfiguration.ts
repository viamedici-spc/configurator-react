import {Configuration} from "@viamedici-spc/configurator-ts";
import {ConfigurationUninitialized} from "../types";
import {prepareAtomValueUsageWithSuspense} from "./AtomValueUsageHelper";

const useConfiguration: {
    /**
     * Gets the current configuration data.
     * @remarks Will suspend until the configuration is fully initialized.
     */
    (): Configuration;
    /**
     * Gets the current configuration data.
     * @param suspend Whether to disable the Suspense api.
     */
    (suspend: false): Configuration | ConfigurationUninitialized;
} = prepareAtomValueUsageWithSuspense<Configuration>(s => s.guardedConfigurationAtom, s => s.configurationAtom);

export default useConfiguration;