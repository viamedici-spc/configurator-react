import styled from "styled-components/macro";
import {useConfigurationInitialization, useConfigurationUpdating} from "@viamedici-spc/configurator-react";

const Root = styled.div`
  grid-area: error-indicator;
  color: hsl(0, 0%, 91%);
  background-color: var(--color-error);
  padding: var(--size-card-padding);
  border-radius: var(--shape-card-border-radius);
  margin-bottom: 1.5em;
  box-shadow: var(--shadow-card);
`;

const Title = styled.h2`
  margin-top: 0;
`;

export function InitializationError() {
    const {error} = useConfigurationInitialization();

    if (!error) {
        return null;
    }

    return (
        <Root>
            <Title>
                Initialization error
            </Title>
            <p>
                Error type: {JSON.stringify(error.type)}
            </p>
            <button onClick={error.retry}>Retry</button>
        </Root>
    )
}

export function UpdateError() {
    const {error} = useConfigurationUpdating();

    if (!error) {
        return null;
    }

    return (
        <Root>
            <Title>
                Update error
            </Title>
            <p>
                Error type: {JSON.stringify(error.type)}
            </p>
            <button onClick={error.retry}>Retry</button>
        </Root>
    )
}