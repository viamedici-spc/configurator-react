import {UseExplainResult} from "../internal/jotai/domain/explain";
import {ConfigurationUninitialized} from "../types";
import {prepareAtomValueUsageWithSuspense} from "./AtomValueUsageHelper";

const useExplain: {
    /**
     * Gets commands for explaining circumstances.
     * @remarks Will suspend until the Configuration is fully initialized.
     */
    (): UseExplainResult;
    /**
     * Gets commands for explaining circumstances.
     * @param suspend Whether to disable the Suspense API.
     */
    (suspend: false): UseExplainResult | ConfigurationUninitialized;
} = prepareAtomValueUsageWithSuspense<UseExplainResult>(s => s.explainAtom, s => s.explainAtom);

export default useExplain;