import {Attribute, AttributeType, GlobalAttributeId} from "@viamedici-spc/configurator-ts";
import styled from "styled-components/macro";
import NumericAttribute from "./numeric/NumericAttribute";
import ChoiceAttribute from "./choice/ChoiceAttribute";
import BooleanAttribute from "./boolean/BooleanAttribute";
import {useAttributes} from "@viamedici-spc/configurator-react";
import {createContext, useContext} from "react";
import ComponentAttribute from "./component/ComponentAttribute";
import {attributeIdToString} from "../../common/Naming";

const Root = styled.div`
    display: grid;
    grid-template-columns: [label] 0.4fr [selection] 0.6fr;
    grid-template-rows: [label selection] auto;
`;

const Label = styled.label`
    grid-area: label;
    display: grid;
    grid-template-columns: [label] 0.4fr [selection] 0.6fr;
    grid-template-rows: [label selection] auto;
`;

const activeAttributeContext = createContext<GlobalAttributeId>(null);
export const useActiveAttribute = () => useContext(activeAttributeContext);

export default function AttributeItem({attributeId}: { attributeId: GlobalAttributeId }) {
    const [attribute] = useAttributes([attributeId], false);

    return (
        <Root>
            <Label>{attributeIdToString(attributeId)}</Label>
            <activeAttributeContext.Provider value={attributeId}>
                <AttributeTypeSelector attribute={attribute}/>
            </activeAttributeContext.Provider>
        </Root>
    )
}

function AttributeTypeSelector(props: { attribute: Attribute }) {
    switch (props.attribute?.type) {
        case AttributeType.Choice:
            return (<ChoiceAttribute/>);
        case AttributeType.Numeric:
            return (<NumericAttribute/>);
        case AttributeType.Boolean:
            return (<BooleanAttribute/>);
        case AttributeType.Component:
            return (<ComponentAttribute/>);
        case null:
        case undefined:
            return (<span>Attribute not found</span>);
        default:
            return (<span>Unknown attribute type</span>);
    }
}