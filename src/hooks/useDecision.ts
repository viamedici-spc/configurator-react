import {UseDecisionResult} from "../internal/jotai/domain/useDecision";
import {ConfigurationUninitialized} from "../types";
import {prepareAtomValueUsageWithSuspense} from "./AtomValueUsageHelper";

const useDecision: {
    /**
     * Gets commands for making one or many decisions.
     * @remarks Will suspend until the configuration is fully initialized.
     */
    (): UseDecisionResult;
    /**
     * Gets commands for making one or many decisions.
     * @param suspend Whether to disable the Suspense api.
     */
    (suspend: false): UseDecisionResult | ConfigurationUninitialized;
} = prepareAtomValueUsageWithSuspense<UseDecisionResult>(s => s.useDecisionAtom, s => s.useDecisionAtom);

export default useDecision;