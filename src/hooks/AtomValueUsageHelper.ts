import type {Selectors} from "../internal/jotai/Selectors";
import type {AtomFamily} from "jotai-family";
import type {GlobalAttributeId, GlobalAttributeIdKey} from "@viamedici-spc/configurator-ts";
import {GlobalAttributeIdKeyBuilder} from "@viamedici-spc/configurator-ts";
import type {SuspendedAtoms} from "../internal/jotai/SuspendedAtoms";
import type {Atom} from "jotai";
import {useAtomValue, useSetAtom} from "jotai";
import type {ConfigurationUninitialized, GuardedAtom} from "../types";
import {useEffect, useMemo} from "react";
import {useAtomsContext, useConfiguratorStore} from "../internal/contexts";
import type {EqT} from "@viamedici-spc/fp-ts-extensions";
import {Bool, Eq, Str} from "@viamedici-spc/fp-ts-extensions";
import {useStableMemo} from "fp-ts-react-stable-hooks";
import type {PromiseOrValue} from "../internal/Types";
import type {Atoms} from "../internal/jotai/Atoms";

export function prepareParameterizedAtomValueUsageWithSuspense<Value, T extends ReadonlyArray<unknown>>(
    normalSelector: (atoms: Atoms, ...args: T) => GuardedAtom<Value>,
    suspendedSelector: (atoms: Atoms, ...args: T) => Atom<PromiseOrValue<Value>>,
    argsEq: EqT<T>,
) {
    const stableMemoEq = Eq.tuple(Eq.eqNullable(Bool.Eq), argsEq);
    return (suspend: boolean | undefined, ...args: T): Value | ConfigurationUninitialized => {
        const atoms = useAtomsContext();
        const store = useConfiguratorStore();
        const subscribe = useSetAtom(atoms.selectors.subscriberAtom, {store});

        const atom = useStableMemo(
            () => ((suspend ?? true) ? suspendedSelector(atoms, ...args) : normalSelector(atoms, ...args)),
            [suspend, args],
            stableMemoEq,
        );
        const subscription = useMemo(() => subscribe(atom), [subscribe, atom]);

        useEffect(() => {
            return () => {
                subscription.unsubscribe();
            };
        }, [subscription]);

        return useAtomValue(atom, {store});
    };
}

export function prepareAtomValueUsageWithSuspense<Value>(
    normalSelector: (selectors: Selectors) => GuardedAtom<Value>,
    suspendedSelector: (suspended: SuspendedAtoms) => Atom<PromiseOrValue<Value>>,
): {
    (): Value;
    (suspend: false): Value | ConfigurationUninitialized;
} {
    const use = prepareParameterizedAtomValueUsageWithSuspense<Value, []>(
        a => normalSelector(a.selectors),
        a => suspendedSelector(a.suspended),
        Eq.tuple(),
    );

    function useAtomValueWithSuspense(): Value;
    function useAtomValueWithSuspense(suspend: false): Value | ConfigurationUninitialized;
    function useAtomValueWithSuspense(suspend?: false): Value | ConfigurationUninitialized {
        return use(suspend);
    }

    return useAtomValueWithSuspense;
}

export function prepareAttributeUsageWithSuspense<Value>(
    normalSelector: (selectors: Selectors) => AtomFamily<GlobalAttributeIdKey, GuardedAtom<Value>>,
    suspendedSelector: (suspended: SuspendedAtoms) => AtomFamily<GlobalAttributeIdKey, Atom<PromiseOrValue<Value>>>,
): {
    (attributeIdOrKey: GlobalAttributeId | GlobalAttributeIdKey): Value;
    (attributeIdOrKey: GlobalAttributeId | GlobalAttributeIdKey, suspend: false): Value | ConfigurationUninitialized;
} {
    const use = prepareParameterizedAtomValueUsageWithSuspense<Value, [GlobalAttributeIdKey]>(
        (a, key) => normalSelector(a.selectors)(key),
        (a, key) => suspendedSelector(a.suspended)(key),
        Eq.tuple(Str.Eq),
    );

    function useAttributeWithSuspense(attributeIdOrKey: GlobalAttributeId | GlobalAttributeIdKey): Value;
    function useAttributeWithSuspense(
        attributeIdOrKey: GlobalAttributeId | GlobalAttributeIdKey,
        suspend: false,
    ): Value | ConfigurationUninitialized;
    function useAttributeWithSuspense(
        attributeIdOrKey: GlobalAttributeId | GlobalAttributeIdKey,
        suspend?: false,
    ): Value | ConfigurationUninitialized {
        const key = useMemo(
            () =>
                typeof attributeIdOrKey === "string" ? attributeIdOrKey : GlobalAttributeIdKeyBuilder(attributeIdOrKey),
            [attributeIdOrKey],
        );

        return use(suspend, key);
    }

    return useAttributeWithSuspense;
}