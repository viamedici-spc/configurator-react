import {
    useAttributes,
    useBooleanAttribute,
    useChoiceAttribute,
    useComponentAttribute,
    useNumericAttribute,
} from "./hooks/attribute";
import type {ConfigurationProps} from "./Configuration";
import Configuration from "./Configuration";
import {useConfigurationInitialization, useConfigurationUpdating} from "./hooks/configurationLifecycle";
import useExplain from "./hooks/useExplain";
import type {
    ConfigurationInitialization,
    ConfigurationUpdating,
    ConfiguratorErrorWithRetry,
    GuardedAtom,
} from "./types";
import {ConfigurationUninitialized} from "./types";
import useConfiguration from "./hooks/useConfiguration";
import useConfigurationSatisfaction from "./hooks/useConfigurationSatisfaction";
import useConfigurationStoring from "./hooks/useConfigurationStoring";
import type {
    UseBooleanAttributeResult,
    UseChoiceAttributeResult,
    UseComponentAttributeResult,
    UseNumericAttributeResult,
} from "./internal/jotai/domain/attribute";
import type {UseExplainResult} from "./internal/jotai/domain/explain";
import type {UseConfigurationSatisfactionResult} from "./internal/jotai/domain/configurationSatisfaction";
import type {UseConfigurationStoringResult} from "./internal/jotai/domain/configurationStoring";
import useConfigurationReset from "./hooks/useConfigurationReset";
import type {UseConfigurationResetResult} from "./internal/jotai/domain/configurationReset";
import type {UseSessionReinitializationResult} from "./internal/jotai/domain/sessionReinitialization";
import useSessionReinitialization from "./hooks/useSessionReinitialization";
import {useConfiguratorStore} from "./internal/contexts";
import useTaskScheduling from "./hooks/useTaskScheduling";
import type {UseTaskSchedulingResult} from "./internal/jotai/domain/taskScheduling";
import useStoredConfiguration from "./hooks/useStoredConfiguration";
import type {UseMakeDecisionResult} from "./internal/jotai/domain/makeDecision";
import useMakeDecision from "./hooks/useMakeDecision";
import type {UseDecisionQueriesResult} from "./internal/jotai/domain/decisionQueries";
import useDecisionQueries from "./hooks/useDecisionQueries";
import useDecisions from "./hooks/useDecisions";
import type {UseJotaiAtomsResult} from "./hooks/useJotaiAtoms";
import {useJotaiAtoms} from "./hooks/useJotaiAtoms";
import {isConfigurationInitialized} from "./helper";

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
    type UseMakeDecisionResult,
    useMakeDecision,

    // decision queries
    type UseDecisionQueriesResult,
    useDecisionQueries,

    // explain
    type UseExplainResult,
    useExplain,

    // satisfaction
    type UseConfigurationSatisfactionResult,
    useConfigurationSatisfaction,

    // storing
    type UseConfigurationStoringResult,
    useConfigurationStoring,

    // task scheduling
    type UseTaskSchedulingResult,
    useTaskScheduling,

    // decisions
    useDecisions,

    // stored configuration
    useStoredConfiguration,

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
    type UseJotaiAtomsResult,
    useJotaiAtoms,
    isConfigurationInitialized,
};