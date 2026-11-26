import {useAtomsContext} from "../internal/contexts";
import {createAttributesAtom} from "../internal/jotai/domain/dynamic";
import {useMemo} from "react";
import type {AtomFamily} from "jotai-family";
import type {
    Attribute,
    CollectedDecision,
    CollectedExplicitDecision,
    CollectedImplicitDecision,
    Configuration,
    GlobalAttributeId,
    GlobalAttributeIdKey,
    StoredConfiguration,
} from "@viamedici-spc/configurator-ts";
import type {Atom} from "jotai";
import type {
    UseBooleanAttributeResult,
    UseChoiceAttributeResult,
    UseComponentAttributeResult,
    UseNumericAttributeResult,
} from "../internal/jotai/domain/attribute";
import type {UseConfigurationResetResult} from "../internal/jotai/domain/configurationReset";
import type {UseExplainResult} from "../internal/jotai/domain/explain";
import type {ConfigurationInitialization, ConfigurationUpdating, GuardedAtom} from "../types";
import type {UseConfigurationStoringResult} from "../internal/jotai/domain/configurationStoring";
import type {UseConfigurationSatisfactionResult} from "../internal/jotai/domain/configurationSatisfaction";
import type {UseSessionReinitializationResult} from "../internal/jotai/domain/sessionReinitialization";
import type {UseTaskSchedulingResult} from "../internal/jotai/domain/taskScheduling";
import type {UseMakeDecisionResult} from "../internal/jotai/domain/makeDecision";
import type {UseDecisionQueriesResult} from "../internal/jotai/domain/decisionQueries";

export type UseJotaiAtomsResult = {
    readonly createAttributesAtom: {
        (attributes: "all"): GuardedAtom<ReadonlyArray<Attribute>>;
        (
            attributes: ReadonlyArray<GlobalAttributeId | GlobalAttributeIdKey>,
            filterMissingAttributes: true,
        ): GuardedAtom<ReadonlyArray<Attribute>>;
        (
            attributes: ReadonlyArray<GlobalAttributeId | GlobalAttributeIdKey>,
            filterMissingAttributes: false,
        ): GuardedAtom<ReadonlyArray<Attribute | undefined>>;
    };
    readonly getConfigurationInitializationAtom: Atom<ConfigurationInitialization>;
    readonly getConfigurationUpdatingAtom: Atom<ConfigurationUpdating>;
    readonly getChoiceAttributeAtomFamily: AtomFamily<
        GlobalAttributeIdKey,
        GuardedAtom<UseChoiceAttributeResult | undefined>
    >;
    readonly getNumericAttributeAtomFamily: AtomFamily<
        GlobalAttributeIdKey,
        GuardedAtom<UseNumericAttributeResult | undefined>
    >;
    readonly getBooleanAttributeAtomFamily: AtomFamily<
        GlobalAttributeIdKey,
        GuardedAtom<UseBooleanAttributeResult | undefined>
    >;
    readonly getComponentAttributeAtomFamily: AtomFamily<
        GlobalAttributeIdKey,
        GuardedAtom<UseComponentAttributeResult | undefined>
    >;

    readonly getConfigurationAtom: GuardedAtom<Configuration>;
    readonly getConfigurationStoringAtom: GuardedAtom<UseConfigurationStoringResult>;
    readonly getConfigurationSatisfactionAtom: GuardedAtom<UseConfigurationSatisfactionResult>;
    readonly getMakeDecisionAtom: GuardedAtom<UseMakeDecisionResult>;
    readonly getDecisionQueriesAtom: GuardedAtom<UseDecisionQueriesResult>;
    readonly getConfigurationResetAtom: GuardedAtom<UseConfigurationResetResult>;
    readonly getSessionReinitializationAtom: GuardedAtom<UseSessionReinitializationResult>;
    readonly getExplainAtom: GuardedAtom<UseExplainResult>;
    readonly getTaskSchedulingAtom: GuardedAtom<UseTaskSchedulingResult>;
    readonly getStoredConfigurationAtom: GuardedAtom<StoredConfiguration>;
    readonly getDecisionsAtom: GuardedAtom<ReadonlyArray<CollectedDecision>>;
    readonly getExplicitDecisionsAtom: GuardedAtom<ReadonlyArray<CollectedExplicitDecision>>;
    readonly getImplicitDecisionsAtom: GuardedAtom<NonNullable<ReadonlyArray<CollectedImplicitDecision>>>;
};

/**
 * Gets all Jotai based atoms and atom families of the Configuration session.
 * They can be used to build more advanced reactive pipelines with Jotai.
 */
export function useJotaiAtoms(): UseJotaiAtomsResult {
    const {selectors} = useAtomsContext();

    return useMemo(
        () => ({
            getConfigurationInitializationAtom: selectors.configurationInitializationAtom,
            getConfigurationUpdatingAtom: selectors.configurationUpdatingAtom,
            createAttributesAtom: createAttributesAtom(selectors),
            getChoiceAttributeAtomFamily: selectors.choiceAttributeAtomFamily,
            getNumericAttributeAtomFamily: selectors.numericAttributeAtomFamily,
            getBooleanAttributeAtomFamily: selectors.booleanAttributeAtomFamily,
            getComponentAttributeAtomFamily: selectors.componentAttributeAtomFamily,
            getConfigurationAtom: selectors.guardedConfigurationAtom,
            getConfigurationSatisfactionAtom: selectors.configurationSatisfactionAtom,
            getConfigurationStoringAtom: selectors.configurationStoringAtom,
            getMakeDecisionAtom: selectors.makeDecisionAtom,
            getDecisionQueriesAtom: selectors.decisionQueriesAtom,
            getConfigurationResetAtom: selectors.configurationResetAtom,
            getSessionReinitializationAtom: selectors.sessionReinitializationAtom,
            getExplainAtom: selectors.explainAtom,
            getTaskSchedulingAtom: selectors.taskSchedulingAtom,
            getStoredConfigurationAtom: selectors.guardedStoredConfigurationAtom,
            getDecisionsAtom: selectors.guardedDecisionsAtom,
            getExplicitDecisionsAtom: selectors.guardedExplicitDecisionsAtom,
            getImplicitDecisionsAtom: selectors.guardedImplicitDecisionsAtom,
        }),
        [selectors],
    );
}