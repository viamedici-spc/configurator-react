import {
    useAttributes,
    useBooleanAttribute,
    useChoiceAttribute,
    useComponentAttribute,
    useNumericAttribute,
} from "./hooks/attribute";
import Configuration, {ConfigurationProps} from "./Configuration";
import {useConfigurationInitialization, useConfigurationUpdating} from "./hooks/configurationLifecycle";
import useDecision from "./hooks/useDecision";
import useExplain from "./hooks/useExplain";
import {ConfigurationInitialization, ConfigurationUninitialized, ConfigurationUpdating, ConfiguratorErrorWithRetry, GuardedAtom} from "./types";
import useConfiguration from "./hooks/useConfiguration";
import useConfigurationSatisfaction from "./hooks/useConfigurationSatisfaction";
import useConfigurationStoring from "./hooks/useConfigurationStoring";
import {UseBooleanAttributeResult, UseChoiceAttributeResult, UseComponentAttributeResult, UseNumericAttributeResult} from "./internal/jotai/domain/attribute";
import {UseDecisionResult} from "./internal/jotai/domain/decision";
import {UseExplainResult} from "./internal/jotai/domain/explain";
import {UseConfigurationSatisfactionResult} from "./internal/jotai/domain/configurationSatisfaction";
import {UseConfigurationStoringResult} from "./internal/jotai/domain/configurationStoring";
import useConfigurationReset from "./hooks/useConfigurationReset";
import {UseConfigurationResetResult} from "./internal/jotai/domain/configurationReset";
import {UseSessionReinitializationResult} from "./internal/jotai/domain/sessionReinitialization";
import useSessionReinitialization from "./hooks/useSessionReinitialization";
import {useConfiguratorStore} from "./internal/contexts";

export {
    // attribute
    type UseChoiceAttributeResult,
    type UseComponentAttributeResult,
    type UseBooleanAttributeResult,
    type UseNumericAttributeResult,
    useAttributes,
    useBooleanAttribute,
    useChoiceAttribute,
    useComponentAttribute,
    useNumericAttribute,

    // Configuration
    Configuration,
    type ConfigurationProps,

    // configurationLifecycle
    useConfigurationUpdating,
    useConfigurationInitialization,

    // decision
    type UseDecisionResult,
    useDecision,

    // explain
    type UseExplainResult,
    useExplain,

    // satisfaction
    type UseConfigurationSatisfactionResult,
    useConfigurationSatisfaction,

    // storing
    type UseConfigurationStoringResult,
    useConfigurationStoring,

    // reset
    type UseConfigurationResetResult,
    useConfigurationReset,

    // reinitialization
    type UseSessionReinitializationResult,
    useSessionReinitialization,

    // types
    type ConfigurationInitialization,
    type ConfigurationUpdating,
    type ConfiguratorErrorWithRetry,
    ConfigurationUninitialized,
    type GuardedAtom,

    // useConfiguration
    useConfiguration,

    useConfiguratorStore,
};