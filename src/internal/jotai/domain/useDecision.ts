import {ExplicitDecision, SetManyMode, SetManyResult} from "@viamedici-spc/configurator-ts";
import {Selectors} from "../Selectors";
import {GuardedAtom} from "../../../types";
import atomWithGuard from "../helper/atomWithGuard";

export type UseDecisionResult = {
    makeDecision: (decision: ExplicitDecision) => Promise<void>,
    setManyDecision: (decisions: ReadonlyArray<ExplicitDecision>, mode: SetManyMode) => Promise<SetManyResult>
};

export function createUseDecisionHookAtom(configurationSessionAtom: Selectors["guardedConfigurationSessionAtom"]): GuardedAtom<UseDecisionResult> {
    return atomWithGuard((_, getGuarded) => {
        const session = getGuarded(configurationSessionAtom);

        return {
            makeDecision: session.makeDecision.bind(session),
            setManyDecision: session.setMany.bind(session),
        };
    });
}