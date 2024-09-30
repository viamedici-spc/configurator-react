import styled from "styled-components/macro";
import {Suspense, useState} from "react";
import {useStoredConfiguration} from "@viamedici-spc/configurator-react";

const Root = styled.div`
    grid-area: stored-configuration;
    background-color: var(--color-base-1);
    padding: var(--size-card-padding);
    border-radius: var(--shape-card-border-radius);
    box-shadow: var(--shadow-card);
`

const Title = styled.h2`
    margin-top: 0;
`
const List = styled.div`
    margin-top: 10px;
`

export default function StoredConfiguration() {
    const [showStoredConfiguration, setShowStoredConfiguration] = useState(true);
    return (
        <Root>
            <Title>Stored configuration</Title>
            <label>
                Show configuration: {showStoredConfiguration ? "showed" : "hidden"}
            </label>
            {" "}
            <button onClick={() => setShowStoredConfiguration(b => !b)}>{showStoredConfiguration ? "Hide" : "Show"}</button>
            <Suspense fallback={<span>Loading …</span>}>
                {showStoredConfiguration && <DecisionsList/>}
            </Suspense>
        </Root>
    );
}

function DecisionsList() {
    const decisions = useStoredConfiguration();

    return <List>
        <table>
            <thead>
            <tr>
                <th>Attribute</th>
                <th>State</th>
            </tr>
            </thead>
            <tbody>
            {
                decisions.explicitDecisions.map((decision) => (
                    <tr key={decision.attributeId.localId}>
                        <td>{decision.attributeId.localId}</td>
                        <td>{decision.state.toString()}</td>
                    </tr>
                ))
            }
            </tbody>
        </table>
    </List>;
}