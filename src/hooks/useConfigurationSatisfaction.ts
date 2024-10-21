import {ConfigurationUninitialized} from "../types";
import {UseConfigurationStoringResult} from "../internal/jotai/domain/useConfigurationStoring";
import {prepareAtomValueUsageWithSuspense} from "./AtomValueUsageHelper";
import {UseConfigurationSatisfactionResult} from "../internal/jotai/domain/useConfigurationSatisfaction";

const useConfigurationSatisfaction: {
    /**
     * Gets the configuration satisfaction and allows to explain an unsatisfied state.
     * @remarks Will suspend until the configuration is fully initialized.
     */
    (): UseConfigurationSatisfactionResult;
    /**
     * Gets the configuration satisfaction and allows to explain an unsatisfied state.
     * @param suspend Whether to disable the Suspense api.
     */
    (suspend: false): UseConfigurationSatisfactionResult | ConfigurationUninitialized;
} = prepareAtomValueUsageWithSuspense<UseConfigurationSatisfactionResult>(s => s.useConfigurationSatisfactionAtom, s => s.useConfigurationSatisfactionAtom);

export default useConfigurationSatisfaction;