import {CollectedDecision, CollectedExplicitDecision, CollectedImplicitDecision, DecisionKind, ExplicitDecision, SetManyMode, SetManyResult} from "@viamedici-spc/configurator-ts";
import {Selectors} from "../Selectors";
import {GuardedAtom} from "../../../types";
import atomWithGuard from "../helper/atomWithGuard";

export type UseDecisionResult = {
    makeDecision: (decision: ExplicitDecision) => Promise<void>;
    setManyDecision: (decisions: ReadonlyArray<ExplicitDecision>, mode: SetManyMode) => Promise<SetManyResult>;
    getDecisions(kind: DecisionKind.Explicit): ReadonlyArray<CollectedExplicitDecision>;
    getDecisions(kind: DecisionKind.Implicit): ReadonlyArray<CollectedImplicitDecision>;
    getDecisions(): ReadonlyArray<CollectedDecision>;
};

export function createDecisionAtom(configurationSessionAtom: Selectors["guardedConfigurationSessionAtom"]): GuardedAtom<UseDecisionResult> {
    return atomWithGuard((_, getGuarded) => {
        const session = getGuarded(configurationSessionAtom);

        return {
            makeDecision: session.makeDecision.bind(session),
            setManyDecision: session.setMany.bind(session),
            getDecisions: session.getDecisions.bind(session),
        };
    });
}