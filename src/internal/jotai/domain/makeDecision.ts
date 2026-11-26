import type {ExplicitDecision, MakeManyDecisionsMode, MakeManyDecisionsResult} from "@viamedici-spc/configurator-ts";
import type {Selectors} from "../Selectors";
import type {GuardedAtom} from "../../../types";
import atomWithGuard from "../helper/atomWithGuard";

export type UseMakeDecisionResult = {
    readonly makeDecision: (decision: ExplicitDecision) => Promise<void>;
    readonly makeManyDecisions: (
        decisions: ReadonlyArray<ExplicitDecision>,
        mode: MakeManyDecisionsMode,
    ) => Promise<MakeManyDecisionsResult>;
};

export function createMakeDecisionAtom(
    configurationSessionAtom: Selectors["guardedConfigurationSessionAtom"],
): GuardedAtom<UseMakeDecisionResult> {
    return atomWithGuard((_, getGuarded) => {
        const session = getGuarded(configurationSessionAtom);

        return {
            makeDecision: session.makeDecision.bind(session),
            makeManyDecisions: session.makeManyDecisions.bind(session),
        };
    });
}