import {atom as newAtom, Atom} from "jotai";
import {WritableAtom} from "jotai";
import {selectAtom} from "jotai/utils";
import {EqT, identity} from "@viamedici-spc/fp-ts-extensions";

export default function atomWithEq<Value>(atom: Atom<Value>, eq: EqT<Value>): Atom<Value>
export default function atomWithEq<Value, Args extends unknown[], Result>(atom: WritableAtom<Value, Args, Result>, eq: EqT<Value>): WritableAtom<Value, Args, Result>
export default function atomWithEq<Value, Args extends unknown[], Result>(atom: Atom<Value> | WritableAtom<Value, Args, Result>, eq: EqT<Value>): Atom<Value> | WritableAtom<Value, Args, Result> {
    const stableAtom = selectAtom(atom, identity, eq.equals);

    if ('write' in atom) {
        return newAtom<Value, Args, Result>(get => get(stableAtom), (_, set, ...args) => set(atom, ...args));
    }

    return stableAtom;
}