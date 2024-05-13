import Attributes from "./attributes/Attributes";
import styled from "styled-components/macro";
import ConfigurationSatisfactionIndicator from "./ConfigurationSatisfactionIndicator";
import {Suspense, useEffect, useMemo, useState} from "react";
import Parameters from "./Parameters";
import {InitializationError, UpdateError} from "./ErrorIndicator";
import {Configuration, ConfigurationSuspender} from "@viamedici-spc/configurator-react";
import {ConfigurationModelSourceType, IConfiguratorClient, ConfigurationModelFromChannel} from "@viamedici-spc/configurator-ts";
import ConfiguratorClient from "./ConfiguratorClient";
import {createConfiguratorClient} from "../common/configuratorClient";
import * as config from "../config";

const Root = styled.div`
    max-width: 1250px;
    flex-grow: 1;
    display: grid;
    gap: 1.5em;
    grid-template-rows: [header] auto [configurator-client main-start] auto [parameters] auto [model-satisfaction] auto 1fr [main-end];
    grid-template-columns: [header-start configurator-client parameters model-satisfaction] 300px [gap] 0 [main] 1fr [header-end];
`;

const Header = styled.div`
    padding-left: var(--size-card-padding);
    display: grid;
    grid-area: header;
    grid-template-columns: [title] 1fr [close-session] auto;
`;

const Main = styled.div`
    grid-area: main;
    display: grid;
    grid-template-rows:[error-indicator] auto [attributes] 1fr [gap] 1.5em [state-viewer] auto;
    grid-template-columns: [error-indicator attributes state-viewer] 1fr;
`

const getShallHaveInitialClient = () => {
    return localStorage.getItem("ShallHaveInitialClient") === "True";
}

const setShallHaveInitialClient = (value: boolean) => {
    localStorage.setItem("ShallHaveInitialClient", value ? "True" : "False");
}

export default function Configurator() {
    const shallHaveInitialClientState = useState(getShallHaveInitialClient());
    const accessTokenState = useState(config.hcaEngineAccessToken);
    const deploymentNameState = useState(config.configurationModelPackage.deploymentName);
    const channelState = useState(config.configurationModelPackage.channel);
    const [shallHaveInitialClient] = shallHaveInitialClientState;
    const [accessToken] = accessTokenState;
    const configuratorClientState = useState<IConfiguratorClient>(shallHaveInitialClient ? createConfiguratorClient(accessToken) : null);
    const [configuratorClient] = configuratorClientState;
    const [deploymentName] = deploymentNameState;
    const [channel] = channelState;
    const configurationModelSource = useMemo(() => ({
        type: ConfigurationModelSourceType.Channel,
        deploymentName: deploymentName,
        channel: channel
    } as ConfigurationModelFromChannel), [channel, deploymentName]);

    useEffect(() => {
        setShallHaveInitialClient(shallHaveInitialClient);
    }, [shallHaveInitialClient]);

    return (
        <Root>
            <Header>
                <h1>Simple Configurator</h1>
            </Header>

            <ConfiguratorClient configuratorClientState={configuratorClientState}
                                shallHaveInitialClientState={shallHaveInitialClientState}
                                accessTokenState={accessTokenState}/>
            <Parameters deploymentNameState={deploymentNameState} channelState={channelState}/>

            <Configuration configuratorClient={configuratorClient}
                           configurationModelSource={configurationModelSource}>

                <ConfigurationSatisfactionIndicator/>

                <Main>
                    <InitializationError/>

                    <Suspense fallback={<span>Configuration loading …</span>}>
                        <UpdateError/>

                        <ConfigurationSuspender>
                            <Attributes/>
                        </ConfigurationSuspender>
                    </Suspense>
                </Main>

            </Configuration>
        </Root>
    )
}