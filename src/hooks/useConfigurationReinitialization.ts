import {ConfigurationUninitialized} from "../types";
import {prepareAtomValueUsageWithSuspense} from "./AtomValueUsageHelper";
import {UseConfigurationReinitializationResult} from "../internal/jotai/domain/useSessionReinitialization";

const useConfigurationReinitialization: {
    /**
     * Gets a command to reinitialize the session.
     * @remarks Will suspend until the configuration is fully initialized.
     */
    (): UseConfigurationReinitializationResult;
    /**
     * Gets a command to reinitialize the session.
     * @param suspend Whether to disable the Suspense api.
     */
    (suspend: false): UseConfigurationReinitializationResult | ConfigurationUninitialized;
} = prepareAtomValueUsageWithSuspense<UseConfigurationReinitializationResult>(s => s.useConfigurationReinitializationAtom, s => s.useConfigurationReinitializationAtom);

export default useConfigurationReinitialization;