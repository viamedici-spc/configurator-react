import {constVoid} from "@viamedici-spc/fp-ts-extensions";
import {AnyEventObject, assign, createMachine, DoneInvokeEvent, sendParent} from "xstate";
import {log, pure} from "xstate/lib/actions";
import {
    SessionContext,
    ConfiguratorClient,
    IConfiguratorClient,
    IConfigurationSession,
    FailureResult
} from "@viamedici-spc/configurator-ts";
import {nullableConfigurationClientEq, nullableSessionContextEq, sessionContextEq} from "./configuratorEqs";

export type SessionInitialization = {
    isInitializing: boolean,
    failureResult?: FailureResult
};

export type SessionUpdating = {
    isUpdating: boolean,
    failureResult?: FailureResult
};

export type ChangeConfigurationClientEvent = {
    type: "ChangeConfigurationClient",
    client: IConfiguratorClient
};

export type ChangeSessionContextEvent = {
    type: "ChangeSessionContext",
    sessionContext: SessionContext
};

export type RetrySessionCreationEvent = {
    type: "RetrySessionCreation"
};

export type RetrySessionUpdateEvent = {
    type: "RetrySessionUpdate"
};

export type SessionManagementStateChangedEvent = {
    type: "SessionManagementStateChanged",
    sessionInitialization: SessionInitialization,
    sessionUpdating: SessionUpdating,
    session: IConfigurationSession | null
};

type SessionCreationDone = { client: ConfiguratorClient, session: IConfigurationSession };

type SessionCreationError = {
    failureResult: FailureResult,
    client: ConfiguratorClient,
    sessionContext: SessionContext
};

type SessionUpdateError = {
    failureResult: FailureResult,
    sessionContext: SessionContext
};

type MachineContext = {
    desiredClient: IConfiguratorClient,
    actualClient: IConfiguratorClient,
    desiredSessionContext: SessionContext,
    session: IConfigurationSession,
    sessionCreationError: SessionCreationError,
    sessionUpdateError: SessionUpdateError,
    hasEverSuccessfullyCreatedSession: boolean,
};

enum SessionManagementMachineState {
    CreateSession,
    UpdateSession,
    Other
}

