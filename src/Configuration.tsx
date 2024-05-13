import {
    PropsWithChildren
} from "react";
import {
    AllowedInExplain,
    AttributeRelations,
    ConfigurationModelSource,
    IConfiguratorClient, SessionContext
} from "@viamedici-spc/configurator-ts";
import {
    ConfigurationContext,
    ConfigurationInitializationContext,
    ConfigurationSessionContext, ConfigurationUpdatingContext
} from "./internal/contexts";
import {useConfigurationManagement} from "./internal/configurationManagement";

export type ConfigurationProps = {
    /**
     * The client that is used to create a configuration session.
     * When the instance changes, the old session is disposed and a new session is created. All decisions are discarded in this case.
     */
    configuratorClient: IConfiguratorClient,
    configurationModelSource: ConfigurationModelSource,
    attributeRelations?: AttributeRelations | null,
    usageRuleParameters?: Record<string, string> | null
    allowedInExplain?: AllowedInExplain | null
};

export default function Configuration(props: PropsWithChildren<ConfigurationProps>) {
    const {configuratorClient, ...sessionContext} = props;
    const {configurationInitialization, configurationUpdating, session, configuration} = useConfigurationManagement({
        configuratorClient: configuratorClient,
        sessionContext: sessionContext
    })

    return (
        <ConfigurationInitializationContext.Provider value={configurationInitialization}>
            <ConfigurationUpdatingContext.Provider value={configurationUpdating}>
                <ConfigurationSessionContext.Provider value={session}>
                    <ConfigurationContext.Provider value={configuration}>
                        {props.children}
                    </ConfigurationContext.Provider>
                </ConfigurationSessionContext.Provider>
            </ConfigurationUpdatingContext.Provider>
        </ConfigurationInitializationContext.Provider>
    );
}