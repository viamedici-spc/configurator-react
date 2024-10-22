import {UseDecisionResult} from "../internal/jotai/domain/decision";
import {ConfigurationUninitialized} from "../types";
import {prepareAtomValueUsageWithSuspense} from "./AtomValueUsageHelper";

const useDecision: {
    /**
     * Gets commands for making one or many decisions and a query for all decisions.
     * @remarks Will suspend until the configuration is fully initialized.
     */
    (): UseDecisionResult;
    /**
     * Gets commands for making one or many decisions and a query for all decisions.
     * @param suspend Whether to disable the Suspense API.
     */
    (suspend: false): UseDecisionResult | ConfigurationUninitialized;
} = prepareAtomValueUsageWithSuspense<UseDecisionResult>(s => s.decisionAtom, s => s.decisionAtom);

export default useDecision;