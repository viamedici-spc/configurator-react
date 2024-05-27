import {Context, createContext, useContext} from "react";
import {ConfigurationInitialization, ConfigurationUpdating} from "../types";
import {IConfigurationSession, Configuration} from "@viamedici-spc/configurator-ts";

type Contexts = {
    ConfigurationSessionContext: Context<IConfigurationSession>;
    ConfigurationInitializationContext: Context<ConfigurationInitialization>;
    ConfigurationUpdatingContext: Context<ConfigurationUpdating>;
    ConfigurationContext: Context<Configuration>;
}

const contexts: Contexts = (window as any).configuratorReactContexts ?? {
    ConfigurationSessionContext: createContext(null),
    ConfigurationInitializationContext: createContext(null),
    ConfigurationUpdatingContext: createContext(null),
    ConfigurationContext: createContext(null)
} satisfies Contexts;
(window as any).configuratorReactContexts = contexts;

export const ConfigurationSessionContext = contexts.ConfigurationSessionContext;
export const ConfigurationInitializationContext = contexts.ConfigurationInitializationContext;
export const ConfigurationUpdatingContext = contexts.ConfigurationUpdatingContext;
export const ConfigurationContext = contexts.ConfigurationContext;

export const useConfigurationSessionContext = () => useContext(ConfigurationSessionContext);
export const useConfigurationContext = () => useContext(ConfigurationContext);