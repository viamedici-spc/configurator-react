import {Configuration} from "@viamedici-spc/configurator-ts";
import {ConfigurationUninitialized} from "../types";
import {prepareAtomValueUsageWithSuspense} from "./AtomValueUsageHelper";

const useConfiguration: {
    /**
     * Gets the current Configuration state.
     * @remarks Will suspend until the Configuration is fully initialized.
     */
    (): Configuration;
    /**
     * Gets the current Configuration state.
     * @param suspend Whether to disable the Suspense API.
     */
    (suspend: false): Configuration | ConfigurationUninitialized;
} = prepareAtomValueUsageWithSuspense<Configuration>(s => s.guardedConfigurationAtom, s => s.configurationAtom);

export default useConfiguration;