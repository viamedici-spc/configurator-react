import {ConfigurationUninitialized} from "../types";
import {UseConfigurationStoringResult} from "../internal/jotai/domain/configurationStoring";
import {prepareAtomValueUsageWithSuspense} from "./AtomValueUsageHelper";

const useConfigurationStoring: {
    /**
     * Gets commands to store and restore a Configuration.
     * @remarks Will suspend until the configuration is fully initialized.
     */
    (): UseConfigurationStoringResult;
    /**
     * Gets commands to store and restore a Configuration.
     * @param suspend Whether to disable the Suspense API.
     */
    (suspend: false): UseConfigurationStoringResult | ConfigurationUninitialized;
} = prepareAtomValueUsageWithSuspense<UseConfigurationStoringResult>(s => s.configurationStoringAtom, s => s.configurationStoringAtom);

export default useConfigurationStoring;