import {atomEffect} from "jotai-effect";
import {Logger} from "@viamedici-spc/configurator-ts";
import {Primitives} from "./PrimitveAtoms";
import {Selectors} from "./Selectors";
import {Atom} from "jotai";
import {createAtomSubscriptionCleanupEffect, createAtomSubscriberEffect} from "./domain/AtomSubscription";
import {SuspendedAtoms} from "./SuspendedAtoms";
import {createAddSessionListenersEffect} from "./domain/SessionSubscription";

const atomFamilyCleanupTimeout = 30 * 1000;

export type Effects = {
    addSessionListenersEffect: Atom<void>;
    cleanupAtomFamiliesEffect: Atom<void>;
    atomSubscriberEffect: Atom<void>;
    atomSubscriptionCleanupEffect: Atom<void>;
};

/**
 * Cleans family members that point to nullish values.
 * @remarks If a view component is constantly watching a nullish family member, those members get removed and recreated every time the effect is executed.
 */
function createCleanupAtomFamiliesEffect(primitives: Primitives, selectors: Selectors, suspended: SuspendedAtoms) {
    const families = [
        selectors.choiceAttributeAtomFamily,
        selectors.booleanAttributeAtomFamily,
        selectors.numericAttributeAtomFamily,
        selectors.componentAttributeAtomFamily,

        suspended.choiceAttributeAtomFamily,
        suspended.booleanAttributeAtomFamily,
        suspended.numericAttributeAtomFamily,
        suspended.componentAttributeAtomFamily,
    ];

    return atomEffect((get) => {
        // Subscribe to configuration so that every change to the configuration reschedules the timeout.
        get(primitives.configurationAtom);

        const attributes = get(primitives.attributesAtom);
        if (attributes == null) {
            return;
        }

        Logger.debug("Scheduling atomFamily cleanup");
        const timeout = setTimeout(() => {
            Logger.debug("Cleaning up atomFamilies");

            // Clear attributes family
            for (const param of [...attributes.getParams()]) {
                const atom = attributes(param) as Atom<any>;
                if (get.peek(atom) == null) {
                    Logger.debug("Removing attribute from attributes family because it is nullish", param);
                    attributes.remove(param);
                }
            }
            const existingAttributeKeys = [...attributes.getParams()];

            // Remove all family members that point non-existent attributes.
            for (const family of families) {
                for (const param of [...family.getParams()]) {
                    if (!existingAttributeKeys.includes(param)) {
                        family.remove(param);
                    }
                }
            }
        }, atomFamilyCleanupTimeout);

        return () => {
            clearTimeout(timeout);
        };
    });
}

export function createEffects(primitives: Primitives, selectors: Selectors, suspended: SuspendedAtoms): Effects {
    return {
        addSessionListenersEffect: createAddSessionListenersEffect(primitives, selectors),
        cleanupAtomFamiliesEffect: createCleanupAtomFamiliesEffect(primitives, selectors, suspended),
        atomSubscriberEffect: createAtomSubscriberEffect(primitives),
        atomSubscriptionCleanupEffect: createAtomSubscriptionCleanupEffect(primitives),
    };
}