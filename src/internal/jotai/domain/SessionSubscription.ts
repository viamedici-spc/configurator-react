import {atomFamily} from "jotai/utils";
import {Attribute, Configuration, GlobalAttributeIdKey, GlobalAttributeIdKeyBuilder, Logger} from "@viamedici-spc/configurator-ts";
import {atom, PrimitiveAtom} from "jotai";
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