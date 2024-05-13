import {ActorRefFrom, assign, createMachine, forwardTo, send, spawn} from "xstate";
import {
    ChangeConfigurationClientEvent,
    ChangeSessionContextEvent, RetrySessionCreationEvent, RetrySessionUpdateEvent, SessionInitialization,
    sessionManagementMachine,
    SessionManagementStateChangedEvent, SessionUpdating
} from "./sessionManagement";
import {useMachine} from "@xstate/react";
import {
    Configuration,
    IConfigurationSession,
    IConfiguratorClient,
    SessionContext
} from "@viamedici-spc/configurator-ts";
import {pipe, O, Eq} from "@viamedici-spc/fp-ts-extensions";
import {useMemo} from "react";
import {ConfigurationInitialization, ConfigurationUpdating} from "../types";
import {stop} from "xstate/lib/actions";
import {
    ChangeSessionEvent,
    ConfigurationChangedEvent,
    configurationSubscriptionMachine
} from "./configurationSubscriptionManagement";
import {
    DeferredEncapsulatedPromise,
    newDeferredEncapsulatedPromise
} from "./deferredPromise";
import {useStableEffect} from "fp-ts-react-stable-hooks";
import {nullableConfigurationClientEq, nullableSessionContextEq} from "./configuratorEqs";


type MachineContext = {
    sessionManagementActor: ActorRefFrom<typeof sessionManagementMachine>,
    configurationSubscriptionManagementActor: ActorRefFrom<typeof configurationSubscriptionMachine>,
    sessionInitialization: SessionInitialization,
    sessionUpdating: SessionUpdating,
    session: IConfigurationSession,
    configuration: {
        session: IConfigurationSession,
        configuration: Configuration
    },
    isReadyPromise: DeferredEncapsulatedPromise<void>
}

export const configurationManagementMachine = () => createMachine({
    predictableActionArguments: true,
    preserveActionOrder: true,
    schema: {
        context: {} as MachineContext,
        events: {} as ChangeConfigurationClientEvent
            | ChangeSessionContextEvent
            | SessionManagementStateChangedEvent
            | RetrySessionCreationEvent
            | RetrySessionUpdateEvent
            | ConfigurationChangedEvent
    },
    context: {
        sessionManagementActor: null,
        configurationSubscriptionManagementActor: null,
        sessionInitialization: null,
        sessionUpdating: null,
        session: null,
        configuration: null,
        isReadyPromise: newDeferredEncapsulatedPromise<void>()
    },
    entry: [
        assign({
            sessionManagementActor: () => spawn(sessionManagementMachine()),
            configurationSubscriptionManagementActor: () => spawn(configurationSubscriptionMachine())
        })
    ],
    exit: [
        stop(context => context.sessionManagementActor),
        stop(context => context.configurationSubscriptionManagementActor),
    ],
    on: {
        // Forward events for sessionManagement
        ChangeConfigurationClient: {
            actions: [
                forwardTo(context => context.sessionManagementActor)
            ]
        },
        ChangeSessionContext: {
            actions: [
                forwardTo(context => context.sessionManagementActor)
            ]
        },
        RetrySessionCreation: {
            actions: [
                forwardTo(context => context.sessionManagementActor)
            ]
        },
        RetrySessionUpdate: {
            actions: [
                forwardTo(context => context.sessionManagementActor)
            ]
        },
        SessionManagementStateChanged: {
            actions: [
                // Assign the received data
                assign((context, event) => ({
                    session: event.session,
                    sessionInitialization: event.sessionInitialization,
                    sessionUpdating: event.sessionUpdating
                })),
                // Forward the session to the configuration subscription
                send((context) => ({
                    type: "ChangeSession",
                    session: context.session
                }) as ChangeSessionEvent, {to: context => context.configurationSubscriptionManagementActor}),
                "calculateReadyState"
            ]
        },
        ConfigurationChanged: {
            actions: [
                assign((_, event) => ({
                    configuration: {
                        session: event.session,
                        configuration: event.configuration
                    }
                })),
                "calculateReadyState"
            ]
        }
    },
    initial: "Idle",
    states: {
        Idle: {}
    }
}, {
    actions: {
        calculateReadyState: assign((context, _) => {
            const isReady = !context.sessionInitialization?.isInitializing && context.session != null
                && context.configuration != null && context.configuration.session === context.session;

            if (context.isReadyPromise && isReady) {
                context.isReadyPromise.resolve();
                context.isReadyPromise.capsule.promise = null;
            }

            const getIsReadyPromise = () => {
                if (isReady)
                    return null;

                if (context.isReadyPromise != null)
                    // Not ready, keep existing promise.
                    return context.isReadyPromise;

                return newDeferredEncapsulatedPromise<void>();
            };

            return {
                isReadyPromise: getIsReadyPromise()
            };
        })
    }
});

export type ConfigurationManagementProps = {
    configuratorClient: IConfiguratorClient,
    sessionContext: SessionContext
};

export function useConfigurationManagement(props: ConfigurationManagementProps) {
    const [state, send] = useMachine(configurationManagementMachine, {
        logger: (...args) => console.log("ConfigurationManagement:", ...args)
    });

    // Subscribe to client changes
    useStableEffect(() => {
        send({
            type: "ChangeConfigurationClient",
            client: props.configuratorClient
        } as ChangeConfigurationClientEvent);

        if (!props.configuratorClient) {
            console.warn("The configurator client is null or undefined. This will dispose the session that may exist. If this was not intended, make sure you pass a valid client.");
        }
    }, [props.configuratorClient], Eq.tuple(nullableConfigurationClientEq));

    // Subscribe to session context changes
    useStableEffect(() => {
        // Every mandatory property must be set
        const sessionContext = pipe(
            O.fromNullable(props.sessionContext),
            O.chainFirst(sessionContext => O.fromNullable(sessionContext.configurationModelSource)),
            O.toNullable
        );

        send({
            type: "ChangeSessionContext",
            sessionContext: sessionContext
        } as ChangeSessionContextEvent);

        if (!sessionContext) {
            console.warn("The session context is null or undefined. This will dispose the session that may exist. If this was not intended, make sure you pass valid session context data.");
        }
    }, [props.sessionContext], Eq.tuple(nullableSessionContextEq));

    const configurationInitialization = useMemo(() => ({
            isInitializing: state.context.isReadyPromise?.capsule?.promise != null,
            isInitializingPromise: state.context.isReadyPromise?.capsule,
            error: state.context.sessionInitialization?.failureResult && {
                ...state.context.sessionInitialization.failureResult,
                retry: () => send({type: "RetrySessionCreation"} as RetrySessionCreationEvent)
            }
        }) satisfies ConfigurationInitialization,
        [state.context.sessionInitialization, state.context.isReadyPromise]);

    const configurationUpdating = useMemo(() => ({
            isUpdating: state.context.sessionUpdating?.isUpdating,
            error: state.context.sessionUpdating?.failureResult && {
                ...state.context.sessionUpdating.failureResult,
                retry: () => send({type: "RetrySessionUpdate"} as RetrySessionUpdateEvent)
            }
        }) satisfies ConfigurationUpdating,
        [state.context.sessionUpdating]);

    const configuration = state.context.configuration?.session === state.context.session
        ? state.context.configuration?.configuration
        : null;

    return {
        configurationInitialization,
        configurationUpdating,
        session: state.context.session,
        configuration: configuration
    };
}