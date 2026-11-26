import type {
    ChoiceAttribute, ChoiceValue,
    ExplicitChoiceDecision,
    ExplicitDecision} from "@viamedici-spc/configurator-ts";
import {
    AttributeType,
    DecisionKind
} from "@viamedici-spc/configurator-ts";
import type { OrdT} from "@viamedici-spc/fp-ts-extensions";
import {Ord, pipe, RA, RM} from "@viamedici-spc/fp-ts-extensions";

export function getChoiceAttributeResetDecisions(attribute: ChoiceAttribute): ReadonlyArray<ExplicitDecision> {
    return pipe(
        attribute.values,
        RM.values(Ord.trivial as OrdT<ChoiceValue>),
        RA.filter(cv => cv.decision?.kind === DecisionKind.Explicit),
        RA.map(v => ({
            type: AttributeType.Choice,
            attributeId: attribute.id,
            choiceValueId: v.id,
            state: null
        }) as ExplicitChoiceDecision)
    );
}