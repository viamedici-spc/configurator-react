import styled from "styled-components/macro";
import {AvailableValuesIndicator, MandatoryIndicator, SelectionModeIndicator} from "./Indicators";
import ValueSelection from "./ValueSelection";
import {SatisfactionIndicator} from "../Indicators";
import DecisionClearing from "./DecisionClearing";

const Root = styled.div`
    grid-area: selection;
    display: grid;
    grid-template-rows: [value-selection] auto [gap] 0.2em [indicators] auto;
    grid-template-columns: [value-selection indicators] 1fr;
`;

const Indicators = styled.div`
    grid-area: indicators;
    font-size: 0.8em;
`;

export default function ChoiceAttribute() {
    return (
        <>
            <DecisionClearing/>
            <Root>
                <ValueSelection/>
                <Indicators>
                    <SatisfactionIndicator/>
                    <span> · </span>
                    <AvailableValuesIndicator/>
                    <span> · </span>
                    <MandatoryIndicator/>
                    <span> · </span>
                    <SelectionModeIndicator/>
                </Indicators>
            </Root>
        </>
    );
}