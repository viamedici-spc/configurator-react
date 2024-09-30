import styled from "styled-components/macro";
import {Suspense, useState} from "react";
import {useDecisionQueries, useDecisions} from "@viamedici-spc/configurator-react";

const Root = styled.div`
    grid-area: decisions;
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

export default function Decisions() {
    const [showDecisions, setShowDecisions] = useState(true);
    return (
        <Root>
            <Title>Decisions</Title>
            <label>
                Show decisions: {showDecisions ? "showed" : "hidden"}
            </label>
            {" "}
            <button onClick={() => setShowDecisions(b => !b)}>{showDecisions ? "Hide" : "Show"}</button>
            <Suspense fallback={<span>Loading …</span>}>
                {showDecisions && <DecisionsList/>}
            </Suspense>
        </Root>
    );
}

function DecisionsList() {
    const decisions = useDecisions();

    return <List>
        <table>
            <thead>
            <tr>
                <th>Attribute</th>
                <th>Kind</th>
                <th>State</th>
            </tr>
            </thead>
            <tbody>
            {
                decisions.map((decision) => (
                    <tr key={decision.attributeKey}>
                        <td>{decision.attributeId.localId}</td>
                        <td>{decision.kind}</td>
                        <td>{decision.state.toString()}</td>
                    </tr>
                ))
            }
            </tbody>
        </table>
    </List>;
}