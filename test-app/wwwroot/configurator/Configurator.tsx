import styled from "styled-components/macro";
import {Suspense, useMemo, useState} from "react";
import SessionContextParameters from "./SessionContextParameters";
import {Configuration} from "@viamedici-spc/configurator-react";
import {ConfigurationModelSourceType, ConfigurationModelFromChannel, SessionContext} from "@viamedici-spc/configurator-ts";
import * as config from "../config";
import ConfigurationParameters from "./ConfigurationParameters";
import ConfigurationReset from "./ConfigurationReset";
import {InitializationError, UpdateError} from "./ErrorIndicator";
import ConfigurationSatisfactionIndicator from "./ConfigurationSatisfactionIndicator";
import Attributes from "./attributes/Attributes";
import ConfigurationStoring from "./ConfigurationStoring";
import Decisions from "./Decisions";
import StoredConfiguration from "./StoredConfiguration";

const Root = styled.div`
    max-width: 1500px;
    flex-grow: 1;
    display: grid;
    gap: 1.5em;
    grid-template-rows: [header] auto [session-context-parameters main-start decisions-start] auto [configuration-parameters] auto [model-satisfaction] auto [configuration-reset] auto [configuration-storing] auto 1fr [main-end decisions-end];
    grid-template-columns: [header-start session-context-parameters configuration-parameters model-satisfaction configuration-reset configuration-storing] 350px [gap] 0 [main] 1fr [decisions] 300px [header-end];
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
const SubGrid = styled.div`
    grid-area: decisions;
    display: grid;
    margin: 0 0 1.5em;
    padding: 0;
    gap: 1.5em;
    grid-template-rows: [decisions] auto [stored-configuration] auto;
    grid-template-columns: [decisions stored-configuration] 1fr;
`

export default function Configurator() {
    const loadConfigurationState = useState(true);
    const passNullAsSessionContextState = useState(false);
    const [loadConfiguration] = loadConfigurationState;
    const [passNullAsSessionContext] = passNullAsSessionContextState;
    const accessTokenState = useState(config.hcaEngineAccessToken);
    const deploymentNameState = useState(config.configurationModelPackage.deploymentName);
    const channelState = useState(config.configurationModelPackage.channel);
    const [accessToken] = accessTokenState;
    const [deploymentName] = deploymentNameState;
    const [channel] = channelState;
    const sessionContext = useMemo(() => ({
        apiBaseUrl: config.hcaEngineEndpoint,
        sessionInitialisationOptions: {
            accessToken: accessToken,
        },
        configurationModelSource: {
            type: ConfigurationModelSourceType.Channel,
            deploymentName: deploymentName,
            channel: channel
        } as ConfigurationModelFromChannel,
    } satisfies SessionContext), [channel, deploymentName, accessToken]);

    return (
        <Root>
            <Header>
                <h1>Test Configurator</h1>
            </Header>

            <SessionContextParameters accessTokenState={accessTokenState} deploymentNameState={deploymentNameState} channelState={channelState}/>
            <ConfigurationParameters loadConfigurationState={loadConfigurationState} passNullAsSessionContextState={passNullAsSessionContextState}/>

            {
                loadConfiguration
                && <Configuration sessionContext={passNullAsSessionContext ? null : sessionContext}>
                    <ConfigurationSatisfactionIndicator/>
                    <ConfigurationReset/>
                    <ConfigurationStoring/>

                    <Main>
                        <InitializationError/>

                        <Suspense fallback={<span>Configuration loading …</span>}>
                            <UpdateError/>
                            <Attributes/>
                        </Suspense>
                    </Main>
                    <SubGrid>
                        <Decisions/>
                        <StoredConfiguration/>
                    </SubGrid>
                </Configuration>
            }
        </Root>
    )
}