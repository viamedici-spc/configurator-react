import {
    PropsWithChildren, useMemo, useRef
} from "react";
import {
    SessionContext
} from "@viamedici-spc/configurator-ts";
import {AtomsContext} from "./internal/contexts";
import EffectLoader from "./internal/EffectLoader";
import {createAtoms} from "./internal/jotai/Atoms";
import {getDefaultStore, Provider} from "jotai";
import {createStore} from "jotai";
import SessionManagementInitializer from "./internal/SessionManagementInitializer";

export type ConfigurationProps = {
    /**
     * The SessionContext that should be used to create the session. Every time the SessionContext change, a new Session is created and all decisions are tried to restore.
     * @remarks A change to the SessionContext is detected using referentially equality. Consider using {@link useMemo} or {@link useRef} to keep the SessionContext unchanged during rendering.
     */
    sessionContext: SessionContext;
    /**
     * An optional Jotai store where all Atoms will be stored in. Defaults to the result of {@link getDefaultStore()}.
     */
    jotaiStore?: ReturnType<typeof createStore>;
};

export default function Configuration(props: PropsWithChildren<ConfigurationProps>) {
    const atoms = useMemo(() => createAtoms(), []);

    const children = (<>
        <SessionManagementInitializer sessionContext={props.sessionContext}/>
        <EffectLoader/>
        {props.children}
    </>);

    return <>
        <AtomsContext.Provider value={atoms}>
            {
                props.jotaiStore
                    ? (<Provider store={props.jotaiStore}>
                        {children}
                    </Provider>)
                    : children
            }

        </AtomsContext.Provider>
    </>
}