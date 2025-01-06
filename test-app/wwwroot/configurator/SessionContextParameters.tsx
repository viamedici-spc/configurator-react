import TextInputParameter from "../common/TextInputParameter";
import styled from "styled-components/macro";
import {Dispatch, FormEvent, SetStateAction, useState} from "react";

const Root = styled.form`
    grid-area: session-context-parameters;
    background-color: var(--color-base-1);
    padding: var(--size-card-padding);
    border-radius: var(--shape-card-border-radius);
    box-shadow: var(--shadow-card);
`

const Title = styled.h2`
    margin-top: 0;
`

type State = [string, Dispatch<SetStateAction<string>>];

export default function SessionContextParameters(props: { accessTokenState: State, deploymentNameState: State, channelState: State }) {
    const accessTokenState = useState(props.accessTokenState[0]);
    const deploymentNameState = useState(props.deploymentNameState[0]);
    const channelState = useState(props.channelState[0]);

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();

        props.accessTokenState[1](accessTokenState[0]);
        props.deploymentNameState[1](deploymentNameState[0]);
        props.channelState[1](channelState[0]);
    }

    return (
        <Root onSubmit={onSubmit}>
            <Title>Parameters</Title>
            <TextInputParameter label="AccessToken" state={accessTokenState}/>
            <TextInputParameter label="DeploymentName" state={deploymentNameState}/>
            <TextInputParameter label="Channel" state={channelState}/>

            <button type="submit">Apply</button>
        </Root>
    )
}