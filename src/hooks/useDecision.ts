import {UseDecisionResult} from "../internal/jotai/domain/useDecision";
import {ConfigurationUninitialized} from "../types";
import {prepareAtomValueUsageWithSuspense} from "./AtomValueUsageHelper";

/**
 * Gets commands for making one or many decisions.
 * @throws If configuration is initializing.
 */
const useDecision: {
    (): UseDecisionResult;
    (suspend: false): UseDecisionResult | ConfigurationUninitialized;
} = prepareAtomValueUsageWithSuspense<UseDecisionResult>(s => s.useDecisionAtom, s => s.useDecisionAtom);

export default useDecision;