import {useActiveAttribute} from "../AttributeItem";
import {useComponentAttribute} from "@viamedici-spc/configurator-react";
import {AttributeInterpreter, ComponentDecisionState, DecisionKind, ExplainQuestionType} from "@viamedici-spc/configurator-ts";
import {handleDecisionResponse} from "../../../common/PromiseErrorHandling";
import {attributeIdToString} from "../../../common/Naming";
import CommonValueSelection, {Value} from "../CommonValueSelection";
import {handleExplain} from "../../../common/Explain";

/*
    Value id for "nothing selected"-option resp. reset-option
 */
const nothingValueId = "<nothing>";
const includedValueId = "included";
const excludedValueId = "excluded";

export default function ValueSelection() {
    const activeAttribute = useActiveAttribute();
    const {attribute, makeDecision, explain, applySolution} = useComponentAttribute(activeAttribute);

    const onChange = async (valueId: string) => {
        if (valueId === nothingValueId) {
            if (attribute.decision?.kind === DecisionKind.Explicit) {
                console.info("Reset decision for %s", attributeIdToString(attribute.id));
                await handleDecisionResponse(() => makeDecision(null));
            }
        } else {
            const state = valueId === includedValueId ? ComponentDecisionState.Included : ComponentDecisionState.Excluded;

            if (AttributeInterpreter.isComponentStatePossible(attribute, state)) {
                console.info("Make decision for %s: %s", attributeIdToString(attribute.id), state.toString());

                await handleDecisionResponse(() => makeDecision(state));
            } else {
                console.info("Explain blocked value for %s: %s", attributeIdToString(attribute.id), state.toString());

                handleExplain(() => explain({question: ExplainQuestionType.whyIsStateNotPossible, state: state}, "full"), applySolution);
            }
        }
    };

    const selectedValue = attribute.decision?.state === ComponentDecisionState.Included
        ? includedValueId
        : attribute.decision?.state === ComponentDecisionState.Excluded
            ? excludedValueId
            : nothingValueId;

    const isIncludedStatePossible = AttributeInterpreter.isComponentStatePossible(attribute, ComponentDecisionState.Included);
    const isExcludedStatePossible = AttributeInterpreter.isComponentStatePossible(attribute, ComponentDecisionState.Excluded);

    const excludedValue: Value<string> = {
        id: excludedValueId,
        name: "excluded",
        isImplicit: attribute.decision?.state === ComponentDecisionState.Excluded && attribute.decision?.kind === DecisionKind.Implicit
    };
    const includedValue: Value<string> = {
        id: includedValueId,
        name: "included",
        isImplicit: attribute.decision?.state === ComponentDecisionState.Included && attribute.decision?.kind === DecisionKind.Implicit
    };
    const allowedValues = [
        isExcludedStatePossible && excludedValue,
        isIncludedStatePossible && includedValue
    ];
    const blockedValues = [
        (!isExcludedStatePossible) && excludedValue,
        (!isIncludedStatePossible) && includedValue
    ];

    return (
        <CommonValueSelection
            nothingValue={{id: nothingValueId, name: selectedValue !== nothingValueId ? "Reset" : ""}}
            allowedValues={allowedValues}
            blockedValues={blockedValues}
            isMultiselect={false}
            selectedValues={selectedValue}
            onChange={onChange}
        />
    );
}