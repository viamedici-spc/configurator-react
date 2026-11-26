import type {Atom} from "jotai";
import { atom} from "jotai";
import type {
    Attribute,
    CollectedDecision,
    CollectedExplicitDecision,
    CollectedImplicitDecision,
    Configuration,
    GlobalAttributeIdKey,
    IConfigurationSession,
    StoredConfiguration
} from "@viamedici-spc/configurator-ts";
import type {Primitives} from "./PrimitveAtoms";
import type {ConfigurationInitialization, ConfigurationUpdating, GuardedAtom} from "../../types";
import { ConfigurationUninitialized} from "../../types";
import type { UseConfigurationResetResult} from "./domain/configurationReset";
import {createConfigurationResetAtom} from "./domain/configurationReset";
import type { UseExplainResult} from "./domain/explain";
import {createExplainAtom} from "./domain/explain";
import type {AtomFamily} from "jotai-family";
import type {
    UseBooleanAttributeResult,
    UseChoiceAttributeResult,
    UseComponentAttributeResult,
    UseNumericAttributeResult
} from "./domain/attribute";
import {
    createBooleanAttributeAtomFamily,
    createChoiceAttributeAtomFamily, createComponentAttributeAtomFamily, createNumericAttributeAtomFamily
} from "./domain/attribute";
import type {PrimitiveAtom} from "jotai";
import {createConfigurationInitializationAtom} from "./domain/configurationInitialization";
import {createConfigurationUpdatingAtom} from "./domain/configurationUpdating";
import type { UseConfigurationStoringResult} from "./domain/configurationStoring";
import {createConfigurationStoringAtom} from "./domain/configurationStoring";
import type { SubscriberAtomType} from "./domain/AtomSubscription";
import {createSubscriberAtom} from "./domain/AtomSubscription";
import type {
    ConfigurationSessionAtomType,
    SessionInitializationAtomType,
    SessionUpdatingAtomType
} from "./domain/SessionManagement";
import {
    createConfigurationSessionAtom,
    createSessionInitializationAndUpdatingAtom
} from "./domain/SessionManagement";
import type { UseConfigurationSatisfactionResult} from "./domain/configurationSatisfaction";
import {createConfigurationSatisfactionAtom} from "./domain/configurationSatisfaction";
import type { UseSessionReinitializationResult} from "./domain/sessionReinitialization";
import {createSessionReinitializationAtom} from "./domain/sessionReinitialization";
import {
    createDecisionsAtom, createExplicitDecisionsAtom, createImplicitDecisionsAtom,
    createStoredConfigurationAtom
} from "./domain/SessionSubscription";
import type { UseTaskSchedulingResult} from "./domain/taskScheduling";
import {createTaskSchedulingAtom} from "./domain/taskScheduling";
import type { UseDecisionQueriesResult} from "./domain/decisionQueries";
import {createDecisionQueriesAtom} from "./domain/decisionQueries";
import type { UseMakeDecisionResult} from "./domain/makeDecision";
import {createMakeDecisionAtom} from "./domain/makeDecision";

export type Selectors = {
    configurationSessionAtom: ConfigurationSessionAtomType;
    sessionInitializationAtom: SessionInitializationAtomType;
    sessionUpdatingAtom: SessionUpdatingAtomType;

    guardedConfigurationSessionAtom: GuardedAtom<IConfigurationSession>;
    guardedConfigurationAtom: GuardedAtom<Configuration>;
    guardedIsSatisfiedAtom: GuardedAtom<boolean>;
    guardedCanResetAtom: GuardedAtom<boolean>;
    guardedAttributesAtom: GuardedAtom<AtomFamily<GlobalAttributeIdKey, PrimitiveAtom<Attribute | undefined>>>;
    guardedStoredConfigurationAtom: GuardedAtom<StoredConfiguration>;
    guardedDecisionsAtom: GuardedAtom<ReadonlyArray<CollectedDecision>>;
    guardedExplicitDecisionsAtom: GuardedAtom<ReadonlyArray<CollectedExplicitDecision>>;
    guardedImplicitDecisionsAtom: GuardedAtom<ReadonlyArray<CollectedImplicitDecision>>;

    configurationInitializationAtom: Atom<ConfigurationInitialization>;
    configurationUpdatingAtom: Atom<ConfigurationUpdating>;

    taskSchedulingAtom: GuardedAtom<UseTaskSchedulingResult>;
    configurationStoringAtom: GuardedAtom<UseConfigurationStoringResult>;
    configurationSatisfactionAtom: GuardedAtom<UseConfigurationSatisfactionResult>;
    makeDecisionAtom: GuardedAtom<UseMakeDecisionResult>;
    decisionQueriesAtom: GuardedAtom<UseDecisionQueriesResult>;
    configurationResetAtom: GuardedAtom<UseConfigurationResetResult>;
    sessionReinitializationAtom: GuardedAtom<UseSessionReinitializationResult>;
    explainAtom: GuardedAtom<UseExplainResult>;
    choiceAttributeAtomFamily: AtomFamily<GlobalAttributeIdKey, GuardedAtom<UseChoiceAttributeResult | undefined>>;
    numericAttributeAtomFamily: AtomFamily<GlobalAttributeIdKey, GuardedAtom<UseNumericAttributeResult | undefined>>;
    booleanAttributeAtomFamily: AtomFamily<GlobalAttributeIdKey, GuardedAtom<UseBooleanAttributeResult | undefined>>;
    componentAttributeAtomFamily: AtomFamily<GlobalAttributeIdKey, GuardedAtom<UseComponentAttributeResult | undefined>>;

    subscriberAtom: SubscriberAtomType;
};

