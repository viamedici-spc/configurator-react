import {Selectors} from "./Selectors";
import {UseConfigurationStoringResult} from "./domain/useConfigurationStoring";
import {UseDecisionResult} from "./domain/useDecision";
import {UseResetConfigurationResult} from "./domain/useResetConfiguration";
import {UseExplainResult} from "./domain/useExplain";
import {AtomFamily} from "jotai/vanilla/utils/atomFamily";
import {Configuration, GlobalAttributeIdKey} from "@viamedici-spc/configurator-ts";
import {UseBooleanAttributeResult, UseChoiceAttributeResult, UseComponentAttributeResult, UseNumericAttributeResult} from "./domain/attribute";
import {Atom} from "jotai";
import {atomFamily} from "jotai/utils";
import {PromiseOrValue} from "../Types";
import atomWithSuspend from "./helper/atomWithSuspend";
import {UseConfigurationSatisfactionResult} from "./domain/useConfigurationSatisfaction";

export type SuspendedAtoms = {
    configurationAtom: Atom<PromiseOrValue<Configuration>>;
    useConfigurationStoringAtom: Atom<PromiseOrValue<UseConfigurationStoringResult>>;
    useConfigurationSatisfactionAtom: Atom<PromiseOrValue<UseConfigurationSatisfactionResult>>;
    useDecisionAtom: Atom<PromiseOrValue<UseDecisionResult>>;
    useResetConfigurationAtom: Atom<PromiseOrValue<UseResetConfigurationResult>>;
    useExplainAtom: Atom<PromiseOrValue<UseExplainResult>>;
    useChoiceAttribute: AtomFamily<GlobalAttributeIdKey, Atom<PromiseOrValue<UseChoiceAttributeResult | undefined>>>;
    useNumericAttribute: AtomFamily<GlobalAttributeIdKey, Atom<PromiseOrValue<UseNumericAttributeResult | undefined>>>;
    useBooleanAttribute: AtomFamily<GlobalAttributeIdKey, Atom<PromiseOrValue<UseBooleanAttributeResult | undefined>>>;
    useComponentAttribute: AtomFamily<GlobalAttributeIdKey, Atom<PromiseOrValue<UseComponentAttributeResult | undefined>>>;
};

export function createSuspendedAtoms(selectors: Selectors): SuspendedAtoms {
    return {
        configurationAtom: atomWithSuspend(selectors.guardedConfigurationAtom),
        useConfigurationStoringAtom: atomWithSuspend(selectors.useConfigurationStoringAtom),
        useConfigurationSatisfactionAtom: atomWithSuspend(selectors.useConfigurationSatisfactionAtom),
        useDecisionAtom: atomWithSuspend(selectors.useDecisionAtom),
        useResetConfigurationAtom: atomWithSuspend(selectors.useResetConfigurationAtom),
        useExplainAtom: atomWithSuspend(selectors.useExplainAtom),
        useChoiceAttribute: atomFamily(key => atomWithSuspend(selectors.useChoiceAttribute(key))),
        useNumericAttribute: atomFamily(key => atomWithSuspend(selectors.useNumericAttribute(key))),
        useBooleanAttribute: atomFamily(key => atomWithSuspend(selectors.useBooleanAttribute(key))),
        useComponentAttribute: atomFamily(key => atomWithSuspend(selectors.useComponentAttribute(key))),
    };
}