import {atom, Atom} from "jotai";
import {atomWithMachine} from "jotai-xstate";
import {sessionManagementMachine} from "../../sessionManagementMachine";
import {IConfigurationSession} from "@viamedici-spc/configurator-ts";
import {Primitives} from "../PrimitveAtoms";
import {SessionInitialization, SessionUpdating} from "../../Types";

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

export function createSessionInitializationAndUpdatingAtom(primitives: Primitives) {
    const baseAtom = atom((get, options) => {
        const sessionManagementMachine = get(primitives.sessionManagementMachineAtom);
        const isProcessing = sessionManagementMachine.matches("Processing");
        const hasSession = sessionManagementMachine.context.configurationSession != null;
        const error = sessionManagementMachine.context.sessionCreateOrUpdateError?.configurationError
            ? {
                ...sessionManagementMachine.context.sessionCreateOrUpdateError.configurationError,
                retry: () => {
                    options.setSelf();
                }
            } : null;

        return {
            isProcessing,
            hasSession,
            error,
        };
    }, (_, set) => {
        // Triggers a retry on write
        set(primitives.sessionManagementMachineAtom, {type: "Retry"});
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