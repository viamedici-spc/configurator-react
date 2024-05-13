import {
    UseChoiceAttributeResult,
    UseComponentAttributeResult,
    UseBooleanAttributeResult,
    UseNumericAttributeResult,
    useAttributes,
    useBooleanAttribute,
    useChoiceAttribute,
    useComponentAttribute,
    useNumericAttribute
} from "./attribute";
import Configuration, {ConfigurationProps} from "./Configuration";
import {useConfigurationInitialization, useConfigurationUpdating} from "./configurationLifecycle";
import ConfigurationSuspender from "./ConfigurationSuspender";
import useDecision, {UseDecisionResult} from "./useDecision";
import useExplain, {UseExplainResult} from "./useExplain";
import {ConfigurationInitialization, ConfigurationUpdating, ConfigurationError} from "./types";
import useConfiguration, {UseConfigurationResult} from "./useConfiguration";

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

    // ConfigurationSuspender
    ConfigurationSuspender,

    // decision
    type UseDecisionResult,
    useDecision,

    // explain
    type UseExplainResult,
    useExplain,

    // types
    type ConfigurationInitialization,
    type ConfigurationUpdating,
    type ConfigurationError,

    // useConfiguration
    type UseConfigurationResult,
    useConfiguration,
}