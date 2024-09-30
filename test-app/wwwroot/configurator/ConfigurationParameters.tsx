import TextInputParameter from "../common/TextInputParameter";
import styled from "styled-components/macro";
import {Dispatch, FormEvent, SetStateAction, useEffect, useState} from "react";

const Root = styled.div`
    grid-area: configuration-parameters;
    background-color: var(--color-base-1);
    padding: var(--size-card-padding);
    border-radius: var(--shape-card-border-radius);
    box-shadow: var(--shadow-card);
`

const Title = styled.h2`
    margin-top: 0;
`


export default function ConfigurationParameters(props: { loadConfigurationState: ReturnType<typeof useState<boolean>>, passNullAsSessionContextState: ReturnType<typeof useState<boolean>> }) {
    const [loadConfiguration, setLoadConfiguration] = props.loadConfigurationState;
    const [passNullAsSessionContext, setPassNullAsSessionContext] = props.passNullAsSessionContextState;

    return (
        <Root>
            <Title>Configuration</Title>
            <label>
                Configuration: {loadConfiguration ? "Loaded" : "Unloaded"}
            </label>
            {" "}
            <button onClick={() => setLoadConfiguration(b => !b)}>{loadConfiguration ? "Unload" : "Load"}</button>
            <label>
                SessionContext: {passNullAsSessionContext ? "Passing null" : "Passing object"}
            </label>
            {" "}
            <button onClick={() => setPassNullAsSessionContext(b => !b)}>{passNullAsSessionContext ? "Pass object" : "Pass null"}</button>
        </Root>
    );
}