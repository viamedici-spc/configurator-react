import {
    CollectedDecision,
    CollectedExplicitDecision,
    CollectedImplicitDecision,
    DecisionKind
} from "@viamedici-spc/configurator-ts";
import {Selectors} from "../Selectors";
import {GuardedAtom} from "../../../types";
import atomWithGuard from "../helper/atomWithGuard";

export type UseDecisionQueriesResult = {
    getDecisions(kind: DecisionKind.Explicit): ReadonlyArray<CollectedExplicitDecision>;
    getDecisions(kind: DecisionKind.Explicit, queue: true): Promise<ReadonlyArray<CollectedExplicitDecision>>;
    getDecisions(kind: DecisionKind.Implicit): ReadonlyArray<CollectedImplicitDecision>;
    getDecisions(kind: DecisionKind.Implicit, queue: true): Promise<ReadonlyArray<CollectedImplicitDecision>>;
    getDecisions(): ReadonlyArray<CollectedDecision>;
    getDecisions(queue: true): Promise<ReadonlyArray<CollectedDecision>>;
};

export function createDecisionQueriesAtom(configurationSessionAtom: Selectors["guardedConfigurationSessionAtom"]): GuardedAtom<UseDecisionQueriesResult> {
    return atomWithGuard((_, getGuarded) => {
        const session = getGuarded(configurationSessionAtom);

        return {
            getDecisions: session.getDecisions.bind(session),
        };
    });
}