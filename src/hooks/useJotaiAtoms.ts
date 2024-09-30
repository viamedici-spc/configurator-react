import {useAtomsContext} from "../internal/contexts";
import {createAttributesAtom} from "../internal/jotai/domain/dynamic";
import {useMemo} from "react";
import {AtomFamily} from "jotai/vanilla/utils/atomFamily";
import {
    Attribute,
    CollectedDecision,
    CollectedExplicitDecision,
    CollectedImplicitDecision,
    Configuration,
    GlobalAttributeId,
    GlobalAttributeIdKey,
    StoredConfiguration
} from "@viamedici-spc/configurator-ts";
import {Atom} from "jotai";
import {UseBooleanAttributeResult, UseChoiceAttributeResult, UseComponentAttributeResult, UseNumericAttributeResult} from "../internal/jotai/domain/attribute";
import {UseConfigurationResetResult} from "../internal/jotai/domain/configurationReset";
import {UseExplainResult} from "../internal/jotai/domain/explain";
import {ConfigurationInitialization, ConfigurationUpdating, GuardedAtom} from "../types";
import {UseConfigurationStoringResult} from "../internal/jotai/domain/configurationStoring";
import {UseConfigurationSatisfactionResult} from "../internal/jotai/domain/configurationSatisfaction";
import {UseSessionReinitializationResult} from "../internal/jotai/domain/sessionReinitialization";
import {UseTaskSchedulingResult} from "../internal/jotai/domain/taskScheduling";
import {UseMakeDecisionResult} from "../internal/jotai/domain/makeDecision";
import {UseDecisionQueriesResult} from "../internal/jotai/domain/decisionQueries";

export type UseJotaiAtomsResult = {
    createAttributesAtom: {
        (attributes: "all"): GuardedAtom<ReadonlyArray<Attribute>>
        (attributes: ReadonlyArray<GlobalAttributeId | GlobalAttributeIdKey>, filterMissingAttributes: true): GuardedAtom<ReadonlyArray<Attribute>>
        (attributes: ReadonlyArray<GlobalAttributeId | GlobalAttributeIdKey>, filterMissingAttributes: false): GuardedAtom<ReadonlyArray<Attribute | undefined>>
    };
    getConfigurationInitializationAtom: Atom<ConfigurationInitialization>;
    getConfigurationUpdatingAtom: Atom<ConfigurationUpdating>;
    getChoiceAttributeAtomFamily: AtomFamily<GlobalAttributeIdKey, GuardedAtom<UseChoiceAttributeResult | undefined>>;
    getNumericAttributeAtomFamily: AtomFamily<GlobalAttributeIdKey, GuardedAtom<UseNumericAttributeResult | undefined>>;
    getBooleanAttributeAtomFamily: AtomFamily<GlobalAttributeIdKey, GuardedAtom<UseBooleanAttributeResult | undefined>>;
    getComponentAttributeAtomFamily: AtomFamily<GlobalAttributeIdKey, GuardedAtom<UseComponentAttributeResult | undefined>>;

    getConfigurationAtom: GuardedAtom<Configuration>;
    getConfigurationStoringAtom: GuardedAtom<UseConfigurationStoringResult>;
    getConfigurationSatisfactionAtom: GuardedAtom<UseConfigurationSatisfactionResult>;
    getMakeDecisionAtom: GuardedAtom<UseMakeDecisionResult>;
    getDecisionQueriesAtom: GuardedAtom<UseDecisionQueriesResult>;
    getConfigurationResetAtom: GuardedAtom<UseConfigurationResetResult>;
    getSessionReinitializationAtom: GuardedAtom<UseSessionReinitializationResult>;
    getExplainAtom: GuardedAtom<UseExplainResult>;
    getTaskSchedulingAtom: GuardedAtom<UseTaskSchedulingResult>;
    getStoredConfigurationAtom: GuardedAtom<StoredConfiguration>;
    getDecisionsAtom: GuardedAtom<ReadonlyArray<CollectedDecision>>;
    getExplicitDecisionsAtom: GuardedAtom<ReadonlyArray<CollectedExplicitDecision>>;
    getImplicitDecisionsAtom: GuardedAtom<NonNullable<ReadonlyArray<CollectedImplicitDecision>>>;
};

/**
 * Gets all Jotai based atoms and atom families of the Configuration session.
 * They can be used to build more advanced reactive pipelines with Jotai.
 */
export function useJotaiAtoms(): UseJotaiAtomsResult {
    const {selectors} = useAtomsContext();

    return useMemo(() => ({
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
    }), [selectors]);
}