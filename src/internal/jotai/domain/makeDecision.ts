import {
    ExplicitDecision,
    MakeManyDecisionsMode, MakeManyDecisionsResult
} from "@viamedici-spc/configurator-ts";
import {Selectors} from "../Selectors";
import {GuardedAtom} from "../../../types";
import atomWithGuard from "../helper/atomWithGuard";

export type UseMakeDecisionResult = {
    makeDecision: (decision: ExplicitDecision) => Promise<void>;
    makeManyDecisions: (decisions: ReadonlyArray<ExplicitDecision>, mode: MakeManyDecisionsMode) => Promise<MakeManyDecisionsResult>;
};

export function createMakeDecisionAtom(configurationSessionAtom: Selectors["guardedConfigurationSessionAtom"]): GuardedAtom<UseMakeDecisionResult> {
    return atomWithGuard((_, getGuarded) => {
        const session = getGuarded(configurationSessionAtom);

        return {
            makeDecision: session.makeDecision.bind(session),
            makeManyDecisions: session.makeManyDecisions.bind(session),
        };
    });
}