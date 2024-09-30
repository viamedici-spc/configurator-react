import {ConfigurationUninitialized} from "../types";
import {prepareAtomValueUsageWithSuspense} from "./AtomValueUsageHelper";
import {CollectedDecision, CollectedExplicitDecision, CollectedImplicitDecision, DecisionKind} from "@viamedici-spc/configurator-ts";
import {match, P} from "ts-pattern";
import {useMemo} from "react";

const useCollectedDecisions: {
    (): ReadonlyArray<CollectedDecision>;
    (suspend: false): ReadonlyArray<CollectedDecision> | ConfigurationUninitialized;
} = prepareAtomValueUsageWithSuspense<ReadonlyArray<CollectedDecision>>(s => s.guardedDecisionsAtom, s => s.decisionsAtom);
const useCollectedExplicitDecisions: {
    (): ReadonlyArray<CollectedExplicitDecision>;
    (suspend: false): ReadonlyArray<CollectedExplicitDecision> | ConfigurationUninitialized;
} = prepareAtomValueUsageWithSuspense<ReadonlyArray<CollectedExplicitDecision>>(s => s.guardedExplicitDecisionsAtom, s => s.explicitDecisionsAtom);
const useCollectedImplicitDecisions: {
    (): ReadonlyArray<CollectedImplicitDecision>;
    (suspend: false): ReadonlyArray<CollectedImplicitDecision> | ConfigurationUninitialized;
} = prepareAtomValueUsageWithSuspense<ReadonlyArray<CollectedImplicitDecision>>(s => s.guardedImplicitDecisionsAtom, s => s.implicitDecisionsAtom);

/**
 * Gets all implicit and explicit, non-optimistic decisions of the current Configuration.
 * @remarks Will suspend until the configuration is fully initialized.
 */
function useDecisions(): ReadonlyArray<CollectedDecision>;
/**
 * Gets all implicit and explicit, non-optimistic decisions of the current Configuration.
 * @param suspend Whether to disable the Suspense API.
 */
function useDecisions(suspend: false): ReadonlyArray<CollectedDecision> | ConfigurationUninitialized;
/**
 * Gets all explicit non-optimistic decisions of the current Configuration.
 * @param kind The kind of decisions that should be returned.
 * @remarks Will suspend until the configuration is fully initialized.
 */
function useDecisions(kind: DecisionKind.Explicit): ReadonlyArray<CollectedExplicitDecision>;
/**
 * Gets all explicit non-optimistic decisions of the current Configuration.
 * @param kind The kind of decisions that should be returned.
 * @param suspend Whether to disable the Suspense API.
 */
function useDecisions(kind: DecisionKind.Explicit, suspend: false): ReadonlyArray<CollectedExplicitDecision> | ConfigurationUninitialized;
/**
 * Gets all implicit non-optimistic decisions of the current Configuration.
 * @param kind The kind of decisions that should be returned.
 * @remarks Will suspend until the configuration is fully initialized.
 */
function useDecisions(kind: DecisionKind.Implicit): ReadonlyArray<CollectedImplicitDecision>;
/**
 * Gets all implicit non-optimistic decisions of the current Configuration.
 * @param kind The kind of decisions that should be returned.
 * @param suspend Whether to disable the Suspense API.
 */
function useDecisions(kind: DecisionKind.Implicit, suspend: false): ReadonlyArray<CollectedImplicitDecision> | ConfigurationUninitialized;
function useDecisions(kindOrSuspendOrUndefined?: DecisionKind | false, suspendOrUndefined?: false): (ReadonlyArray<CollectedDecision> | ReadonlyArray<CollectedExplicitDecision> | ReadonlyArray<CollectedImplicitDecision> | ConfigurationUninitialized) {
    const kind = typeof kindOrSuspendOrUndefined === "string" ? kindOrSuspendOrUndefined : undefined;
    const suspend = typeof kindOrSuspendOrUndefined === "boolean" ? kindOrSuspendOrUndefined : suspendOrUndefined;

    const fn = useMemo(() => match(kind)
        .returnType<typeof useCollectedDecisions | typeof useCollectedExplicitDecisions | typeof useCollectedImplicitDecisions>()
        .with(P.nullish, () => useCollectedDecisions)
        .with(DecisionKind.Explicit, () => useCollectedExplicitDecisions)
        .with(DecisionKind.Implicit, () => useCollectedImplicitDecisions)
        .exhaustive(), [kind]);

    if (suspend === false) {
        return fn(false);
    }
    return fn();
}

export default useDecisions;