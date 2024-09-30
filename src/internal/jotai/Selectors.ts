import {Atom, atom} from "jotai";
import {Attribute, Configuration, GlobalAttributeIdKey, IConfigurationSession} from "@viamedici-spc/configurator-ts";
import {Primitives} from "./PrimitveAtoms";
import {ConfigurationInitialization, ConfigurationUninitialized, ConfigurationUpdating, GuardedAtom} from "../../types";
import {createUseDecisionHookAtom, UseDecisionResult} from "./domain/useDecision";
import {createUseResetConfigurationHookAtom, UseResetConfigurationResult} from "./domain/useResetConfiguration";
import {createUseExplainHookAtom, UseExplainResult} from "./domain/useExplain";
import {AtomFamily} from "jotai/vanilla/utils/atomFamily";
import {
    createUseBooleanAttributeHookAtom,
    createUseChoiceAttributeHookAtom, createUseComponentAttributeHookAtom,
    createUseNumericAttributeHookAtom,
    UseBooleanAttributeResult,
    UseChoiceAttributeResult,
    UseComponentAttributeResult,
    UseNumericAttributeResult
} from "./domain/attribute";
import {PrimitiveAtom} from "jotai";
import {createConfigurationInitializationAtom} from "./domain/configurationInitialization";
import {createConfigurationUpdatingAtom} from "./domain/configurationUpdating";
import {createUseConfigurationStoringHookAtom, UseConfigurationStoringResult} from "./domain/useConfigurationStoring";
import {createSubscriberAtom, SubscriberAtomType} from "./domain/AtomSubscription";
import {
    ConfigurationSessionAtomType,
    createConfigurationSessionAtom,
    createSessionInitializationAndUpdatingAtom,
    SessionInitializationAtomType,
    SessionUpdatingAtomType
} from "./domain/SessionManagement";
import {createUseConfigurationSatisfactionAtom, UseConfigurationSatisfactionResult} from "./domain/useConfigurationSatisfaction";

export type Selectors = {
    configurationSessionAtom: ConfigurationSessionAtomType;
    sessionInitializationAtom: SessionInitializationAtomType;
    sessionUpdatingAtom: SessionUpdatingAtomType;

    guardedConfigurationSessionAtom: GuardedAtom<IConfigurationSession>;
    guardedConfigurationAtom: GuardedAtom<Configuration>;
    guardedIsSatisfiedAtom: GuardedAtom<boolean>;
    guardedCanResetAtom: GuardedAtom<boolean>;
    guardedAttributesAtom: GuardedAtom<AtomFamily<GlobalAttributeIdKey, PrimitiveAtom<Attribute | undefined>>>;

    configurationInitializationAtom: Atom<ConfigurationInitialization>;
    configurationUpdatingAtom: Atom<ConfigurationUpdating>;

    useConfigurationStoringAtom: GuardedAtom<UseConfigurationStoringResult>;
    useConfigurationSatisfactionAtom: GuardedAtom<UseConfigurationSatisfactionResult>;
    useDecisionAtom: GuardedAtom<UseDecisionResult>;
    useResetConfigurationAtom: GuardedAtom<UseResetConfigurationResult>;
    useExplainAtom: GuardedAtom<UseExplainResult>;
    useChoiceAttribute: AtomFamily<GlobalAttributeIdKey, GuardedAtom<UseChoiceAttributeResult | undefined>>;
    useNumericAttribute: AtomFamily<GlobalAttributeIdKey, GuardedAtom<UseNumericAttributeResult | undefined>>;
    useBooleanAttribute: AtomFamily<GlobalAttributeIdKey, GuardedAtom<UseBooleanAttributeResult | undefined>>;
    useComponentAttribute: AtomFamily<GlobalAttributeIdKey, GuardedAtom<UseComponentAttributeResult | undefined>>;

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
    };
    const useDecisionHookAtom = createUseDecisionHookAtom(guardedAtoms.guardedConfigurationSessionAtom);
    const useExplainHookAtom = createUseExplainHookAtom(guardedAtoms.guardedConfigurationSessionAtom);

    return {
        ...guardedAtoms,
        configurationSessionAtom: configurationSessionAtom,

        sessionInitializationAtom: sessionInitializationAtom,
        sessionUpdatingAtom: sessionUpdatingAtom,
        configurationInitializationAtom: createConfigurationInitializationAtom(sessionInitializationAtom, guardedAtoms.guardedConfigurationSessionAtom, guardedAtoms.guardedConfigurationAtom, guardedAtoms.guardedCanResetAtom, guardedAtoms.guardedIsSatisfiedAtom, guardedAtoms.guardedAttributesAtom),
        configurationUpdatingAtom: createConfigurationUpdatingAtom(sessionUpdatingAtom),
        useDecisionAtom: useDecisionHookAtom,
        useExplainAtom: useExplainHookAtom,

        useConfigurationSatisfactionAtom: createUseConfigurationSatisfactionAtom(guardedAtoms.guardedConfigurationSessionAtom, guardedAtoms.guardedIsSatisfiedAtom),
        useConfigurationStoringAtom: createUseConfigurationStoringHookAtom(guardedAtoms.guardedConfigurationSessionAtom),
        useResetConfigurationAtom: createUseResetConfigurationHookAtom(guardedAtoms.guardedConfigurationSessionAtom, guardedAtoms.guardedCanResetAtom),
        useChoiceAttribute: createUseChoiceAttributeHookAtom(guardedAtoms.guardedAttributesAtom, useDecisionHookAtom, useExplainHookAtom),
        useNumericAttribute: createUseNumericAttributeHookAtom(guardedAtoms.guardedAttributesAtom, useDecisionHookAtom, useExplainHookAtom),
        useBooleanAttribute: createUseBooleanAttributeHookAtom(guardedAtoms.guardedAttributesAtom, useDecisionHookAtom, useExplainHookAtom),
        useComponentAttribute: createUseComponentAttributeHookAtom(guardedAtoms.guardedAttributesAtom, useDecisionHookAtom, useExplainHookAtom),

        subscriberAtom: createSubscriberAtom(primitives)
    };
}