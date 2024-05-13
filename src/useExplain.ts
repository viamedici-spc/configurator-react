import {useConfigurationSessionContext} from "./internal/contexts";
import {throwIfSessionIsNull} from "./internal/throwHelper";
import {useMemo} from "react";
import {
    ConstraintsExplainAnswer,
    DecisionsExplainAnswer, ExplainQuestion, ExplainQuestionParam, ExplainSolution,
    FullExplainAnswer
} from "@viamedici-spc/configurator-ts";
import {match} from "ts-pattern";

export type UseExplainResult = {
    explain(question: ExplainQuestionParam, answerType: "decisions"): Promise<DecisionsExplainAnswer>,
    explain(question: ExplainQuestionParam, answerType: "constraints"): Promise<ConstraintsExplainAnswer>,
    explain(question: ExplainQuestionParam, answerType: "full"): Promise<FullExplainAnswer>,
    applySolution(solution: ExplainSolution): Promise<void>,
};

/**
 * Gets commands for explaining consequences.
 * @throws If configuration is initializing.
 */
export default function useExplain(): UseExplainResult {
    const configurationSession = useConfigurationSessionContext();
    throwIfSessionIsNull(configurationSession);

    return useMemo(() => ({
        explain: (q: ExplainQuestion, a: "decisions" | "constraints" | "full"): Promise<any> => match(a)
            .with("decisions", a => configurationSession.explain(q, a))
            .with("constraints", a => configurationSession.explain(q, a))
            .with("full", a => configurationSession.explain(q, a))
            .exhaustive(),
        applySolution: (s) => configurationSession.applySolution(s)
    }) satisfies UseExplainResult, [configurationSession]);
}