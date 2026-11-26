import type {ConfigurationUninitialized} from "../types";
import {prepareAtomValueUsageWithSuspense} from "./AtomValueUsageHelper";
import type {StoredConfiguration} from "@viamedici-spc/configurator-ts";

const useStoredConfiguration: {
    /**
     * Gets the current non-optimistic Configuration state.
     * @remarks Will suspend until the configuration is fully initialized.
     */
    (): StoredConfiguration;
    /**
     * Gets the current non-optimistic Configuration state.
     * @param suspend Whether to disable the Suspense API.
     */
    (suspend: false): StoredConfiguration | ConfigurationUninitialized;
} = prepareAtomValueUsageWithSuspense<StoredConfiguration>(s => s.guardedStoredConfigurationAtom, s => s.storedConfigurationAtom);

export default useStoredConfiguration;