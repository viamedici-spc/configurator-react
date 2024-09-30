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
import {UseDecisionResult} from "./internal/jotai/domain/useDecision";
import {UseExplainResult} from "./internal/jotai/domain/useExplain";
import {UseConfigurationSatisfactionResult} from "./internal/jotai/domain/useConfigurationSatisfaction";
import {UseConfigurationStoringResult} from "./internal/jotai/domain/useConfigurationStoring";

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

    // types
    type ConfigurationInitialization,
    type ConfigurationUpdating,
    type ConfiguratorErrorWithRetry,
    ConfigurationUninitialized,
    type GuardedAtom,

    // useConfiguration
    useConfiguration,
};