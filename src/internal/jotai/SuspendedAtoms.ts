import {Selectors} from "./Selectors";
import {UseConfigurationStoringResult} from "./domain/configurationStoring";
import {UseDecisionResult} from "./domain/decision";
import {UseConfigurationResetResult} from "./domain/configurationReset";
import {UseExplainResult} from "./domain/explain";
import {AtomFamily} from "jotai/vanilla/utils/atomFamily";
import {Configuration, GlobalAttributeIdKey} from "@viamedici-spc/configurator-ts";
import {UseBooleanAttributeResult, UseChoiceAttributeResult, UseComponentAttributeResult, UseNumericAttributeResult} from "./domain/attribute";
import {Atom} from "jotai";
import {atomFamily} from "jotai/utils";
import {PromiseOrValue} from "../Types";
import atomWithSuspend from "./helper/atomWithSuspend";
import {UseConfigurationSatisfactionResult} from "./domain/configurationSatisfaction";
import {UseSessionReinitializationResult} from "./domain/sessionReinitialization";

export type SuspendedAtoms = {
    configurationAtom: Atom<PromiseOrValue<Configuration>>;
    configurationStoringAtom: Atom<PromiseOrValue<UseConfigurationStoringResult>>;
    configurationSatisfactionAtom: Atom<PromiseOrValue<UseConfigurationSatisfactionResult>>;
    decisionAtom: Atom<PromiseOrValue<UseDecisionResult>>;
    configurationResetAtom: Atom<PromiseOrValue<UseConfigurationResetResult>>;
    sessionReinitializationAtom: Atom<PromiseOrValue<UseSessionReinitializationResult>>;
    explainAtom: Atom<PromiseOrValue<UseExplainResult>>;
    choiceAttributeAtomFamily: AtomFamily<GlobalAttributeIdKey, Atom<PromiseOrValue<UseChoiceAttributeResult | undefined>>>;
    numericAttributeAtomFamily: AtomFamily<GlobalAttributeIdKey, Atom<PromiseOrValue<UseNumericAttributeResult | undefined>>>;
    booleanAttributeAtomFamily: AtomFamily<GlobalAttributeIdKey, Atom<PromiseOrValue<UseBooleanAttributeResult | undefined>>>;
    componentAttributeAtomFamily: AtomFamily<GlobalAttributeIdKey, Atom<PromiseOrValue<UseComponentAttributeResult | undefined>>>;
};

export function createSuspendedAtoms(selectors: Selectors): SuspendedAtoms {
    return {
        configurationAtom: atomWithSuspend(selectors.guardedConfigurationAtom),
        configurationStoringAtom: atomWithSuspend(selectors.configurationStoringAtom),
        configurationSatisfactionAtom: atomWithSuspend(selectors.configurationSatisfactionAtom),
        decisionAtom: atomWithSuspend(selectors.decisionAtom),
        configurationResetAtom: atomWithSuspend(selectors.configurationResetAtom),
        sessionReinitializationAtom: atomWithSuspend(selectors.sessionReinitializationAtom),
        explainAtom: atomWithSuspend(selectors.explainAtom),
        choiceAttributeAtomFamily: atomFamily(key => atomWithSuspend(selectors.choiceAttributeAtomFamily(key))),
        numericAttributeAtomFamily: atomFamily(key => atomWithSuspend(selectors.numericAttributeAtomFamily(key))),
        booleanAttributeAtomFamily: atomFamily(key => atomWithSuspend(selectors.booleanAttributeAtomFamily(key))),
        componentAttributeAtomFamily: atomFamily(key => atomWithSuspend(selectors.componentAttributeAtomFamily(key))),
    };
}