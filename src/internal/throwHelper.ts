import {Configuration, IConfigurationSession} from "@viamedici-spc/configurator-ts";

const message = "The configuration is not initialized. " +
    "Consider using the ConfigurationSuspender or unload components manually that make use of any unsafe hook while the configuration is initializing. " +
    "Check the hooks documentation to see if it is safe to use while the configuration is initializing.";

export function throwIfSessionIsNull(session: IConfigurationSession) {
    if (!session) {
        throw new Error(message);
    }
}

export function throwIfConfigurationIsNull(configuration: Configuration) {
    if (!configuration) {
        throw new Error(message);
    }
}