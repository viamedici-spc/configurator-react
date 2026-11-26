import type {Selectors} from "./Selectors";
import type {UseConfigurationStoringResult} from "./domain/configurationStoring";
import type {UseConfigurationResetResult} from "./domain/configurationReset";
import type {UseExplainResult} from "./domain/explain";
import type {AtomFamily} from "jotai-family";
import type {
    CollectedDecision,
    CollectedExplicitDecision,
    CollectedImplicitDecision,
    Configuration,
    GlobalAttributeIdKey,
    StoredConfiguration,
} from "@viamedici-spc/configurator-ts";
import type {
    UseBooleanAttributeResult,
    UseChoiceAttributeResult,
    UseComponentAttributeResult,
    UseNumericAttributeResult,
} from "./domain/attribute";
import type {Atom} from "jotai";
import {atomFamily} from "jotai-family";
import type {PromiseOrValue} from "../Types";
import atomWithSuspend from "./helper/atomWithSuspend";
import type {UseConfigurationSatisfactionResult} from "./domain/configurationSatisfaction";
import type {UseSessionReinitializationResult} from "./domain/sessionReinitialization";
import type {UseTaskSchedulingResult} from "./domain/taskScheduling";
import type {UseMakeDecisionResult} from "./domain/makeDecision";
import type {UseDecisionQueriesResult} from "./domain/decisionQueries";

export type SuspendedAtoms = {
    configurationAtom: Atom<PromiseOrValue<Configuration>>;
    configurationStoringAtom: Atom<PromiseOrValue<UseConfigurationStoringResult>>;
    configurationSatisfactionAtom: Atom<PromiseOrValue<UseConfigurationSatisfactionResult>>;
    storedConfigurationAtom: Atom<PromiseOrValue<StoredConfiguration>>;
    decisionsAtom: Atom<PromiseOrValue<ReadonlyArray<CollectedDecision>>>;
    explicitDecisionsAtom: Atom<PromiseOrValue<ReadonlyArray<CollectedExplicitDecision>>>;
    implicitDecisionsAtom: Atom<PromiseOrValue<ReadonlyArray<CollectedImplicitDecision>>>;

    makeDecisionAtom: Atom<PromiseOrValue<UseMakeDecisionResult>>;
    decisionQueriesAtom: Atom<PromiseOrValue<UseDecisionQueriesResult>>;
    configurationResetAtom: Atom<PromiseOrValue<UseConfigurationResetResult>>;
    sessionReinitializationAtom: Atom<PromiseOrValue<UseSessionReinitializationResult>>;
    explainAtom: Atom<PromiseOrValue<UseExplainResult>>;
    taskSchedulingAtom: Atom<PromiseOrValue<UseTaskSchedulingResult>>;
    choiceAttributeAtomFamily: AtomFamily<
        GlobalAttributeIdKey,
        Atom<PromiseOrValue<UseChoiceAttributeResult | undefined>>
    >;
    numericAttributeAtomFamily: AtomFamily<
        GlobalAttributeIdKey,
        Atom<PromiseOrValue<UseNumericAttributeResult | undefined>>
    >;
    booleanAttributeAtomFamily: AtomFamily<
        GlobalAttributeIdKey,
        Atom<PromiseOrValue<UseBooleanAttributeResult | undefined>>
    >;
    componentAttributeAtomFamily: AtomFamily<
        GlobalAttributeIdKey,
        Atom<PromiseOrValue<UseComponentAttributeResult | undefined>>
    >;
};

export function createSuspendedAtoms(selectors: Selectors): SuspendedAtoms {
    return {
        configurationAtom: atomWithSuspend(selectors.guardedConfigurationAtom),
        configurationStoringAtom: atomWithSuspend(selectors.configurationStoringAtom),
        configurationSatisfactionAtom: atomWithSuspend(selectors.configurationSatisfactionAtom),
        storedConfigurationAtom: atomWithSuspend(selectors.guardedStoredConfigurationAtom),
        decisionsAtom: atomWithSuspend(selectors.guardedDecisionsAtom),
        explicitDecisionsAtom: atomWithSuspend(selectors.guardedExplicitDecisionsAtom),
        implicitDecisionsAtom: atomWithSuspend(selectors.guardedImplicitDecisionsAtom),
        makeDecisionAtom: atomWithSuspend(selectors.makeDecisionAtom),
        decisionQueriesAtom: atomWithSuspend(selectors.decisionQueriesAtom),
        configurationResetAtom: atomWithSuspend(selectors.configurationResetAtom),
        sessionReinitializationAtom: atomWithSuspend(selectors.sessionReinitializationAtom),
        explainAtom: atomWithSuspend(selectors.explainAtom),
        taskSchedulingAtom: atomWithSuspend(selectors.taskSchedulingAtom),
        choiceAttributeAtomFamily: atomFamily(key => atomWithSuspend(selectors.choiceAttributeAtomFamily(key))),
        numericAttributeAtomFamily: atomFamily(key => atomWithSuspend(selectors.numericAttributeAtomFamily(key))),
        booleanAttributeAtomFamily: atomFamily(key => atomWithSuspend(selectors.booleanAttributeAtomFamily(key))),
        componentAttributeAtomFamily: atomFamily(key => atomWithSuspend(selectors.componentAttributeAtomFamily(key))),
    };
}