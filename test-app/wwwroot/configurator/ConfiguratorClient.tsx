import styled from "styled-components/macro";
import {Dispatch, SetStateAction, useState} from "react";
import {IConfiguratorClient} from "@viamedici-spc/configurator-ts";
import {createConfiguratorClient} from "../common/configuratorClient";
import TextInputParameter from "../common/TextInputParameter";

const Root = styled.div`
    grid-area: configurator-client;
    background-color: var(--color-base-1);
    padding: var(--size-card-padding);
    border-radius: var(--shape-card-border-radius);
    box-shadow: var(--shadow-card);
`

const Title = styled.h2`
    margin-top: 0;
`

type State<T> = [T, Dispatch<SetStateAction<T>>];

export default function ConfiguratorClient(props: { configuratorClientState: State<IConfiguratorClient>, shallHaveInitialClientState: State<boolean>, accessTokenState: State<string> }) {
    const [configuratorClient, setConfiguratorClient] = props.configuratorClientState;
    const [shallHaveInitialClient, setShallHaveInitialClient] = props.shallHaveInitialClientState;
    const [accessToken] = props.accessTokenState;

    const createOrRemoveClient = () => {
        setConfiguratorClient(c => c == null ? createConfiguratorClient(accessToken) : null);
    };

    const recreateClient = () => {
        setConfiguratorClient(createConfiguratorClient(accessToken));
    }

    const toggleShallHaveInitialClient = () => {
        setShallHaveInitialClient(b => !b);
    }

    return (
        <Root>
            <Title>Configurator Client</Title>
            <TextInputParameter label="AccessToken" state={props.accessTokenState}/>

            <label>
                Shall have initial client: {shallHaveInitialClient ? "Yes" : "No"}
            </label>
            {" "}
            <button onClick={toggleShallHaveInitialClient}>{shallHaveInitialClient ? "Set No" : "Set Yes"}</button>
            <div>
                <button onClick={createOrRemoveClient}>{configuratorClient != null ? "Remove" : "Create"}</button>
                <button onClick={recreateClient} disabled={configuratorClient == null}>Recreate</button>
            </div>
        </Root>
    )
}