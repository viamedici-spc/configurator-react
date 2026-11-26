import {assign, enqueueActions, fromPromise, log, setup} from "xstate";
import type { Either, Option} from "@viamedici-spc/fp-ts-extensions";
import {E, identity, O, pipe, TE} from "@viamedici-spc/fp-ts-extensions";
import type {ConfiguratorError, IConfigurationSession, SessionContext} from "@viamedici-spc/configurator-ts";
import { SessionFactory} from "@viamedici-spc/configurator-ts";

export type SessionContextChangedEvent = {
    type: "SessionContextChanged",
    sessionContext: SessionContext
};

export type RetryEvent = {
    type: "Retry",
};

export type ShutdownEvent = {
    type: "Shutdown",
};

type SessionCreateOrUpdateError = {
    configurationError: ConfiguratorError,
    /**
     * The session context that resulted in an error.
     */
    sessionContext: SessionContext
};

const createOrUpdateSession = fromPromise<Either<SessionCreateOrUpdateError, IConfigurationSession>, { sessionContext: SessionContext, session: Option<IConfigurationSession> }>(({input, signal}) => pipe(
    input.session,
    O.match(
        () => async () => {
            const session = await SessionFactory.createSession(input.sessionContext);
            if (signal.aborted) {
                // Nobody will receive this session (the machine left Processing or was stopped): close it instead of
                // leaking it.
                TE.tryCatch(async () => await session.close(), identity)();
            }
            return session;
        },
        s => async () => {
            await s.setSessionContext(input.sessionContext);
            return s;
        }
    ),
    fn => TE.tryCatch(fn, e => e as ConfiguratorError),
    TE.mapLeft(e => ({
        sessionContext: input.sessionContext,
        configurationError: e
    } satisfies SessionCreateOrUpdateError))
)());

export const sessionManagementMachine = setup({
    types: {
        context: {} as {
            desiredSessionContext: SessionContext | null,
            configurationSession: IConfigurationSession | null,
            sessionCreateOrUpdateError: SessionCreateOrUpdateError | null
        },
        events: {} as SessionContextChangedEvent | RetryEvent | ShutdownEvent,
    },
    actors: {
        createOrUpdateSession: createOrUpdateSession
    },
    guards: {
        shallProcess: ({context}) =>
            // If there is no error or the SessionContext that resulted in an error is no longer desired.
            (context.sessionCreateOrUpdateError == null || context.sessionCreateOrUpdateError.sessionContext !== context.desiredSessionContext)
            && (
                // Initially there is no Session but a SessionContext
                (context.configurationSession == null && context.desiredSessionContext != null)
                // or the desired SessionContext is different from the actual SessionContext.
                || (context.configurationSession != null && context.configurationSession.getSessionContext() !== context.desiredSessionContext)),
        shallDispose: ({context}) => context.configurationSession != null && context.desiredSessionContext == null
    }
})
    .createMachine({
        context: {
            desiredSessionContext: null,
            configurationSession: null,
            sessionCreateOrUpdateError: null,
        },
        on: {
            Retry: {
                actions: [
                    assign({
                        sessionCreateOrUpdateError: () => null
                    })
                ]
            },
            SessionContextChanged: {
                actions: [
                    log("SessionContextChanged"),
                    assign({
                        desiredSessionContext: ({event}) => event.sessionContext
                    })
                ]
            },
            Shutdown: {
                target: "#shutdown"
            }
        },
        initial: "Idle",
        states: {
            Idle: {
                always: [
                    {target: "DisposeSession", guard: "shallDispose"},
                    {target: "Processing", guard: "shallProcess"},
                ]
            },
            Processing: {
                entry: [
                    assign({
                        sessionCreateOrUpdateError: () => null
                    })
                ],
                invoke: {
                    src: "createOrUpdateSession",
                    input: ({context}) => ({
                        sessionContext: context.desiredSessionContext!,
                        session: O.fromNullable(context.configurationSession)
                    }),
                    onDone: {
                        target: "Idle",
                        actions: [
                            enqueueActions(({event, enqueue}) => {
                                if (E.isRight(event.output)) {
                                    enqueue.assign({
                                        configurationSession: event.output.right
                                    });
                                } else {
                                    enqueue.assign({
                                        sessionCreateOrUpdateError: event.output.left
                                    });
                                }
                            })
                        ]
                    }
                }
            },
            DisposeSession: {
                always: [{
                    target: "Idle",
                    actions: [
                        enqueueActions(({enqueue, context}) => {
                            TE.tryCatch(async () => await context.configurationSession?.close(), identity)();

                            enqueue.assign({
                                configurationSession: () => null,
                                sessionCreateOrUpdateError: () => null,
                            });
                        })
                    ]
                }]
            },
            // Not final: React's StrictMode (and a remount) runs the cleanup and then the effect again, which sends a
            // new session context; the machine starts over instead of staying shut down.
            Shutdown: {
                id: "shutdown",
                on: {
                    SessionContextChanged: {
                        target: "Idle",
                        actions: [
                            assign({
                                desiredSessionContext: ({event}) => event.sessionContext,
                            }),
                        ],
                    },
                },
                entry: [
                    enqueueActions(({context, enqueue}) => {
                        if (context.configurationSession) {
                            TE.tryCatch(async () => await context.configurationSession?.close(), identity)();
                        }
                        enqueue.assign({
                            configurationSession: () => null,
                            desiredSessionContext: () => null,
                            sessionCreateOrUpdateError: () => null,
                        });
                    })
                ]
            }
        }
    });