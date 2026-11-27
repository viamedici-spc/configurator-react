import type {PropsWithChildren} from "react";
import {useMemo} from "react";
import type {SessionContext} from "@viamedici-spc/configurator-ts";
import {AtomsContext, StoreContext, useConfiguratorStore} from "./internal/contexts";
import EffectLoader from "./internal/EffectLoader";
import {createAtoms} from "./internal/jotai/Atoms";
import {Provider} from "jotai";
import type {createStore} from "jotai";
import SessionManagementInitializer from "./internal/SessionManagementInitializer";

export type ConfigurationProps = {
    /**
     * The SessionContext that should be used to create the session. A changed SessionContext is applied to the existing
     * session, which migrates its decisions (`IConfigurationSession.setSessionContext` of configurator-ts).
     * @remarks A change to the SessionContext is detected using referential equality. Consider using {@link useMemo}
     * or {@link useRef} to keep the SessionContext unchanged during rendering.
     */
    readonly sessionContext: SessionContext;
    /**
     * The Jotai store that holds the library's atoms.
     *
     * @remarks `Configuration` provides the store to its children through a Jotai `Provider`, so the application's own
     * atoms inside a `Configuration` live in it. Pass the application's store to share one.
     * @defaultValue the store of an enclosing `Configuration`, otherwise Jotai's default store (`getDefaultStore()`)
     */
    readonly jotaiStore?: ReturnType<typeof createStore>;
};

export default function Configuration(props: PropsWithChildren<ConfigurationProps>) {
    const atoms = useMemo(() => createAtoms(), []);

    return (
        <>
            <AtomsContext.Provider value={atoms}>
                <ConfiguratorStoreProvider jotaiStore={props.jotaiStore}>
                    <JotaiStoreProvider>
                        <SessionManagementInitializer sessionContext={props.sessionContext} />
                        <EffectLoader />
                        {props.children}
                    </JotaiStoreProvider>
                </ConfiguratorStoreProvider>
            </AtomsContext.Provider>
        </>
    );
}

function ConfiguratorStoreProvider(props: PropsWithChildren<{jotaiStore: ReturnType<typeof createStore> | undefined}>) {
    return props.jotaiStore ? (
        <StoreContext.Provider value={props.jotaiStore}>{props.children}</StoreContext.Provider>
    ) : (
        <>{props.children}</>
    );
}

function JotaiStoreProvider(props: PropsWithChildren<{}>) {
    const store = useConfiguratorStore();

    return <Provider store={store}>{props.children}</Provider>;
}