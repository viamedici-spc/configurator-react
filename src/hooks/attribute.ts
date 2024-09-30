import {
    Attribute,
    GlobalAttributeId, globalAttributeIdEq, GlobalAttributeIdKey, GlobalAttributeIdKeyBuilder, globalAttributeIdKeyEq
} from "@viamedici-spc/configurator-ts";
import {UseBooleanAttributeResult, UseChoiceAttributeResult, UseComponentAttributeResult, UseNumericAttributeResult} from "../internal/jotai/domain/attribute";
import {createAttributesAtom} from "../internal/jotai/domain/dynamic";
import {Bool, Eq, EqT, O, pipe, RA, Str} from "@viamedici-spc/fp-ts-extensions";
import {ConfigurationUninitialized} from "../types";
import {prepareAttributeUsageWithSuspense, prepareParameterizedAtomValueUsageWithSuspense} from "./AtomValueUsageHelper";
import atomWithSuspend from "../internal/jotai/helper/atomWithSuspend";

const attributeIdOrKeyEq = Eq.union<GlobalAttributeId | GlobalAttributeIdKey>()
    .with((x): x is GlobalAttributeIdKey => typeof x === "string", globalAttributeIdKeyEq)
    .with((x): x is GlobalAttributeId => typeof x === "object", globalAttributeIdEq);
const arrayOrAllEq = Eq.union<ReadonlyArray<GlobalAttributeId | GlobalAttributeIdKey> | "all">()
    .with((x): x is "all" => x === "all", Str.Eq as EqT<"all">)
    .with((x): x is ReadonlyArray<GlobalAttributeId | GlobalAttributeIdKey> => Array.isArray(x), RA.getEq(attributeIdOrKeyEq));

const preparedUseAttributes = prepareParameterizedAtomValueUsageWithSuspense<ReadonlyArray<Attribute | undefined>, [attributes: ReadonlyArray<GlobalAttributeId | GlobalAttributeIdKey> | "all", filterMissingAttributes: boolean | undefined]>(
    (s, attributes, filterMissingAttributes) => createAttributesAtom(s.selectors)(attributes, filterMissingAttributes),
    (s, attributes, filterMissingAttributes) => atomWithSuspend(createAttributesAtom(s.selectors)(attributes, filterMissingAttributes)),
    Eq.tuple(arrayOrAllEq, Eq.eqNullable(Bool.Eq))
);

/**
 * Retrieves the requested attributes. Will return all existing attributes if requested attributes is null or undefined.
 * @param attributes The attributes to return or null/undefined if all attributes shall be returned.
 * @param filterMissingAttributes Whether to ignore that requested attributes are missing. If true, missing attributes will be filtered out of the result.
 * Otherwise, they will appear as undefined. Only applicable if @param attributes has items.
 * @throws If configuration is initializing.
 */
export function useAttributes(attributes: "all"): ReadonlyArray<Attribute>
export function useAttributes(attributes: "all", suspend: false): ReadonlyArray<Attribute> | ConfigurationUninitialized
export function useAttributes(attributes: ReadonlyArray<GlobalAttributeId | GlobalAttributeIdKey>, filterMissingAttributes: true): ReadonlyArray<Attribute>
export function useAttributes(attributes: ReadonlyArray<GlobalAttributeId | GlobalAttributeIdKey>, filterMissingAttributes: false): ReadonlyArray<Attribute | undefined>
export function useAttributes(attributes: ReadonlyArray<GlobalAttributeId | GlobalAttributeIdKey>, filterMissingAttributes: true, suspend: false): ReadonlyArray<Attribute | undefined> | ConfigurationUninitialized
export function useAttributes(attributes: ReadonlyArray<GlobalAttributeId | GlobalAttributeIdKey>, filterMissingAttributes: false, suspend: false): ReadonlyArray<Attribute> | ConfigurationUninitialized
export function useAttributes(attributes: ReadonlyArray<GlobalAttributeId | GlobalAttributeIdKey> | "all", suspendOrFilterMissingAttributesOrUndefined?: boolean, suspendOrUndefined?: boolean): ReadonlyArray<Attribute | undefined> | ConfigurationUninitialized {
    const suspend = attributes == "all" ? suspendOrFilterMissingAttributesOrUndefined : suspendOrUndefined;
    const filterMissingAttributes = attributes == "all" ? undefined : suspendOrFilterMissingAttributesOrUndefined;

    return preparedUseAttributes(suspend, attributes, filterMissingAttributes);
}

/**
 * Gets the requested choice attribute with commands for making decisions or explaining consequences.
 * @param attributeId The id of the choice attribute.
 * @throws If configuration is initializing.
 * @returns Undefined if attribute doesn't exist, or it is not a choice attribute.
 */
export const useChoiceAttribute: {
    (attributeIdOrKey: GlobalAttributeId | GlobalAttributeIdKey): UseChoiceAttributeResult | undefined;
    (attributeIdOrKey: GlobalAttributeId | GlobalAttributeIdKey, suspend: false): UseChoiceAttributeResult | undefined | ConfigurationUninitialized;
} = prepareAttributeUsageWithSuspense<UseChoiceAttributeResult | undefined>(s => s.useChoiceAttribute, s => s.useChoiceAttribute);

/**
 * Gets the requested numeric attribute with the command to make decisions.
 * @param attributeId The id of the numeric attribute.
 * @throws If configuration is initializing.
 * @returns Undefined if attribute doesn't exist, or it is not a numeric attribute.
 */
export const useNumericAttribute: {
    (attributeIdOrKey: GlobalAttributeId | GlobalAttributeIdKey): UseNumericAttributeResult | undefined;
    (attributeIdOrKey: GlobalAttributeId | GlobalAttributeIdKey, suspend: false): UseNumericAttributeResult | undefined | ConfigurationUninitialized;
} = prepareAttributeUsageWithSuspense<UseNumericAttributeResult | undefined>(s => s.useNumericAttribute, s => s.useNumericAttribute);

/**
 * Gets the requested boolean attribute with the command to make decisions.
 * @param attributeId The id of the boolean attribute.
 * @throws If configuration is initializing.
 * @returns Undefined if attribute doesn't exist, or it is not a boolean attribute.
 */
export const useBooleanAttribute: {
    (attributeIdOrKey: GlobalAttributeId | GlobalAttributeIdKey): UseBooleanAttributeResult | undefined;
    (attributeIdOrKey: GlobalAttributeId | GlobalAttributeIdKey, suspend: false): UseBooleanAttributeResult | undefined | ConfigurationUninitialized;
} = prepareAttributeUsageWithSuspense<UseBooleanAttributeResult | undefined>(s => s.useBooleanAttribute, s => s.useBooleanAttribute);

/**
 * Gets the requested component attribute with the command to make decisions.
 * @param attributeId The id of the component attribute.
 * @throws If configuration is initializing.
 * @returns Undefined if attribute doesn't exist, or it is not a component attribute.
 */
export const useComponentAttribute: {
    (attributeIdOrKey: GlobalAttributeId | GlobalAttributeIdKey): UseComponentAttributeResult | undefined;
    (attributeIdOrKey: GlobalAttributeId | GlobalAttributeIdKey, suspend: false): UseComponentAttributeResult | undefined | ConfigurationUninitialized;
} = prepareAttributeUsageWithSuspense<UseComponentAttributeResult | undefined>(s => s.useComponentAttribute, s => s.useComponentAttribute);