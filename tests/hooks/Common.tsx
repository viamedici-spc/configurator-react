import {
    AttributeType,
    BooleanAttribute,
    ChoiceAttribute,
    ComponentAttribute,
    ComponentDecisionState, Configuration,
    ConfigurationModelFromPackage,
    ConfigurationModelSourceType,
    GlobalAttributeIdKeyBuilder, IConfigurationSession,
    Inclusion,
    NumericAttribute,
    Selection
} from "@viamedici-spc/configurator-ts";
import {PropsWithChildren, useMemo} from "react";
import {Atoms} from "../../src/internal/jotai/Atoms";
import {AtomsContext, StoreContext} from "../../src/internal/contexts";
import {atom, createStore, ExtractAtomValue, Provider} from "jotai";
import {SessionManagementMachineAtomType} from "../../src/internal/jotai/domain/SessionManagement";
import {createPrimitives, Primitives} from "../../src/internal/jotai/PrimitveAtoms";
import {createSelectors} from "../../src/internal/jotai/Selectors";
import {createSuspendedAtoms} from "../../src/internal/jotai/SuspendedAtoms";
import {createEffects} from "../../src/internal/jotai/Effects";
import type {StateFrom, ContextFrom} from "xstate";
import {sessionManagementMachine} from "../../src/internal/sessionManagementMachine";
import {atomFamily} from "jotai/utils";
import {AttributesAtomType} from "../../src/internal/jotai/domain/SessionSubscription";

export function WrappingComponent(props: PropsWithChildren<{
    session: IConfigurationSession,
    configuration: Configuration
}>) {
    const configurationSessionAtom = useMemo(() => atom<IConfigurationSession>(), []);
    const sessionManagementMachineAtom: SessionManagementMachineAtomType = useMemo(() =>
        atom<StateFrom<typeof sessionManagementMachine>, [any], void>(get => ({
            context: {
                sessionCreateOrUpdateError: null,
                desiredSessionContext: null,
                configurationSession: get(configurationSessionAtom)
            } as ContextFrom<typeof sessionManagementMachine>
        } as StateFrom<typeof sessionManagementMachine>), () => {
        }), []);
    const primitives: Primitives = useMemo(() => ({
        ...createPrimitives(),
        sessionManagementMachineAtom: sessionManagementMachineAtom
    }), []);
    const atoms: Atoms = useMemo(() => {
        const selectors = createSelectors(primitives);
        const suspendedAtoms = createSuspendedAtoms(selectors);
        return {
            primitives: primitives,
            selectors: selectors,
            suspended: suspendedAtoms,
            effects: createEffects(primitives, selectors, suspendedAtoms)
        };
    }, []);
    const store = useMemo(() => {
        const store = createStore();
        store.set(configurationSessionAtom, props.session);
        store.set(primitives.configurationAtom, props.configuration);
        store.set(primitives.isSatisfiedAtom, props.configuration.isSatisfied);
        const attributesAtom: ExtractAtomValue<AttributesAtomType> = atomFamily(() => atom());
        for (const attribute of [...props.configuration.attributes.values()]) {
            store.set(attributesAtom(attribute.key), attribute);
        }
        store.set(primitives.attributesAtom, () => attributesAtom);
        store.set(primitives.canResetAtom, true);

        return store;
    }, []);


    return (
        <StoreContext.Provider value={store}>
            <Provider store={store}>
                <AtomsContext.Provider value={atoms}>
                    {props.children}
                </AtomsContext.Provider>
            </Provider>
        </StoreContext.Provider>
    );
}

export const choiceAttribute = {
    id: {localId: "A1"},
    key: GlobalAttributeIdKeyBuilder({localId: "A1"}),
    type: AttributeType.Choice,
    isSatisfied: false,
    canContributeToConfigurationSatisfaction: false,
    cardinality: {
        lowerBound: 0,
        upperBound: 1
    },
    values: new Map([
        [
            "V1", {
            id: "V1",
            decision: null,
            nonOptimisticDecision: null,
            possibleDecisionStates: []
        }]
    ])
} satisfies ChoiceAttribute;

export const numericAttribute = {
    id: {localId: "A1"},
    key: GlobalAttributeIdKeyBuilder({localId: "A1"}),
    type: AttributeType.Numeric,
    isSatisfied: false,
    canContributeToConfigurationSatisfaction: false,
    decision: null,
    nonOptimisticDecision: null,
    selection: Selection.Mandatory,
    range: {
        min: 1,
        max: 2
    },
    decimalPlaces: 0
} satisfies NumericAttribute;

export const booleanAttribute = {
    id: {localId: "A1"},
    key: GlobalAttributeIdKeyBuilder({localId: "A1"}),
    type: AttributeType.Boolean,
    isSatisfied: false,
    canContributeToConfigurationSatisfaction: false,
    possibleDecisionStates: [true, false],
    selection: Selection.Mandatory,
    decision: null,
    nonOptimisticDecision: null,
} satisfies BooleanAttribute;

export const componentAttribute = {
    id: {localId: "A1"},
    key: GlobalAttributeIdKeyBuilder({localId: "A1"}),
    type: AttributeType.Component,
    isSatisfied: false,
    canContributeToConfigurationSatisfaction: false,
    decision: null,
    nonOptimisticDecision: null,
    selection: Selection.Mandatory,
    possibleDecisionStates: [ComponentDecisionState.Included, ComponentDecisionState.Excluded],
    inclusion: Inclusion.Optional
} satisfies ComponentAttribute;

export const emptyModel: ConfigurationModelFromPackage = {
    type: ConfigurationModelSourceType.Package,
    configurationModelPackage: {
        root: "null",
        configurationModels: []
    }
};

export const modelWithOneAttribute: ConfigurationModelFromPackage = {
    type: ConfigurationModelSourceType.Package,
    configurationModelPackage: {
        root: "root",
        configurationModels: [
            {
                configurationModelId: "root",
                attributes: {
                    choiceAttributes: [
                        {
                            attributeId: "A1",
                            lowerBound: 0,
                            upperBound: 1,
                            choiceValues: [
                                {
                                    choiceValueId: "A1_C1"
                                }
                            ]
                        }
                    ]
                }
            }
        ]
    }
};