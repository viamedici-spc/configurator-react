import {UseExplainResult} from "../internal/jotai/domain/useExplain";
import {ConfigurationUninitialized} from "../types";
import {prepareAtomValueUsageWithSuspense} from "./AtomValueUsageHelper";

/**
 * Gets commands for explaining consequences.
 * @throws If configuration is initializing.
 */
const useExplain: {
    (): UseExplainResult;
    (suspend: false): UseExplainResult | ConfigurationUninitialized;
} = prepareAtomValueUsageWithSuspense<UseExplainResult>(s => s.useExplainAtom, s => s.useExplainAtom);

export default useExplain;