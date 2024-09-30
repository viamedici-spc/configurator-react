import {useAtomsContext} from "../internal/contexts";
import {createAttributesAtom} from "../internal/jotai/domain/dynamic";
import {Atoms} from "../internal/jotai/Atoms";
import {useMemo} from "react";
import {AtomFamily} from "jotai/vanilla/utils/atomFamily";
import {Attribute, Configuration, GlobalAttributeId, GlobalAttributeIdKey} from "@viamedici-spc/configurator-ts";
import {Atom} from "jotai";
import {UseBooleanAttributeResult, UseChoiceAttributeResult, UseComponentAttributeResult, UseNumericAttributeResult} from "../internal/jotai/domain/attribute";
import {UseDecisionResult} from "../internal/jotai/domain/useDecision";
import {UseResetConfigurationResult} from "../internal/jotai/domain/useResetConfiguration";
import {UseExplainResult} from "../internal/jotai/domain/useExplain";
import {ConfigurationInitialization, ConfigurationUpdating, GuardedAtom} from "../types";
import {UseConfigurationStoringResult} from "../internal/jotai/domain/useConfigurationStoring";
import {UseConfigurationSatisfactionResult} from "../internal/jotai/domain/useConfigurationSatisfaction";

/**
 * TODO
 * Namensgebung besprechen
 * mit Suffix oder ohne?
 *
 * Wie kommentieren?
 */

export type UseJotaiAtomsResult = {
    getConfigurationInitializationAtom: Atom<ConfigurationInitialization>;
    getConfigurationUpdatingAtom: Atom<ConfigurationUpdating>;
    createAttributesAtom: {
        (attributes: "all"): GuardedAtom<ReadonlyArray<Attribute>>
        (attributes: ReadonlyArray<GlobalAttributeId | GlobalAttributeIdKey>, filterMissingAttributes: true): GuardedAtom<ReadonlyArray<Attribute>>
        (attributes: ReadonlyArray<GlobalAttributeId | GlobalAttributeIdKey>, filterMissingAttributes: false): GuardedAtom<ReadonlyArray<Attribute | undefined>>
    };
    getChoiceAttribute: AtomFamily<GlobalAttributeIdKey, GuardedAtom<UseChoiceAttributeResult | undefined>>;
    getNumericAttribute: AtomFamily<GlobalAttributeIdKey, GuardedAtom<UseNumericAttributeResult | undefined>>;
    getBooleanAttribute: AtomFamily<GlobalAttributeIdKey, GuardedAtom<UseBooleanAttributeResult | undefined>>;
    getComponentAttribute: AtomFamily<GlobalAttributeIdKey, GuardedAtom<UseComponentAttributeResult | undefined>>;
    getConfigurationAtom: GuardedAtom<Configuration>;
    getConfigurationStoringAtom: GuardedAtom<UseConfigurationStoringResult>;
    getConfigurationSatisfactionAtom: GuardedAtom<UseConfigurationSatisfactionResult>;
    getDecisionAtom: GuardedAtom<UseDecisionResult>;
    getResetConfigurationAtom: GuardedAtom<UseResetConfigurationResult>;
    getExplainAtom: GuardedAtom<UseExplainResult>;
};

export function useJotaiAtoms(): UseJotaiAtomsResult {
    const {selectors} = useAtomsContext();

    return useMemo(() => ({
        getConfigurationInitializationAtom: selectors.configurationInitializationAtom,
        getConfigurationUpdatingAtom: selectors.configurationUpdatingAtom,
        createAttributesAtom: createAttributesAtom(selectors),
        getChoiceAttribute: selectors.useChoiceAttribute,
        getNumericAttribute: selectors.useNumericAttribute,
        getBooleanAttribute: selectors.useBooleanAttribute,
        getComponentAttribute: selectors.useComponentAttribute,
        getConfigurationAtom: selectors.guardedConfigurationAtom,
        getConfigurationSatisfactionAtom: selectors.useConfigurationSatisfactionAtom,
        getConfigurationStoringAtom: selectors.useConfigurationStoringAtom,
        getDecisionAtom: selectors.useDecisionAtom,
        getResetConfigurationAtom: selectors.useResetConfigurationAtom,
        getExplainAtom: selectors.useExplainAtom,
    }), [selectors]);
}