import styled from "styled-components";
import {useJotaiAtoms} from "@viamedici-spc/configurator-react";
import {useAtomValue} from "jotai";
import {ConfigurationUninitialized, useConfiguratorStore} from "@viamedici-spc/configurator-react";
import {handleError} from "../common/PromiseErrorHandling";
import {isConfigurationInitialized, UseConfigurationStoringResult} from "../../../src";

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
    const result = useAtomValue(getConfigurationStoringAtom, {store: useConfiguratorStore()});

    const store = () => {
        if (isConfigurationInitialized(result)) {
            handleError(async () => {
                const storedConfiguration = await result.storeConfiguration();
                await navigator.clipboard.writeText(JSON.stringify(storedConfiguration));
            });
        }
    };
    const restore = () => {
        if (isConfigurationInitialized(result)) {
            handleError(async () => {
                const text = await navigator.clipboard.readText();
                await result.restoreConfiguration(JSON.parse(text), {type: "DropExistingDecisions", conflictHandling: {type: "Automatic"}});
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