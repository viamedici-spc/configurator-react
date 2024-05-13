import {Configuration} from "@viamedici-spc/configurator-ts";
import {useConfigurationContext, useConfigurationSessionContext} from "./internal/contexts";
import {
    throwIfConfigurationIsNull,
    throwIfSessionIsNull
} from "./internal/throwHelper";
import {useMemo} from "react";

export type UseConfigurationResult = {
    configuration: Configuration,
    restoreConfiguration: (configuration: Configuration) => Promise<void>
};

/**
 * Gets the current configuration data and allows to restore a configuration.
 * @throws If configuration is initializing.
 */
export default function useConfiguration(): UseConfigurationResult {
    const configurationSession = useConfigurationSessionContext();
    const configuration = useConfigurationContext();

    throwIfSessionIsNull(configurationSession);
    throwIfConfigurationIsNull(configuration);

    return useMemo(() => ({
        configuration: configuration,
        restoreConfiguration: (c) => configurationSession.restoreConfiguration(c)
    }) as UseConfigurationResult, [configuration, configurationSession]);
}