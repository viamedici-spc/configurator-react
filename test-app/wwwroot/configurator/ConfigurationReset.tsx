import styled from "styled-components";
import {Suspense} from "react";
import {useJotaiAtoms} from "../../../src/atoms/useJotaiAtoms";
import {useAtomValue} from "jotai/react";
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

    // TODO: Andere Farben nehmen?
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
    const {getResetConfigurationAtom} = useJotaiAtoms();
    const result = useAtomValue(getResetConfigurationAtom);

    const text = result === ConfigurationUninitialized ? "uninitialized" : (result.canReset ? "yes" : "no");
    const execute = () => {
        if (result !== ConfigurationUninitialized) {
            handleError(() => result.reset());
        }
    };
    const canReset = result === ConfigurationUninitialized ? ConfigurationUninitialized : result.canReset;

    return (
        <Root className={clsx(canReset === true && "canReset", canReset === false && "canNotReset")}>
            <div>canReset: {text}</div>
            {canReset === true && <div>
                <button onClick={execute}>Reset</button>
            </div>}
        </Root>
    );
}