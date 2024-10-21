import {ConfigurationUninitialized} from "../types";
import {UseConfigurationStoringResult} from "../internal/jotai/domain/useConfigurationStoring";
import {prepareAtomValueUsageWithSuspense} from "./AtomValueUsageHelper";

const useConfigurationStoring: {
    /**
     * Gets commands to store and restore a configuration.
     * @remarks Will suspend until the configuration is fully initialized.
     */
    (): UseConfigurationStoringResult;
    /**
     * Gets commands to store and restore a configuration.
     * @param suspend Whether to disable the Suspense api.
     */
    (suspend: false): UseConfigurationStoringResult | ConfigurationUninitialized;
} = prepareAtomValueUsageWithSuspense<UseConfigurationStoringResult>(s => s.useConfigurationStoringAtom, s => s.useConfigurationStoringAtom);

export default useConfigurationStoring;