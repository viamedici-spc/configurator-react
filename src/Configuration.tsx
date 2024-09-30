import {
    PropsWithChildren, useEffect, useMemo
} from "react";
import {
    SessionContext
} from "@viamedici-spc/configurator-ts";
import {AtomsContext} from "./internal/contexts";
import EffectLoader from "./internal/EffectLoader";
import {createAtoms} from "./internal/jotai/Atoms";
import {Provider, useStore} from "jotai";
import {createStore} from "jotai";
import SessionManagementInitializer from "./internal/SessionManagementInitializer";

export type ConfigurationProps = {
    // TODO: Kommentieren, dass immer die selbe Referenz übergeben werden sollte. Wenn sich die Referenz ändert, wird die Session neu erstellt. Man soll bspw. useMemo benutzen.
    sessionContext: SessionContext;
    jotaiStore?: ReturnType<typeof createStore>;
};

export default function Configuration(props: PropsWithChildren<ConfigurationProps>) {
    const atoms = useMemo(() => createAtoms(), []);

    const children = (<>
        <SessionManagementInitializer sessionContext={props.sessionContext}/>
        <EffectLoader/>
        {props.children}
    </>);

    // TODO: Hier lieber fest eine Suspense barriere einbauen, da eine Barriere außerhalb der Configuration die Ausführung blockiert?
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