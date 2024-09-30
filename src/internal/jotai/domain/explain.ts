import {
    ConstraintsExplainAnswer,
    DecisionsExplainAnswer, ExplainQuestionParam, ExplainSolution,
    FullExplainAnswer, MakeManyDecisionsResult
} from "@viamedici-spc/configurator-ts";
import {Selectors} from "../Selectors";
import {GuardedAtom} from "../../../types";
import atomWithGuard from "../helper/atomWithGuard";

export type UseExplainResult = {
    explain(question: ExplainQuestionParam, answerType: "decisions"): Promise<DecisionsExplainAnswer>,
    explain(question: ExplainQuestionParam, answerType: "constraints"): Promise<ConstraintsExplainAnswer>,
    explain(question: ExplainQuestionParam, answerType: "full"): Promise<FullExplainAnswer>,
    applySolution(solution: ExplainSolution): Promise<MakeManyDecisionsResult>,
};

export function createExplainAtom(configurationSessionAtom: Selectors["guardedConfigurationSessionAtom"]): GuardedAtom<UseExplainResult> {
    return atomWithGuard((_, getGuarded) => {
        const session = getGuarded(configurationSessionAtom);

        return {
            explain: session.explain.bind(session),
            applySolution: session.applySolution.bind(session),
        };
    });
}