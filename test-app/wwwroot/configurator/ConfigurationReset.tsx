import styled from "styled-components";
import {useJotaiAtoms} from "@viamedici-spc/configurator-react";
import {useAtomValue} from "jotai";
import {ConfigurationUninitialized, isConfigurationInitialized, UseConfigurationResetResult, useConfiguratorStore} from "../../../src";
import clsx from "clsx";
import {handleError} from "../common/PromiseErrorHandling";

const Root = styled.div`
    grid-area: configuration-reset;
    background-color: var(--color-base-1);
    padding: var(--size-card-padding);
    border-radius: var(--shape-card-border-radius);
    font-weight: bolder;
    box-shadow: var(--shadow-card);

    &.canNotReset {
        background-color: var(--color-satisfied-bg);
        color: var(--color-satisfied);
    }

    &.canReset {
        background-color: var(--color-unsatisfied-bg);
        color: var(--color-unsatisfied);
    }
`

export default function ConfigurationReset() {
    const {getConfigurationResetAtom} = useJotaiAtoms();
    const result = useAtomValue(getConfigurationResetAtom, {store: useConfiguratorStore()});

    const text = result === ConfigurationUninitialized ? "uninitialized" : (result.canResetConfiguration ? "yes" : "no");
    const execute = () => {
        if (isConfigurationInitialized(result)) {
            handleError(() => result.resetConfiguration());
        }
    };
    const canReset = result === ConfigurationUninitialized ? ConfigurationUninitialized : result.canResetConfiguration;

    return (
        <Root className={clsx(canReset === true && "canReset", canReset === false && "canNotReset")}>
            <span>canReset: {text} </span>
            {canReset === true && <button onClick={execute}>Reset</button>}
        </Root>
    );
}