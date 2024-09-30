import {UseResetConfigurationResult} from "../internal/jotai/domain/useResetConfiguration";
import {ConfigurationUninitialized} from "../types";
import {prepareAtomValueUsageWithSuspense} from "./AtomValueUsageHelper";

const useResetConfiguration: {
    (): UseResetConfigurationResult;
    (suspend: false): UseResetConfigurationResult | ConfigurationUninitialized;
} = prepareAtomValueUsageWithSuspense<UseResetConfigurationResult>(s => s.useResetConfigurationAtom, s => s.useResetConfigurationAtom);

export default useResetConfiguration;