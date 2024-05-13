import {createContext, useContext} from "react";
import {ConfigurationInitialization, ConfigurationUpdating} from "../types";
import {IConfigurationSession, Configuration} from "@viamedici-spc/configurator-ts";

export const ConfigurationSessionContext = createContext<IConfigurationSession>(null);
export const ConfigurationInitializationContext = createContext<ConfigurationInitialization>(null);
export const ConfigurationUpdatingContext = createContext<ConfigurationUpdating>(null);
export const ConfigurationContext = createContext<Configuration>(null);
export const useConfigurationSessionContext = () => useContext(ConfigurationSessionContext);
export const useConfigurationContext = () => useContext(ConfigurationContext);