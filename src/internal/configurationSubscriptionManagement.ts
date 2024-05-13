import {IConfigurationSession} from "@viamedici-spc/configurator-ts";
import {AnyEventObject, assign, createMachine, InvokeCallback, sendParent} from "xstate";
import {Configuration} from "@viamedici-spc/configurator-ts";
import {log} from "xstate/lib/actions";

export type ChangeSessionEvent = {
    type: "ChangeSession",
    session: IConfigurationSession
}

export type ConfigurationChangedEvent = {
    type: "ConfigurationChanged",
    session: IConfigurationSession,
    configuration: Configuration
}

export const configurationSubscriptionActor = (session: IConfigurationSession): InvokeCallback<AnyEventObject, ConfigurationChangedEvent> =>
    (callback) => {
        callback({
            type: "ConfigurationChanged",
            session: session,
            configuration: session.getConfiguration()
        });

        session.setOnConfigurationChangedHandler(configuration => {
            callback({
                type: "ConfigurationChanged",
                session: session,
                configuration: configuration
            });
        });

        return () => {
            session.setOnConfigurationChangedHandler(null);
        };
    };

type MachineContext = {
    session: IConfigurationSession
};

export const configurationSubscriptionMachine = () => createMachine({
    predictableActionArguments: true,
    preserveActionOrder: true,
    schema: {
        context: {} as MachineContext,
        events: {} as ConfigurationChangedEvent
            | ChangeSessionEvent
    },
    context: {
        session: null
    },
    on: {
        // Forward the configuration data to the parent.
        ConfigurationChanged: {
            actions: [
                sendParent((_, event) => event)
            ]
        }
    },
    initial: "ProcessChanges",
    states: {
        ProcessChanges: {
            entry: [
                log("Entering ProcessChanges", "ConfigurationSubscriptionManagement:")
            ],
            on: {
                ChangeSession: {
                    actions: [
                        "saveSession"
                    ]
                }
            },
            always: [
                {
                    target: "Subscribe",
                    cond: (context, _) => context.session != null
                }
            ]
        },
        Subscribe: {
            entry: [
                log("Entering Subscribe", "ConfigurationSubscriptionManagement:")
            ],
            on: {
                ChangeSession: {
                    target: "ProcessChanges",
                    cond: (context, event) => event.session == null || context.session !== event.session,
                    actions: [
                        "saveSession"
                    ]
                }
            },
            invoke: {
                id: "configurationSubscriptionActor",
                src: (context, _) => configurationSubscriptionActor(context.session)
            }
        }
    }
}, {
    actions: {
        saveSession: assign((_, event) => ({
            session: event.session
        }))
    }
});