function guardAtom<Value>(base: Atom<Value>): GuardedAtom<NonNullable<Value>> {
    return atom(get => get(base) ?? ConfigurationUninitialized);
}

export function createSelectors(primitives: Primitives): Selectors {
    const {sessionInitializationAtom, sessionUpdatingAtom} = createSessionInitializationAndUpdatingAtom(primitives);
    const configurationSessionAtom = createConfigurationSessionAtom(primitives);
    const guardedAtoms = {
        guardedConfigurationSessionAtom: guardAtom(configurationSessionAtom),
        guardedConfigurationAtom: guardAtom(primitives.configurationAtom),
        guardedIsSatisfiedAtom: guardAtom(primitives.isSatisfiedAtom),
        guardedCanResetAtom: guardAtom(primitives.canResetAtom),
        guardedAttributesAtom: guardAtom(primitives.attributesAtom),
        guardedStoredConfigurationAtom: guardAtom(createStoredConfigurationAtom(configurationSessionAtom)),
        guardedDecisionsAtom: guardAtom(createDecisionsAtom(configurationSessionAtom)),
        guardedExplicitDecisionsAtom: guardAtom(createExplicitDecisionsAtom(configurationSessionAtom)),
        guardedImplicitDecisionsAtom: guardAtom(createImplicitDecisionsAtom(configurationSessionAtom)),
    };
    const makeDecisionAtom = createMakeDecisionAtom(guardedAtoms.guardedConfigurationSessionAtom);
    const explainHookAtom = createExplainAtom(guardedAtoms.guardedConfigurationSessionAtom);

    return {
        ...guardedAtoms,
        configurationSessionAtom: configurationSessionAtom,

        sessionInitializationAtom: sessionInitializationAtom,
        sessionUpdatingAtom: sessionUpdatingAtom,

        configurationInitializationAtom: createConfigurationInitializationAtom(sessionInitializationAtom, guardedAtoms.guardedConfigurationSessionAtom, guardedAtoms.guardedConfigurationAtom, guardedAtoms.guardedCanResetAtom, guardedAtoms.guardedIsSatisfiedAtom, guardedAtoms.guardedAttributesAtom),
        configurationUpdatingAtom: createConfigurationUpdatingAtom(sessionUpdatingAtom),

        makeDecisionAtom: makeDecisionAtom,
        explainAtom: explainHookAtom,
        decisionQueriesAtom: createDecisionQueriesAtom(guardedAtoms.guardedConfigurationSessionAtom),

        taskSchedulingAtom: createTaskSchedulingAtom(guardedAtoms.guardedConfigurationSessionAtom),
        configurationSatisfactionAtom: createConfigurationSatisfactionAtom(guardedAtoms.guardedConfigurationSessionAtom, guardedAtoms.guardedIsSatisfiedAtom),
        configurationStoringAtom: createConfigurationStoringAtom(guardedAtoms.guardedConfigurationSessionAtom),
        configurationResetAtom: createConfigurationResetAtom(guardedAtoms.guardedConfigurationSessionAtom, guardedAtoms.guardedCanResetAtom),
        sessionReinitializationAtom: createSessionReinitializationAtom(guardedAtoms.guardedConfigurationSessionAtom),
        choiceAttributeAtomFamily: createChoiceAttributeAtomFamily(guardedAtoms.guardedAttributesAtom, makeDecisionAtom, explainHookAtom),
        numericAttributeAtomFamily: createNumericAttributeAtomFamily(guardedAtoms.guardedAttributesAtom, makeDecisionAtom, explainHookAtom),
        booleanAttributeAtomFamily: createBooleanAttributeAtomFamily(guardedAtoms.guardedAttributesAtom, makeDecisionAtom, explainHookAtom),
        componentAttributeAtomFamily: createComponentAttributeAtomFamily(guardedAtoms.guardedAttributesAtom, makeDecisionAtom, explainHookAtom),

        subscriberAtom: createSubscriberAtom(primitives)
    };
}