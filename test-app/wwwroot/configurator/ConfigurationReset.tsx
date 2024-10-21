import styled from "styled-components";
import {useJotaiAtoms} from "../../../src/atoms/useJotaiAtoms";
import {useAtomValue} from "jotai";
import {ConfigurationUninitialized} from "../../../src";
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
    const result = useAtomValue(getConfigurationResetAtom);

    const text = result === ConfigurationUninitialized ? "uninitialized" : (result.canReset ? "yes" : "no");
    const execute = () => {
        if (result !== ConfigurationUninitialized) {
            handleError(() => result.reset());
        }
    };
    const canReset = result === ConfigurationUninitialized ? ConfigurationUninitialized : result.canReset;

    return (
        <Root className={clsx(canReset === true && "canReset", canReset === false && "canNotReset")}>
            <span>canReset: {text} </span>
            {canReset === true && <button onClick={execute}>Reset</button>}
        </Root>
    );
}