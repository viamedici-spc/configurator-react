import {ConstraintsExplainAnswer, DecisionsExplainAnswer, ExplainQuestionSubject, ExplainQuestionType, FullExplainAnswer, WhyIsConfigurationNotSatisfied} from "@viamedici-spc/configurator-ts";
import {Selectors} from "../Selectors";
import {GuardedAtom} from "../../../types";
import atomWithGuard from "../helper/atomWithGuard";
import {match} from "ts-pattern";

export type UseConfigurationSatisfactionResult = {
    isSatisfied: boolean;
    explain: {
        (answerType: "decisions"): Promise<DecisionsExplainAnswer>;
        (answerType: "constraints"): Promise<ConstraintsExplainAnswer>;
        (answerType: "full"): Promise<FullExplainAnswer>;
    }
}

export function createConfigurationSatisfactionAtom(configurationSessionAtom: Selectors["guardedConfigurationSessionAtom"], isSatisfiedAtom: Selectors["guardedIsSatisfiedAtom"]): GuardedAtom<UseConfigurationSatisfactionResult> {
    const explainQuestion: WhyIsConfigurationNotSatisfied = {
        question: ExplainQuestionType.whyIsNotSatisfied,
        subject: ExplainQuestionSubject.configuration
    };
    return atomWithGuard((_, getGuarded) => {
        const session = getGuarded(configurationSessionAtom);
        const isSatisfied = getGuarded(isSatisfiedAtom);

        return {
            isSatisfied: isSatisfied,
            explain: (answerType: "decisions" | "constraints" | "full"): Promise<any> =>
                match(answerType)
                    .with("full", (a) => session.explain(explainQuestion, a))
                    .with("decisions", (a) => session.explain(explainQuestion, a))
                    .with("constraints", (a) => session.explain(explainQuestion, a))
                    .exhaustive()
        };
    });
}