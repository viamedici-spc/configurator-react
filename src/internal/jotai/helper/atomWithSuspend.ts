import {Atom, atom} from "jotai";
import {selectAtom} from "jotai/utils";
import pDefer, {DeferredPromise} from "p-defer";
import {ConfigurationUninitialized, GuardedAtom} from "../../../types";
import {PromiseOrValue} from "../../Types";

export default function atomWithSuspend<Value>(guardedAtom: GuardedAtom<Value>): Atom<PromiseOrValue<Value>> {
    const base = selectAtom<Value | ConfigurationUninitialized, {
        deferredPromise: DeferredPromise<Value> | null,
        result: Promise<Value> | Value
    }>(guardedAtom, (value, previous) => {
        if (value !== ConfigurationUninitialized) {
            if (previous?.deferredPromise != null) {
                previous.deferredPromise.resolve(value);

                // If there was a promise that is already known, there is no need to return the value unwrapped.
                // Otherwise, unwrapping the value would result in an additional update.
                return {
                    deferredPromise: null,
                    result: previous.deferredPromise.promise
                };
            }

            return {
                deferredPromise: null,
                result: value
            };
        }

        const deferredPromise = previous?.deferredPromise ?? pDefer();

        return {
            deferredPromise: deferredPromise,
            result: deferredPromise.promise
        };
    });

    return atom(get => get(base).result);
}