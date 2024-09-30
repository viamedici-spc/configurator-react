import {ConfigurationUninitialized} from "../types";
import {prepareAtomValueUsageWithSuspense} from "./AtomValueUsageHelper";
import {UseConfigurationSatisfactionResult} from "../internal/jotai/domain/configurationSatisfaction";

const useConfigurationSatisfaction: {
    /**
     * Gets the Configuration satisfaction state and allows to explain an unsatisfied state.
     * @remarks Will suspend until the configuration is fully initialized.
     */
    (): UseConfigurationSatisfactionResult;
    /**
     * Gets the Configuration satisfaction state and allows to explain an unsatisfied state.
     * @param suspend Whether to disable the Suspense API.
     */
    (suspend: false): UseConfigurationSatisfactionResult | ConfigurationUninitialized;
} = prepareAtomValueUsageWithSuspense<UseConfigurationSatisfactionResult>(s => s.configurationSatisfactionAtom, s => s.configurationSatisfactionAtom);

export default useConfigurationSatisfaction;