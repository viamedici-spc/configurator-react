import {ConfigurationUninitialized} from "../types";
import {UseConfigurationStoringResult} from "../internal/jotai/domain/useConfigurationStoring";
import {prepareAtomValueUsageWithSuspense} from "./AtomValueUsageHelper";
import {UseConfigurationSatisfactionResult} from "../internal/jotai/domain/useConfigurationSatisfaction";

const useConfigurationSatisfaction: {
    (): UseConfigurationSatisfactionResult;
    (suspend: false): UseConfigurationSatisfactionResult | ConfigurationUninitialized;
} = prepareAtomValueUsageWithSuspense<UseConfigurationSatisfactionResult>(s => s.useConfigurationSatisfactionAtom, s => s.useConfigurationSatisfactionAtom);

export default useConfigurationSatisfaction;