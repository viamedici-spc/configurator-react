import type { Getter} from "jotai";
import {atom} from "jotai";
import type { GuardedAtom} from "../../../types";
import {ConfigurationUninitialized} from "../../../types";

export type GuardedGetter = <Value>(atom: GuardedAtom<Value>) => Value;
export default function atomWithGuard<Value>(read: (get: Getter, getGuarded: GuardedGetter) => Value | ConfigurationUninitialized): GuardedAtom<Value> {
    return atom(get => {
        try {
            return read(get, a => {
                const value = get(a);
                if (value === ConfigurationUninitialized) {
                    throw ConfigurationUninitialized;
                }
                return value;
            });
        } catch (e) {
            if (e === ConfigurationUninitialized) {
                return ConfigurationUninitialized;
            }

            throw e;
        }
    });

}