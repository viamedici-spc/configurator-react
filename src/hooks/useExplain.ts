import {UseExplainResult} from "../internal/jotai/domain/useExplain";
import {ConfigurationUninitialized} from "../types";
import {prepareAtomValueUsageWithSuspense} from "./AtomValueUsageHelper";

const useExplain: {
    /**
     * Gets commands for explaining circumstances.
     * @remarks Will suspend until the configuration is fully initialized.
     */
    (): UseExplainResult;
    /**
     * Gets commands for explaining circumstances.
     * @param suspend Whether to disable the Suspense api.
     */
    (suspend: false): UseExplainResult | ConfigurationUninitialized;
} = prepareAtomValueUsageWithSuspense<UseExplainResult>(s => s.useExplainAtom, s => s.useExplainAtom);

export default useExplain;