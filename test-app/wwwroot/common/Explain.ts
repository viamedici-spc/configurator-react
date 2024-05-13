import {
    AttributeType,
    CausedByDecision,
    ConstraintExplanation,
    ConstraintsExplainAnswer,
    DecisionExplanation,
    DecisionsExplainAnswer,
    ExplainAnswer,
    ExplainSolution
} from "@viamedici-spc/configurator-ts";
import {attributeIdToString, constraintIdToString} from "./Naming";
import {handleError} from "./PromiseErrorHandling";

export function handleExplain(explain: () => Promise<ExplainAnswer>, applySolution: (solution: ExplainSolution) => Promise<void>) {
    return handleError(explain, r => processExplainAnswer(r, applySolution));
}

export async function processExplainAnswer(answer: ExplainAnswer, applySolution: (solution: ExplainSolution) => Promise<void>) {
    const decisionsExplainAnswer = answer as DecisionsExplainAnswer;
    const constraintsExplainAnswer = answer as ConstraintsExplainAnswer;

    const decisionExplanations = decisionsExplainAnswer != null ? mapDecisionExplanations(decisionsExplainAnswer) : null;
    const constraintExplanations = constraintsExplainAnswer != null ? mapConstraintExplanations(constraintsExplainAnswer) : null;

    const numberedExplanations = [decisionExplanations, constraintExplanations]
        .flat()
        .map((e, i) => ({
            ...e,
            number: i + 1
        }));
    const hasAnyExplanationASolution = numberedExplanations.find(e => e.solution) != null;
    const message = numberedExplanations
        .map(e => {
            const solutionText = e.solution ? "Has Solution" : "No Solution";

            return `Explanation ${e.number} -- ${solutionText}:\n${indent(e.text)}`;
        })
        .join("\n\n");

    while (true) {
        if (hasAnyExplanationASolution) {
            const messageWithActionRecommendation = message + "\n\nPlease enter the explanation number to apply the solution for:";
            const solutionToApply = prompt(messageWithActionRecommendation);
            if (solutionToApply != null) {
                const parsedSolutionToApply = parseInt(solutionToApply);
                if (Number.isNaN(parsedSolutionToApply)) {
                    alert("The entered explanation number is invalid.");
                    // Start over
                } else {
                    const explanation = numberedExplanations.find(e => e.number === parsedSolutionToApply);
                    if (explanation != null) {
                        if (explanation.solution != null) {
                            await handleError(() => applySolution(explanation.solution));
                            break;
                        } else {
                            alert("The entered explanation number has no solution.");
                            // Start over
                        }
                    } else {
                        alert("The entered explanation number is not assigned to an explanation.");
                        // Start over
                    }
                }
            } else {
                // Prompt was cancelled.
                break;
            }
        } else {
            // There are no solutions.
            alert(message);
            break;
        }
    }
}


type Explanation = {
    text: string,
    solution: ExplainSolution | null
}

function mapDecisionExplanations(answer: { decisionExplanations: ReadonlyArray<DecisionExplanation> }): Explanation[] {
    return answer.decisionExplanations
        .map(e => {
            const causingDecisions = e.causedByDecisions.map(d => xyz(d));
            const text = [
                "Decisions:",
                indent(causingDecisions.join("\n"))
            ]
                .join("\n");
            return {
                text: text,
                solution: e.solution
            } satisfies  Explanation;
        });
}

function xyz(cause: CausedByDecision) {
    switch (cause.type) {
        case AttributeType.Boolean:
        case AttributeType.Numeric:
        case AttributeType.Component:
            return `${attributeIdToString(cause.attributeId)}: ${cause.state}`;
        case AttributeType.Choice:
            return `${attributeIdToString(cause.attributeId)}.${cause.choiceValueId}:${cause.state}`;
        default:
            return null;
    }
}

function mapConstraintExplanations(answer: { constraintExplanations: ReadonlyArray<ConstraintExplanation>; }): Explanation[] {
    return answer.constraintExplanations
        .map(e => {
            const causingCardinalities = e.causedByCardinalities.map(attributeIdToString);
            const causingRules = e.causedByRules.map(constraintIdToString);

            const text = [
                causingCardinalities.length > 0 && [
                    "Cardinalities:",
                    indent(causingCardinalities.join("\n"))
                ],
                causingRules.length > 0 && [
                    "Rules:",
                    indent(causingRules.join("\n"))
                ]
            ]
                .filter(Boolean)
                .map(a => a.join("\n"))
                .join("\n\n");

            return {
                text: text,
                solution: null
            } satisfies  Explanation;
        });
}

function indent(str: string, indent: number = 2): string {
    const indentation = [...Array(indent)].map(() => ' ').join('');
    const lineEnding = '\n';

    return str
        .split(lineEnding)
        .map(s => indentation + s)
        .join(lineEnding);
}