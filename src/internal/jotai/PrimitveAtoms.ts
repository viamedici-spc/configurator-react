import {AtomSubscriptionsAtomType, createAtomSubscriptionAtom} from "./domain/AtomSubscription";
import {createSessionManagementMachineAtom, SessionManagementMachineAtomType} from "./domain/SessionManagement";
import {
    AttributesAtomType,
    CanResetAtomType,
    ConfigurationAtomType,
    createAttributesAtom,
    createCanResetAtom,
    createConfigurationAtom,
    createIsSatisfiedAtom,
    IsSatisfiedAtomType
} from "./domain/SessionSubscription";

export type Primitives = {
    sessionManagementMachineAtom: SessionManagementMachineAtomType;
    configurationAtom: ConfigurationAtomType;
    isSatisfiedAtom: IsSatisfiedAtomType;
    canResetAtom: CanResetAtomType;
    attributesAtom: AttributesAtomType;
    subscriptionsAtom: AtomSubscriptionsAtomType;
};

export const createPrimitives = (): Primitives => ({
    sessionManagementMachineAtom: createSessionManagementMachineAtom(),
    configurationAtom: createConfigurationAtom(),
    isSatisfiedAtom: createIsSatisfiedAtom(),
    canResetAtom: createCanResetAtom(),
    attributesAtom: createAttributesAtom(),
    subscriptionsAtom: createAtomSubscriptionAtom()
});
