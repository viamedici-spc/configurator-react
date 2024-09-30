import styled from "styled-components/macro";
import {useState} from "react";
import {useActiveAttribute} from "../AttributeItem";
import {useNumericAttribute} from "@viamedici-spc/configurator-react";
import {handleDecisionResponse} from "../../../common/PromiseErrorHandling";
import {ExplainQuestionType} from "@viamedici-spc/configurator-ts";
import {attributeIdToString} from "../../../common/Naming";
import {handleExplain} from "../../../common/Explain";

const Root = styled.input`
    grid-area: value-selection;
`;

export default function ValueSelection() {
    const activeAttribute = useActiveAttribute();
    const {attribute, makeDecision, explain, applySolution} = useNumericAttribute(activeAttribute);
    const [pendingValue, setPendingValue] = useState<number>(null);

    const onChange = (value: string) => {
        setPendingValue(value === "" ? undefined : parseFloat(value));
    };

    const applyPendingValue = async () => {
        if (pendingValue === null) {
            return;
        }

        const precision = Math.pow(10, attribute.decimalPlaces);
        const round = (value: number) => Math.round((value + Number.EPSILON) * precision) / precision;
        const value = pendingValue !== undefined ? round(pendingValue) : pendingValue;

        setPendingValue(null);
        console.info("Make decision for %s: %s", attributeIdToString(attribute.id), value !== undefined ? value.toString() : "Undefined");

        await handleDecisionResponse(() => makeDecision(value), e => {
            if (e.type === "SetDecisionConflict") {
                return () => handleExplain(() => explain({question: ExplainQuestionType.whyIsStateNotPossible, state: value}, "full"), applySolution);
            }

            return null;
        });
    };

    return (
        <Root type="number"
              step={Math.pow(0.1, attribute.decimalPlaces)}
              min={attribute.range.min}
              max={attribute.range.max}
              value={pendingValue !== null ? pendingValue ?? "" : attribute.decision?.state ?? ""}
              onChange={e => onChange(e.currentTarget.value)}
              onBlur={() => applyPendingValue()}
              onKeyDownCapture={async e => {
                  if (e.key === "Enter") {
                      await applyPendingValue();
                  }
              }}/>
    )
}