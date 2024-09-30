import styled from "styled-components";
import {Suspense} from "react";
import {useJotaiAtoms} from "../../../src/atoms/useJotaiAtoms";
import {useAtomValue} from "jotai/react";
import {ConfigurationUninitialized} from "../../../src";
import clsx from "clsx";
import {handleError} from "../common/PromiseErrorHandling";

const Root = styled.div`
    grid-area: configuration-storing;
    background-color: var(--color-base-1);
    padding: var(--size-card-padding);
    border-radius: var(--shape-card-border-radius);
    font-weight: bolder;
    box-shadow: var(--shadow-card);
`

export default function ConfigurationStoring() {
    const {getConfigurationStoringAtom} = useJotaiAtoms();
    const result = useAtomValue(getConfigurationStoringAtom);

    const store = () => {
        if (result !== ConfigurationUninitialized) {
            handleError(async () => {
                const storedConfiguration = await result.storeConfiguration();
                await navigator.clipboard.writeText(JSON.stringify(storedConfiguration));
            });
        }
    };
    const restore = () => {
        if (result !== ConfigurationUninitialized) {
            handleError(async () => {
                const text = await navigator.clipboard.readText();
                await result.restoreConfiguration(JSON.parse(text));
            })
        }
    };

    return (
        <Root>
            <div>Store configuration: {result === ConfigurationUninitialized ? "uninitialized" : <button onClick={store}>Store</button>}</div>
            <div>Restore configuration: {result === ConfigurationUninitialized ? "uninitialized" : <button onClick={restore}>Restore</button>}</div>
        </Root>
    );
}