export const sessionManagementMachine = () => createMachine({
    predictableActionArguments: true,
    preserveActionOrder: true,
    schema: {
        context: {} as MachineContext,
        events: {} as ChangeConfigurationClientEvent
            | ChangeSessionContextEvent
            | RetrySessionCreationEvent
            | RetrySessionUpdateEvent
            | DoneInvokeEvent<SessionCreationDone>
            | DoneInvokeEvent<SessionCreationError>
            | DoneInvokeEvent<SessionUpdateError>
    },
    context: {
        desiredClient: null,
        desiredSessionContext: null,
        actualClient: null,
        session: null,
        sessionCreationError: null,
        sessionUpdateError: null,
        hasEverSuccessfullyCreatedSession: false
    },
    initial: "ProcessChanges",
    on: {
        ChangeConfigurationClient: {
            actions: ["saveDesiredClient"]
        },
        ChangeSessionContext: {
            actions: ["saveDesiredSessionContext"]
        }
    },
    exit: [
        log("Shutting down", "SessionManagement:"),
        "disposeOldSession"
    ],
    states: {
        ProcessChanges: {
            entry: [
                log("Entering ProcessChanges", "SessionManagement:"),
                sendStateToParent(SessionManagementMachineState.Other)
            ],
            always: [
                {target: "DisposeSession", cond: "shallDisposeSession"},
                {target: "CreateSession", cond: "shallCreateSession"},
                {target: "UpdateSession", cond: "shallUpdateSession"}
            ]
        },
        DisposeSession: {
            entry: [
                log("Entering DisposeSession", "SessionManagement:"),
                sendStateToParent(SessionManagementMachineState.Other)
            ],
            always: {
                actions: ["disposeOldSession"],
                target: "ProcessChanges",
            }
        },
        CreateSession: {
            entry: [
                log("Entering CreateSession", "SessionManagement:"),
                sendStateToParent(SessionManagementMachineState.CreateSession)
            ],
            invoke: {
                id: "getNewSession",
                src: "createSession",
                onDone: {
                    actions: ["setSessionCreationResult", "setHasEverSuccessfullyCreatedSession"],
                    target: "ProcessChanges"
                },
                onError: {
                    actions: "setSessionCreationError",
                    target: "SessionCreationFailed"
                }
            }
        },
        SessionCreationFailed: {
            entry: [
                log("Entering SessionCreationFailed", "SessionManagement:"),
                sendStateToParent(SessionManagementMachineState.Other)
            ],
            always: {
                // Immediately process changes if there were changes during session creation attempt
                // This will also be triggered if session context or client changes
                target: "ProcessChanges",
                cond: "shallImmediatelyProcessChangesAfterSessionCreationError"
            },
            exit: [
                log("Exiting SessionCreationFailed", "SessionManagement:"),
                "clearSessionCreationError"
            ],
            on: {
                RetrySessionCreation: {
                    target: "ProcessChanges",
                    actions: log("Retrying session creation", "SessionManagement:")
                }
            }
        },
        UpdateSession: {
            entry: [
                log("Entering UpdateSession", "SessionManagement:"),
                sendStateToParent(SessionManagementMachineState.UpdateSession)
            ],
            invoke: {
                id: "updateExistingSession",
                src: "updateSession",
                onDone: {
                    target: "ProcessChanges"
                },
                onError: {
                    actions: "setSessionUpdateError",
                    target: "SessionUpdateFailed"
                }
            }
        },
        SessionUpdateFailed: {
            entry: [
                log("Entering SessionUpdateFailed", "SessionManagement:"),
                sendStateToParent(SessionManagementMachineState.Other)
            ],
            always: {
                // Immediately process changes if there were changes during session update attempt
                // This will also be triggered if session context or client changes
                target: "ProcessChanges",
                cond: "shallImmediatelyProcessChangesAfterSessionUpdateError"
            },
            exit: [
                log("Exiting SessionUpdateFailed", "SessionManagement:"),
                "clearSessionUpdateError"
            ],
            on: {
                RetrySessionUpdate: {
                    target: "ProcessChanges",
                    actions: log("Retrying session update", "SessionManagement:")
                }
            }
        }
    }
}, {
    actions: {
        saveDesiredClient: assign({
            desiredClient: (_, event: ChangeConfigurationClientEvent) => event.client
        }),
        saveDesiredSessionContext: assign({
            desiredSessionContext: (_, event: ChangeSessionContextEvent) => event.sessionContext
        }),
        disposeOldSession: assign((context, _) => {
            if (context.session) {
                context.session.close()
                    .then(constVoid)
                    .catch(_ => {
                        // Ignored
                    });
            }

            return {
                session: null,
                actualClient: null
            };
        }),
        setSessionCreationResult: assign((_, event: DoneInvokeEvent<SessionCreationDone>) => ({
            session: event.data.session,
            actualClient: event.data.client
        })),
        setSessionCreationError: assign((_, event: DoneInvokeEvent<SessionCreationError>) => ({
            sessionCreationError: event.data
        })),
        clearSessionCreationError: assign({sessionCreationError: () => null}),
        setSessionUpdateError: assign((_, event: DoneInvokeEvent<SessionUpdateError>) => ({
            sessionUpdateError: event.data
        })),
        clearSessionUpdateError: assign({sessionUpdateError: () => null}),
        setHasEverSuccessfullyCreatedSession: assign({
            hasEverSuccessfullyCreatedSession: () => true
        }),
    },
    services: {
        createSession: context => context.desiredClient.createSession(context.desiredSessionContext)
            .then(s => ({
                session: s,
                client: context.desiredClient
            }) as SessionCreationDone)
            .catch((e: FailureResult) => Promise.reject({
                failureResult: e,
                client: context.desiredClient,
                sessionContext: context.desiredSessionContext
            } as SessionCreationError)),
        updateSession: context =>
            context.session.setSessionContext(context.desiredSessionContext)
                .catch((e: FailureResult) => Promise.reject({
                    failureResult: e,
                    sessionContext: context.desiredSessionContext
                } as SessionUpdateError))
    },
    guards: {
        shallDisposeSession: context =>
            context.session != null
            && (
                context.desiredSessionContext == null
                || context.desiredClient == null
                || !nullableConfigurationClientEq.equals(context.actualClient, context.desiredClient)
            ),
        shallCreateSession: context => context.session == null && context.desiredClient != null && context.desiredSessionContext != null,
        shallUpdateSession: context => context.session != null && !sessionContextEq.equals(context.session.getSessionContext(), context.desiredSessionContext),
        shallImmediatelyProcessChangesAfterSessionCreationError: context =>
            // The desired client and the desired session context is not the same that resulted in the error.
            !nullableConfigurationClientEq.equals(context.desiredClient, context.sessionCreationError.client)
            || !nullableSessionContextEq.equals(context.desiredSessionContext, context.sessionCreationError.sessionContext),
        shallImmediatelyProcessChangesAfterSessionUpdateError: context =>
            // The desired client was changed
            !nullableConfigurationClientEq.equals(context.desiredClient, context.actualClient)
            // The desired session context is not the same that resulted in the error.
            || !nullableSessionContextEq.equals(context.desiredSessionContext, context.sessionUpdateError.sessionContext)
    }
});

function sendStateToParent(state: SessionManagementMachineState) {
    const isInCreateSessionState = state === SessionManagementMachineState.CreateSession;
    const isInUpdateSessionState = state === SessionManagementMachineState.UpdateSession;

    return pure<MachineContext, AnyEventObject>((context, _) => {
        const sessionInitialization = ({
            isInitializing: (!context.hasEverSuccessfullyCreatedSession || isInCreateSessionState) && context.sessionCreationError == null,
            failureResult: context.sessionCreationError && context.sessionCreationError.failureResult
        }) satisfies SessionInitialization;
        const sessionUpdating = ({
            isUpdating: isInUpdateSessionState && context.sessionUpdateError == null,
            failureResult: context.sessionUpdateError && context.sessionUpdateError.failureResult
        }) satisfies SessionUpdating;

        return sendParent<MachineContext, AnyEventObject, AnyEventObject>({
            type: "SessionManagementStateChanged",
            sessionInitialization: sessionInitialization,
            sessionUpdating: sessionUpdating,
            session: context.session
        } as SessionManagementStateChangedEvent);
    });
}