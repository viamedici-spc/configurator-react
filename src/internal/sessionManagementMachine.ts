import {assign, enqueueActions, fromPromise, log, setup} from "xstate";
import {E, Either, identity, O, Option, pipe, TE} from "@viamedici-spc/fp-ts-extensions";
import {ConfiguratorError, IConfigurationSession, SessionContext, SessionFactory} from "@viamedici-spc/configurator-ts";

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

const createOrUpdateSession = fromPromise<Either<SessionCreateOrUpdateError, IConfigurationSession>, { sessionContext: SessionContext, session: Option<IConfigurationSession> }>(({input}) => pipe(
    input.session,
    O.match(
        () => () => SessionFactory.createSession(input.sessionContext),
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
            Shutdown: {
                type: "final",
                id: "shutdown",
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