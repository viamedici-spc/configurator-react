import {Configuration} from "@viamedici-spc/configurator-ts";
import {ConfigurationUninitialized} from "../types";
import {prepareAtomValueUsageWithSuspense} from "./AtomValueUsageHelper";

const useConfiguration: {
    /**
     * Gets the current configuration state.
     * @remarks Will suspend until the configuration is fully initialized.
     */
    (): Configuration;
    /**
     * Gets the current configuration state.
     * @param suspend Whether to disable the Suspense API.
     */
    (suspend: false): Configuration | ConfigurationUninitialized;
} = prepareAtomValueUsageWithSuspense<Configuration>(s => s.guardedConfigurationAtom, s => s.configurationAtom);

export default useConfiguration;