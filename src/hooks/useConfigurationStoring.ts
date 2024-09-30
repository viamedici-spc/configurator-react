import {ConfigurationUninitialized} from "../types";
import {UseConfigurationStoringResult} from "../internal/jotai/domain/useConfigurationStoring";
import {prepareAtomValueUsageWithSuspense} from "./AtomValueUsageHelper";

const useConfigurationStoring: {
    (): UseConfigurationStoringResult;
    (suspend: false): UseConfigurationStoringResult | ConfigurationUninitialized;
} = prepareAtomValueUsageWithSuspense<UseConfigurationStoringResult>(s => s.useConfigurationStoringAtom, s => s.useConfigurationStoringAtom);

export default useConfigurationStoring;