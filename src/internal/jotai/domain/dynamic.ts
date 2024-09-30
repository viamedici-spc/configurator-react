import {Attribute, GlobalAttributeId, GlobalAttributeIdKey, GlobalAttributeIdKeyBuilder} from "@viamedici-spc/configurator-ts";
import {identity, O, Ord, OrdT, pipe, RA, RM} from "@viamedici-spc/fp-ts-extensions";
import {Selectors} from "../Selectors";
import {GuardedAtom} from "../../../types";
import atomWithGuard from "../helper/atomWithGuard";

export function createAttributesAtom(selectors: Selectors): {
    (attributes: "all"): GuardedAtom<ReadonlyArray<Attribute>>
    (attributes: ReadonlyArray<GlobalAttributeId | GlobalAttributeIdKey>, filterMissingAttributes: true): GuardedAtom<ReadonlyArray<Attribute>>
    (attributes: ReadonlyArray<GlobalAttributeId | GlobalAttributeIdKey>, filterMissingAttributes: false): GuardedAtom<ReadonlyArray<Attribute | undefined>>
    (attributes: ReadonlyArray<GlobalAttributeId | GlobalAttributeIdKey> | "all", filterMissingAttributes?: boolean): GuardedAtom<ReadonlyArray<Attribute | undefined>>
} {
    const {guardedConfigurationAtom, guardedAttributesAtom} = selectors;

    function createAtom(attributes: "all"): GuardedAtom<ReadonlyArray<Attribute>>
    function createAtom(attributes: ReadonlyArray<GlobalAttributeId | GlobalAttributeIdKey>, filterMissingAttributes: boolean): GuardedAtom<ReadonlyArray<Attribute>>
    function createAtom(attributes: ReadonlyArray<GlobalAttributeId | GlobalAttributeIdKey> | "all", filterMissingAttributes?: boolean): GuardedAtom<ReadonlyArray<Attribute | undefined>> {
        const attributeKeys = attributes === "all"
            ? "all"
            : pipe(
                attributes,
                RA.map(idOrKey => typeof idOrKey === "string" ? idOrKey : GlobalAttributeIdKeyBuilder(idOrKey))
            );

        return atomWithGuard<ReadonlyArray<Attribute | undefined>>((get, getGuarded) => {
            if (attributeKeys === "all") {
                return pipe(guardedConfigurationAtom, getGuarded, c => c.attributes, RM.values(Ord.trivial as OrdT<Attribute>));
            }

            const attributes = getGuarded(guardedAttributesAtom);

            return pipe(
                attributeKeys,
                RA.map(key => get(attributes(key))),
                filterMissingAttributes ? RA.filterMap(O.fromNullable) : identity
            );
        });
    }

    return createAtom;
}