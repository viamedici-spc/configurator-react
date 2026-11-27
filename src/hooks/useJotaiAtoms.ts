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

/**
 * The atoms behind the hooks, for an application that builds its own Jotai atoms on the configuration.
 *
 * @remarks The atoms are read-only. Read them with the store of {@link useConfiguratorStore}, e.g.
 * `useAtomValue(atom, {store: useConfiguratorStore()})`, inside the `Configuration` component. A
 * {@link GuardedAtom} holds {@link ConfigurationUninitialized} until the configuration is initialized; it does not
 * suspend.
 */
export type UseJotaiAtomsResult = {
    /**
     * Creates an atom of attributes, as {@link useAttributes} returns them: all of them, or the requested ones in their
     * order. With `filterMissingAttributes` `true` a missing attribute is left out, with `false` it is `undefined`.
     */
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
    /** Whether the configuration is initializing, and its error, from {@link useConfigurationInitialization}. */
    readonly getConfigurationInitializationAtom: Atom<ConfigurationInitialization>;
    /** Whether the configuration is updating, and its error, from {@link useConfigurationUpdating}. */
    readonly getConfigurationUpdatingAtom: Atom<ConfigurationUpdating>;
    /**
     * One atom per attribute key with what {@link useChoiceAttribute} returns; `undefined` if the attribute does not
     * exist or is not a choice attribute.
     */
    readonly getChoiceAttributeAtomFamily: AtomFamily<
        GlobalAttributeIdKey,
        GuardedAtom<UseChoiceAttributeResult | undefined>
    >;
    /**
     * One atom per attribute key with what {@link useNumericAttribute} returns; `undefined` if the attribute does not
     * exist or is not a numeric attribute.
     */
    readonly getNumericAttributeAtomFamily: AtomFamily<
        GlobalAttributeIdKey,
        GuardedAtom<UseNumericAttributeResult | undefined>
    >;
    /**
     * One atom per attribute key with what {@link useBooleanAttribute} returns; `undefined` if the attribute does not
     * exist or is not a boolean attribute.
     */
    readonly getBooleanAttributeAtomFamily: AtomFamily<
        GlobalAttributeIdKey,
        GuardedAtom<UseBooleanAttributeResult | undefined>
    >;
    /**
     * One atom per attribute key with what {@link useComponentAttribute} returns; `undefined` if the attribute does not
     * exist or is not a component attribute.
     */
    readonly getComponentAttributeAtomFamily: AtomFamily<
        GlobalAttributeIdKey,
        GuardedAtom<UseComponentAttributeResult | undefined>
    >;

    /** The current configuration, as {@link useConfiguration} returns it. */
    readonly getConfigurationAtom: GuardedAtom<Configuration>;
    /** The commands of {@link useConfigurationStoring}. */
    readonly getConfigurationStoringAtom: GuardedAtom<UseConfigurationStoringResult>;
    /** The satisfaction and its explain, as {@link useConfigurationSatisfaction} returns them. */
    readonly getConfigurationSatisfactionAtom: GuardedAtom<UseConfigurationSatisfactionResult>;
    /** The commands of {@link useMakeDecision}. */
    readonly getMakeDecisionAtom: GuardedAtom<UseMakeDecisionResult>;
    /** The queries of {@link useDecisionQueries}. */
    readonly getDecisionQueriesAtom: GuardedAtom<UseDecisionQueriesResult>;
    /** The reset and whether it is possible, as {@link useConfigurationReset} returns them. */
    readonly getConfigurationResetAtom: GuardedAtom<UseConfigurationResetResult>;
    /** The command of {@link useSessionReinitialization}. */
    readonly getSessionReinitializationAtom: GuardedAtom<UseSessionReinitializationResult>;
    /** The commands of {@link useExplain}. */
    readonly getExplainAtom: GuardedAtom<UseExplainResult>;
    /** The command of {@link useTaskScheduling}. */
    readonly getTaskSchedulingAtom: GuardedAtom<UseTaskSchedulingResult>;
    /** The current configuration as a stored configuration, as {@link useStoredConfiguration} returns it. */
    readonly getStoredConfigurationAtom: GuardedAtom<StoredConfiguration>;
    /** All non-optimistic decisions, as {@link useDecisions} returns them without a kind. */
    readonly getDecisionsAtom: GuardedAtom<ReadonlyArray<CollectedDecision>>;
    /** The explicit non-optimistic decisions, as `useDecisions(DecisionKind.Explicit)` returns them. */
    readonly getExplicitDecisionsAtom: GuardedAtom<ReadonlyArray<CollectedExplicitDecision>>;
    /** The implicit non-optimistic decisions, as `useDecisions(DecisionKind.Implicit)` returns them. */
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