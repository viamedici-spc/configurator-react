import {UseConfigurationResetResult} from "../internal/jotai/domain/configurationReset";
import {ConfigurationUninitialized} from "../types";
import {prepareAtomValueUsageWithSuspense} from "./AtomValueUsageHelper";

const useConfigurationReset: {
    /**
     * Gets whether the configuration can be reset and a command to actually reset the configuration to its initial state.
     * @remarks Will suspend until the configuration is fully initialized.
     */
    (): UseConfigurationResetResult;
    /**
     * Gets whether the configuration can be reset and a command to actually reset the configuration to its initial state.
     * @param suspend Whether to disable the Suspense API.
     */
    (suspend: false): UseConfigurationResetResult | ConfigurationUninitialized;
} = prepareAtomValueUsageWithSuspense<UseConfigurationResetResult>(s => s.configurationResetAtom, s => s.configurationResetAtom);

export default useConfigurationReset;