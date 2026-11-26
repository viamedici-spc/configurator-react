import type { Atom} from "jotai";
import {atom} from "jotai";
import {atomWithMachine} from "jotai-xstate";
import {sessionManagementMachine} from "../../sessionManagementMachine";
import type {IConfigurationSession} from "@viamedici-spc/configurator-ts";
import type {Primitives} from "../PrimitveAtoms";
import type {SessionInitialization, SessionUpdating} from "../../Types";

export type SessionManagementMachineAtomType = ReturnType<typeof atomWithMachine<typeof sessionManagementMachine>>;
export type ConfigurationSessionAtomType = Atom<IConfigurationSession | null>;
export type SessionInitializationAtomType = Atom<SessionInitialization>;
export type SessionUpdatingAtomType = Atom<SessionUpdating>;

export function createSessionManagementMachineAtom(): SessionManagementMachineAtomType {
    return atomWithMachine(sessionManagementMachine);
}

export function createConfigurationSessionAtom(primitives: Primitives): ConfigurationSessionAtomType {
    return atom(get => get(primitives.sessionManagementMachineAtom).context.configurationSession);
}

type RetryAction = {type: "register"; retry: () => void} | {type: "retry"};

export function createSessionInitializationAndUpdatingAtom(primitives: Primitives) {
    // The retry callback handed to consumers. Once the atom is mounted, onMount registers a callback that writes to this
    // atom, which sends Retry to the session management machine (Jotai 3 has no setSelf in read functions anymore).
    const retryHolderAtom = atom<{retry: () => void}>({retry: () => {}});
    const retryAtom = atom(
        get => get(retryHolderAtom),
        (_, set, action: RetryAction) => {
            if (action.type === "register") {
                set(retryHolderAtom, {retry: action.retry});
            } else {
                set(primitives.sessionManagementMachineAtom, {type: "Retry"});
            }
        },
    );
    retryAtom.onMount = setAtom => {
        setAtom({type: "register", retry: () => setAtom({type: "retry"})});
    };

    const baseAtom = atom(get => {
        const sessionManagementMachine = get(primitives.sessionManagementMachineAtom);
        const isProcessing = sessionManagementMachine.matches("Processing");
        const hasSession = sessionManagementMachine.context.configurationSession != null;
        const {retry} = get(retryAtom);
        const error = sessionManagementMachine.context.sessionCreateOrUpdateError?.configurationError
            ? {
                ...sessionManagementMachine.context.sessionCreateOrUpdateError.configurationError,
                retry: () => {
                    retry();
                }
            } : null;

        return {
            isProcessing,
            hasSession,
            error,
        };
    });

    const sessionInitializationAtom: SessionInitializationAtomType = atom<SessionInitialization>((get) => {
        const {hasSession, error, isProcessing} = get(baseAtom);

        return {
            isInitializing: !hasSession && isProcessing,
            error: !hasSession && error ? error : undefined,
        } satisfies SessionInitialization;
    });

    const sessionUpdatingAtom: SessionUpdatingAtomType = atom<SessionUpdating>((get) => {
        const {hasSession, error, isProcessing} = get(baseAtom);

        return {
            isUpdating: hasSession && isProcessing,
            error: hasSession && error ? error : undefined,
        } satisfies SessionUpdating;
    });

    return {
        sessionInitializationAtom,
        sessionUpdatingAtom,
    };
}