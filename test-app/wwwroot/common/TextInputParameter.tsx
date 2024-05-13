import {Dispatch, SetStateAction} from "react";
import styled from "styled-components/macro";

const Root = styled.div`
    display: grid;
    &:not(:last-child){
        margin-bottom: 1em;
    }
`;

const Label = styled.label`
    margin-bottom: 0.2em;
`;

export default function TextInputParameter(props: { label: string, state: [string, Dispatch<SetStateAction<string>>] }) {
    const [value, setValue] = props.state;

    return (
        <Root>
            <Label>
                {props.label}
            </Label>
            <input type="text" value={value} onChange={e => setValue(e.currentTarget.value)} required/>
        </Root>
    )
}