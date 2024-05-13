import styled from "styled-components/macro";
import {useActiveAttribute} from "../AttributeItem";
import {useComponentAttribute} from "@viamedici-spc/configurator-react";
import {handleError} from "../../../common/PromiseErrorHandling";

const Root = styled.div`
    grid-area: label;
    display: flex;
    justify-content: end;
    align-self: start;
`;

export default function TreeClearing() {
    const activeAttribute = useActiveAttribute();
    const {clearSubtree} = useComponentAttribute(activeAttribute);

    const onClick = async () => {
        await handleError(() => clearSubtree());
    };

    return (
        <Root>
            <button onClick={onClick}>Clear Subtree</button>
        </Root>
    );
}