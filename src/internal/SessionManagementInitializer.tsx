import {SessionContext} from "@viamedici-spc/configurator-ts";
import {useEffect} from "react";
import {useSetAtom} from "jotai";
import {useAtomsContext} from "./contexts";

export const sessionContextNullishWarningText = "The session context is null or undefined. This will dispose the session that may exist. If this was not intended, make sure you pass valid session context data.";

export default function SessionManagementInitializer(props: { sessionContext: SessionContext }) {
    const {primitives: {sessionManagementMachineAtom}} = useAtomsContext();
    const send = useSetAtom(sessionManagementMachineAtom);

    useEffect(() => {
        send({type: "SessionContextChanged", sessionContext: props.sessionContext});

        if (!props.sessionContext) {
            console.warn(sessionContextNullishWarningText);
        }
    }, [props.sessionContext]);

    useEffect(() => {
        return () => {
            send({type: "Shutdown"});
        };
    }, []);

    return null;
}