import type {Atom, PrimitiveAtom} from "jotai";
import type {Subscription} from "../../Types";
import {atom} from "jotai";
import {RA, RM} from "@viamedici-spc/fp-ts-extensions";
import type {WritableAtom} from "jotai";
import type {Primitives} from "../PrimitveAtoms";
import {guid} from "dyna-guid";
import {atomEffect} from "jotai-effect";
import {Logger} from "@viamedici-spc/configurator-ts";

const atomSubscriptionCleanupInterval = 30 * 1000;

export type WeakSubscription = {
    deref: () => Subscription | undefined;
};

const createWeakRef: (subscription: Subscription) => WeakSubscription =
    WeakRef != null
        ? subscription => new WeakRef(subscription)
        : subscription => ({
              deref: () => subscription,
          });

export type AtomSubscriptionsAtomType = PrimitiveAtom<ReadonlyMap<Atom<any>, ReadonlyMap<string, WeakSubscription>>>;
export type SubscriberAtomType = WritableAtom<unknown, [atomToSubscribeTo: Atom<any>], Subscription>;

export function createAtomSubscriptionAtom(): AtomSubscriptionsAtomType {
    return atom<ReadonlyMap<Atom<any>, ReadonlyMap<string, WeakSubscription>>>(RM.empty);
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
            unsubscribe: unsubscribe,
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

// A derived atom, not an effect: mounting it keeps every subscribed atom mounted, and its dependencies stay registered
// while one of them suspends or throws, which an effect's do not (jotai-effect on Jotai 2.18 and newer).
export function createAtomSubscriberEffect(primitives: Primitives): Atom<void> {
    return atom(get => {
        const subscriptions = get(primitives.subscriptionsAtom);
        const atoms = [...subscriptions.keys()];
        Logger.debug("AtomSubscriber:", "There are", atoms.length, "Atoms to subscribe to.");
        for (const subscribedAtom of atoms) {
            try {
                get(subscribedAtom);
            } catch {
                // The dependency is registered even when the atom throws; the reading component gets the error.
            }
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
                // The keys are copied first because entries are deleted inside the loops.
                // oxlint-disable-next-line unicorn/no-useless-spread
                for (const atom of [...newSubscriptions.keys()]) {
                    const atomSubscriptions = new Map(newSubscriptions.get(atom) ?? RM.empty);
                    // oxlint-disable-next-line unicorn/no-useless-spread
                    for (const subscriptionId of [...atomSubscriptions.keys()]) {
                        const subscription = atomSubscriptions.get(subscriptionId);
                        if (subscription === undefined || subscription.deref() === undefined) {
                            Logger.debug(
                                "AtomSubscriptionCleanup:",
                                "Deleting subscription",
                                subscriptionId,
                                "because it got garbage collected.",
                            );
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

                Logger.debug(
                    "AtomSubscriptionCleanup:",
                    "There are",
                    newSubscriptions.size,
                    "Atoms with",
                    [...newSubscriptions.values(), RA.flatten].length,
                    "subscriptions left.",
                );

                return didChange ? newSubscriptions : existingSubscriptions;
            });
        }, atomSubscriptionCleanupInterval);

        return () => {
            clearInterval(interval);
        };
    });
}