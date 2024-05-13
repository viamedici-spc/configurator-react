import styled from "styled-components/macro";
import {useConfiguration, useConfigurationInitialization, useExplain} from "@viamedici-spc/configurator-react";
import {handleExplain} from "../common/Explain";

const Root = styled.div`
    grid-area: model-satisfaction;
    background-color: var(--color-unsatisfied-bg);
    color: var(--color-unsatisfied);
    padding: var(--size-card-padding);
    border-radius: var(--shape-card-border-radius);
    font-weight: bolder;
    box-shadow: var(--shadow-card);

    &.satisfied {
        background-color: var(--color-satisfied-bg);
        color: var(--color-satisfied);
    }
`

export default function ConfigurationSatisfactionIndicator() {
    const {isInitializing} = useConfigurationInitialization();

    if (isInitializing) {
        return null;
    }

    return <Indicator/>
}

function Indicator() {
    const {configuration} = useConfiguration();
    const {explain, applySolution} = useExplain();
    const isSatisfied = configuration.isSatisfied;

    const onExplain = () => {
        handleExplain(() => explain(b => b.whyIsNotSatisfied.configuration, "full"), applySolution);
    };

    return (
        <Root className={isSatisfied && "satisfied"}>
            <div>{isSatisfied ? "Configuration satisfied" : "Configuration unsatisfied"}</div>
            {!isSatisfied && <div>
                <button onClick={onExplain}>Explain</button>
            </div>}
        </Root>
    )
}