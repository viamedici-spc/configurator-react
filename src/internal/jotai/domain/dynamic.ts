import type {Attribute, GlobalAttributeId, GlobalAttributeIdKey} from "@viamedici-spc/configurator-ts";
import {GlobalAttributeIdKeyBuilder} from "@viamedici-spc/configurator-ts";
import type {OrdT} from "@viamedici-spc/fp-ts-extensions";
import {identity, O, Ord, pipe, RA, RM} from "@viamedici-spc/fp-ts-extensions";
import type {Selectors} from "../Selectors";
import type {GuardedAtom} from "../../../types";
import atomWithGuard from "../helper/atomWithGuard";

export function createAttributesAtom(selectors: Selectors): {
    (attributes: "all"): GuardedAtom<ReadonlyArray<Attribute>>;
    (
        attributes: ReadonlyArray<GlobalAttributeId | GlobalAttributeIdKey>,
        filterMissingAttributes: true,
    ): GuardedAtom<ReadonlyArray<Attribute>>;
    (
        attributes: ReadonlyArray<GlobalAttributeId | GlobalAttributeIdKey>,
        filterMissingAttributes: false,
    ): GuardedAtom<ReadonlyArray<Attribute | undefined>>;
    (
        attributes: ReadonlyArray<GlobalAttributeId | GlobalAttributeIdKey> | "all",
        filterMissingAttributes?: boolean,
    ): GuardedAtom<ReadonlyArray<Attribute | undefined>>;
} {
    const {guardedConfigurationAtom, guardedAttributesAtom} = selectors;

    function createAtom(attributes: "all"): GuardedAtom<ReadonlyArray<Attribute>>;
    function createAtom(
        attributes: ReadonlyArray<GlobalAttributeId | GlobalAttributeIdKey>,
        filterMissingAttributes: true,
    ): GuardedAtom<ReadonlyArray<Attribute>>;
    function createAtom(
        attributes: ReadonlyArray<GlobalAttributeId | GlobalAttributeIdKey>,
        filterMissingAttributes: false,
    ): GuardedAtom<ReadonlyArray<Attribute | undefined>>;
    function createAtom(
        attributes: ReadonlyArray<GlobalAttributeId | GlobalAttributeIdKey> | "all",
        filterMissingAttributes?: boolean,
    ): GuardedAtom<ReadonlyArray<Attribute | undefined>>;
    function createAtom(
        attributes: ReadonlyArray<GlobalAttributeId | GlobalAttributeIdKey> | "all",
        filterMissingAttributes?: boolean,
    ): GuardedAtom<ReadonlyArray<Attribute | undefined>> {
        const attributeKeys =
            attributes === "all"
                ? "all"
                : pipe(
                      attributes,
                      RA.map(idOrKey => (typeof idOrKey === "string" ? idOrKey : GlobalAttributeIdKeyBuilder(idOrKey))),
                  );

        return atomWithGuard<ReadonlyArray<Attribute | undefined>>((get, getGuarded) => {
            if (attributeKeys === "all") {
                return pipe(
                    guardedConfigurationAtom,
                    getGuarded,
                    c => c.attributes,
                    RM.values(Ord.trivial as OrdT<Attribute>),
                );
            }

            const attributes = getGuarded(guardedAttributesAtom);

            return pipe(
                attributeKeys,
                RA.map(key => get(attributes(key))),
                filterMissingAttributes ? RA.filterMap(O.fromNullable) : identity,
            );
        });
    }

    return createAtom;
}