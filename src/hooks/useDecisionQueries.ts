import {ConfigurationUninitialized} from "../types";
import {prepareAtomValueUsageWithSuspense} from "./AtomValueUsageHelper";
import {UseDecisionQueriesResult} from "../internal/jotai/domain/decisionQueries";

const useDecisionQueries: {
    /**
     * Gets commands to query the decisions of a Configuration.
     * @remarks Will suspend until the configuration is fully initialized.
     */
    (): UseDecisionQueriesResult;
    /**
     * Gets commands to query the decisions of a Configuration.
     * @param suspend Whether to disable the Suspense API.
     */
    (suspend: false): UseDecisionQueriesResult | ConfigurationUninitialized;
} = prepareAtomValueUsageWithSuspense<UseDecisionQueriesResult>(s => s.decisionQueriesAtom, s => s.decisionQueriesAtom);

export default useDecisionQueries;