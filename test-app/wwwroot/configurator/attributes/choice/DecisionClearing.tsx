import styled from "styled-components/macro";
import {useActiveAttribute} from "../AttributeItem";
import {useChoiceAttribute} from "@viamedici-spc/configurator-react";
import {handleError} from "../../../common/PromiseErrorHandling";
import {DecisionKind} from "@viamedici-spc/configurator-ts";

const Root = styled.div`
    grid-area: label;
    display: flex;
    justify-content: end;
    align-self: start;
`;

export default function DecisionClearing() {
    const activeAttribute = useActiveAttribute();
    const {attribute, clearDecisions} = useChoiceAttribute(activeAttribute);

    if (attribute.values.filter(v => v.decision?.kind === DecisionKind.Explicit).length <= 1) {
        return;
    }

    const onClick = async () => {
        await handleError(() => clearDecisions());
    };

    return (
        <Root>
            <button onClick={onClick}>Clear decisions</button>
        </Root>
    );
}