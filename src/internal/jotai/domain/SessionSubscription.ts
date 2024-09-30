import {atomFamily} from "jotai/utils";
import {
    Attribute,
    CollectedDecision,
    CollectedExplicitDecision,
    CollectedImplicitDecision,
    Configuration,
    DecisionKind,
    GlobalAttributeIdKey,
    GlobalAttributeIdKeyBuilder,
    IConfigurationSession,
    Logger,
    OnDecisionsChangedHandler,
    OnStoredConfigurationChangedHandler,
    StoredConfiguration,
    Subscription
} from "@viamedici-spc/configurator-ts";
import {Atom, atom, PrimitiveAtom} from "jotai";
import {Primitives} from "../PrimitveAtoms";
import {Selectors} from "../Selectors";
import {atomEffect} from "jotai-effect";
import {AtomFamily} from "jotai/vanilla/utils/atomFamily";

const createAttributesAtomValue = () => atomFamily<GlobalAttributeIdKey, PrimitiveAtom<Attribute | undefined>>(() => atom());

export type ConfigurationAtomType = PrimitiveAtom<Configuration | undefined>;
export type IsSatisfiedAtomType = PrimitiveAtom<boolean | undefined>;
export type CanResetAtomType = PrimitiveAtom<boolean | undefined>;
export type AttributesAtomType = PrimitiveAtom<AtomFamily<GlobalAttributeIdKey, PrimitiveAtom<Attribute | undefined>> | undefined>;

export const createConfigurationAtom = (): ConfigurationAtomType => atom();
export const createIsSatisfiedAtom = (): IsSatisfiedAtomType => atom();
export const createCanResetAtom = (): CanResetAtomType => atom();
export const createAttributesAtom = (): AttributesAtomType => atom();

export function createAddSessionListenersEffect(primitives: Primitives, selectors: Selectors) {
    const {attributesAtom, configurationAtom, isSatisfiedAtom, canResetAtom} = primitives;
    const {configurationSessionAtom} = selectors;

    return atomEffect((get, set) => {
        const session = get(configurationSessionAtom);
        if (!session) {
            set(configurationAtom, undefined);
            set(isSatisfiedAtom, undefined);
            set(attributesAtom, undefined);
            set(canResetAtom, undefined);
            return;
        }

        const configurationChangedSubscription = session.addConfigurationChangedListener((configuration, configurationChanges) => {
            Logger.debug("SessionSubscription:", "Received ConfigurationChanged");
            set(configurationAtom, configuration);
            if (configurationChanges.isSatisfied != null) {
                set(isSatisfiedAtom, configurationChanges.isSatisfied);
            }
            const currentAttributesValue = get.peek(attributesAtom);
            const attributes = currentAttributesValue ?? createAttributesAtomValue();

            configurationChanges.attributes.added.forEach(attribute => {
                set(attributes(attribute.key), attribute);
            });
            configurationChanges.attributes.changed.forEach(attribute => {
                set(attributes(attribute.key), attribute);
            });
            configurationChanges.attributes.removed.forEach(attributeId => {
                set(attributes(GlobalAttributeIdKeyBuilder(attributeId)), undefined);
            });

            if (currentAttributesValue == null) {
                set(attributesAtom, () => attributes);
            }
        });

        const canResetSubscription = session.addCanResetConfigurationChangedListener((canResetConfiguration) => {
            Logger.debug("SessionSubscription:", "Received CanResetConfigurationChanged");
            set(canResetAtom, canResetConfiguration);
        });

        return () => {
            configurationChangedSubscription.unsubscribe();
            canResetSubscription.unsubscribe();
        };
    });
}

function subscribeToSession<H extends (...args: any) => void, R>(configurationSessionAtom: Selectors["configurationSessionAtom"], subscribe: (session: IConfigurationSession, handler: (...args: Parameters<H>) => void) => Subscription, resultMapper: (...args: Parameters<H>) => R) {
    const subscribingAtom = atom<Atom<Parameters<H> | undefined> | undefined>((get) => {
        const session = get(configurationSessionAtom);
        if (!session) {
            return undefined;
        }

        const resultAtom = atom<Parameters<H>>();
        resultAtom.onMount = (setAtom) => {
            const subscription = subscribe(session, (...args) => {
                setAtom(args);
            });

            return () => {
                setAtom(undefined);
                subscription.unsubscribe();
            };
        };

        return resultAtom;
    });

    return atom<R | undefined>(get => {
        const resultAtom = get(subscribingAtom);
        if (resultAtom == undefined) {
            return undefined;
        }
        const result = get(resultAtom);
        if (result == undefined) {
            return undefined;
        }
        return resultMapper(...result);
    });
}

export function createStoredConfigurationAtom(configurationSessionAtom: Selectors["configurationSessionAtom"]) {
    return subscribeToSession<OnStoredConfigurationChangedHandler, StoredConfiguration>(configurationSessionAtom, (s, h) => s.addStoredConfigurationChangedListener(h), (s) => s);
}

export function createDecisionsAtom(configurationSessionAtom: Selectors["configurationSessionAtom"]) {
    return subscribeToSession<OnDecisionsChangedHandler<CollectedDecision>, ReadonlyArray<CollectedDecision>>(configurationSessionAtom, (s, h) => s.addDecisionsChangedListener(h), s => s);
}

export function createExplicitDecisionsAtom(configurationSessionAtom: Selectors["configurationSessionAtom"]) {
    return subscribeToSession<OnDecisionsChangedHandler<CollectedExplicitDecision>, ReadonlyArray<CollectedExplicitDecision>>(configurationSessionAtom, (s, h) => s.addDecisionsChangedListener(DecisionKind.Explicit, h), s => s);
}

export function createImplicitDecisionsAtom(configurationSessionAtom: Selectors["configurationSessionAtom"]) {
    return subscribeToSession<OnDecisionsChangedHandler<CollectedImplicitDecision>, ReadonlyArray<CollectedImplicitDecision>>(configurationSessionAtom, (s, h) => s.addDecisionsChangedListener(DecisionKind.Implicit, h), s => s);
}