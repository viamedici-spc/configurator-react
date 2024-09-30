import {ConfigurationUninitialized} from "../types";
import {prepareAtomValueUsageWithSuspense} from "./AtomValueUsageHelper";
import {UseMakeDecisionResult} from "../internal/jotai/domain/makeDecision";

const useMakeDecision: {
    /**
     * Gets commands for making one or many decisions.
     * @remarks Will suspend until the Configuration is fully initialized.
     */
    (): UseMakeDecisionResult;
    /**
     * Gets commands for making one or many decisions.
     * @param suspend Whether to disable the Suspense API.
     */
    (suspend: false): UseMakeDecisionResult | ConfigurationUninitialized;
} = prepareAtomValueUsageWithSuspense<UseMakeDecisionResult>(s => s.makeDecisionAtom, s => s.makeDecisionAtom);

export default useMakeDecision;