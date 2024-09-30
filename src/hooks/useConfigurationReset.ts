import {UseConfigurationResetResult} from "../internal/jotai/domain/configurationReset";
import {ConfigurationUninitialized} from "../types";
import {prepareAtomValueUsageWithSuspense} from "./AtomValueUsageHelper";

const useConfigurationReset: {
    /**
     * Gets whether the Configuration can be reset and a command to actually reset the Configuration to its initial state.
     * @remarks Will suspend until the Configuration is fully initialized.
     */
    (): UseConfigurationResetResult;
    /**
     * Gets whether the Configuration can be reset and a command to actually reset the Configuration to its initial state.
     * @param suspend Whether to disable the Suspense API.
     */
    (suspend: false): UseConfigurationResetResult | ConfigurationUninitialized;
} = prepareAtomValueUsageWithSuspense<UseConfigurationResetResult>(s => s.configurationResetAtom, s => s.configurationResetAtom);

export default useConfigurationReset;