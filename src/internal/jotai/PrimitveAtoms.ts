import type {AtomSubscriptionsAtomType} from "./domain/AtomSubscription";
import {createAtomSubscriptionAtom} from "./domain/AtomSubscription";
import type {SessionManagementMachineAtomType} from "./domain/SessionManagement";
import {createSessionManagementMachineAtom} from "./domain/SessionManagement";
import type {
    AttributesAtomType,
    CanResetAtomType,
    ConfigurationAtomType,
    IsSatisfiedAtomType,
} from "./domain/SessionSubscription";
import {
    createAttributesAtom,
    createCanResetAtom,
    createConfigurationAtom,
    createIsSatisfiedAtom,
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
    subscriptionsAtom: createAtomSubscriptionAtom(),
});