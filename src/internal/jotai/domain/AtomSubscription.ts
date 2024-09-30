import {Atom, PrimitiveAtom} from "jotai";
import {Subscription} from "../../Types";
import {atom} from "jotai";
import {RA, RM} from "@viamedici-spc/fp-ts-extensions";
import {WritableAtom} from "jotai/vanilla/atom";
import {Primitives} from "../PrimitveAtoms";
import {guid} from "dyna-guid";
import {atomEffect} from "jotai-effect";
import {Logger} from "@viamedici-spc/configurator-ts";

const atomSubscriptionCleanupInterval = 30 * 1000;

export type WeakSubscription = {
    deref: () => Subscription | undefined
};

const createWeakRef: (subscription: Subscription) => WeakSubscription = WeakRef != null
    ? ((subscription) => new WeakRef(subscription))
    : ((subscription) => ({
        deref: () => subscription,
    }));

export type AtomSubscriptionsAtomType = PrimitiveAtom<ReadonlyMap<Atom<any>, ReadonlyMap<string, WeakSubscription>>>;
export type SubscriberAtomType = WritableAtom<unknown, [atomToSubscribeTo: Atom<any>], Subscription>;

export function createAtomSubscriptionAtom(): AtomSubscriptionsAtomType {
    return atom(RM.empty);
}

export function createSubscriberAtom(primitives: Primitives): SubscriberAtomType {
    return atom(null, (_, set, atomToSubscribeTo: Atom<any>): Subscription => {
        const subscriptionId = guid();

        Logger.debug("AtomSubscription:", "Creating subscription with id", subscriptionId);
        const unsubscribe = () => {
            set(primitives.subscriptionsAtom, m => {
                const existingSubscriptions = m.get(atomToSubscribeTo);
                // Atom has no subscriptions
                if (existingSubscriptions == undefined) {
                    return m;
                }

                const newSubscriptions = new Map(existingSubscriptions);
                newSubscriptions.delete(subscriptionId);

                const newMap = new Map(m);
                newMap.set(atomToSubscribeTo, newSubscriptions);

                return newMap;
            });
        };

        const subscription = {
            unsubscribe: unsubscribe
        } satisfies Subscription;

        set(primitives.subscriptionsAtom, m => {
            const newSubscriptions = new Map(m.get(atomToSubscribeTo) ?? RM.empty);
            newSubscriptions.set(subscriptionId, createWeakRef(subscription));

            const newMap = new Map(m);
            newMap.set(atomToSubscribeTo, newSubscriptions);
            return newMap;
        });

        return subscription;
    });
}

export function createAtomSubscriberEffect(primitives: Primitives) {
    return atomEffect((get) => {
        const subscriptions = get(primitives.subscriptionsAtom);
        const atoms = [...subscriptions.keys()];
        Logger.debug("AtomSubscriber:", "There are", atoms.length, "Atoms to subscribe to.");
        for (const atom of atoms) {
            get(atom);
        }
    });
}

export function createAtomSubscriptionCleanupEffect(primitives: Primitives) {
    return atomEffect((_, set) => {
        const interval = setInterval(() => {
            Logger.info("AtomSubscriptionCleanup:", "Running cleanup");
            let didChange = false;
            set(primitives.subscriptionsAtom, existingSubscriptions => {
                const newSubscriptions = new Map(existingSubscriptions);
                for (const atom of [...newSubscriptions.keys()]) {
                    const atomSubscriptions = new Map(newSubscriptions.get(atom) ?? RM.empty);
                    for (const subscriptionId of [...atomSubscriptions.keys()]) {
                        const subscription = atomSubscriptions.get(subscriptionId);
                        if (subscription === undefined || subscription.deref() === undefined) {
                            Logger.debug("AtomSubscriptionCleanup:", "Deleting subscription", subscriptionId, "because it got garbage collected.");
                            atomSubscriptions.delete(subscriptionId);
                            didChange = true;
                        }
                    }
                    newSubscriptions.set(atom, atomSubscriptions);

                    if (atomSubscriptions.size === 0) {
                        Logger.debug("AtomSubscriptionCleanup:", "Delete Atom with 0 subscriptions.");
                        newSubscriptions.delete(atom);
                        didChange = true;
                    }
                }

                Logger.debug("AtomSubscriptionCleanup:", "There are", newSubscriptions.size, "Atoms with", [...newSubscriptions.values(), RA.flatten].length, "subscriptions left.");

                return didChange ? newSubscriptions : existingSubscriptions;
            });
        }, atomSubscriptionCleanupInterval);

        return () => {
            clearInterval(interval);
        };
    });
}