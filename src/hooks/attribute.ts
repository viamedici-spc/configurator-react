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
 * Retrieves all existing attributes.
 * @param attributes Set to "all" to retrieve all existing attributes.
 * @remarks Will suspend until the Configuration is fully initialized.
 */
export function useAttributes(attributes: "all"): ReadonlyArray<Attribute>
/**
 * Retrieves all existing attributes.
 * @param attributes Set to "all" to retrieve all existing attributes.
 * @param suspend Whether to disable the Suspense API.
 */
export function useAttributes(attributes: "all", suspend: false): ReadonlyArray<Attribute> | ConfigurationUninitialized
/**
 * Retrieves the requested attributes.
 * @param attributes The attributes to return.
 * @param filterMissingAttributes Whether to ignore that requested attributes are missing. Missing attributes will be filtered out of the result.
 * @returns The requested attributes in the order of the {@link attributes} parameter.
 * @remarks Will suspend until the Configuration is fully initialized.
 */
export function useAttributes(attributes: ReadonlyArray<GlobalAttributeId | GlobalAttributeIdKey>, filterMissingAttributes: true): ReadonlyArray<Attribute>
/**
 * Retrieves the requested attributes.
 * @param attributes The attributes to return.
 * @param filterMissingAttributes Whether to ignore that requested attributes are missing. Missing attributes appear as undefined in the result.
 * @returns The requested attributes in the order of the {@link attributes} parameter.
 * @remarks Will suspend until the Configuration is fully initialized.
 */
export function useAttributes(attributes: ReadonlyArray<GlobalAttributeId | GlobalAttributeIdKey>, filterMissingAttributes: false): ReadonlyArray<Attribute | undefined>
/**
 * Retrieves the requested attributes.
 * @param attributes The attributes to return.
 * @param filterMissingAttributes Whether to ignore that requested attributes are missing. Missing attributes will be filtered out of the result.
 * @returns The requested attributes in the order of the {@link attributes} parameter.
 * @param suspend Whether to disable the Suspense API.
 */
export function useAttributes(attributes: ReadonlyArray<GlobalAttributeId | GlobalAttributeIdKey>, filterMissingAttributes: true, suspend: false): ReadonlyArray<Attribute | undefined> | ConfigurationUninitialized
/**
 * Retrieves the requested attributes.
 * @param attributes The attributes to return.
 * @param filterMissingAttributes Whether to ignore that requested attributes are missing. Missing attributes appear as undefined in the result.
 * @returns The requested attributes in the order of the {@link attributes} parameter.
 * @param suspend Whether to disable the Suspense API.
 */
export function useAttributes(attributes: ReadonlyArray<GlobalAttributeId | GlobalAttributeIdKey>, filterMissingAttributes: false, suspend: false): ReadonlyArray<Attribute> | ConfigurationUninitialized
export function useAttributes(attributes: ReadonlyArray<GlobalAttributeId | GlobalAttributeIdKey> | "all", suspendOrFilterMissingAttributesOrUndefined?: boolean, suspendOrUndefined?: boolean): ReadonlyArray<Attribute | undefined> | ConfigurationUninitialized {
    const suspend = attributes == "all" ? suspendOrFilterMissingAttributesOrUndefined : suspendOrUndefined;
    const filterMissingAttributes = attributes == "all" ? undefined : suspendOrFilterMissingAttributesOrUndefined;

    return preparedUseAttributes(suspend, attributes, filterMissingAttributes);
}

export const useChoiceAttribute: {
    /**
     * Gets the requested choice attribute with specific commands and queries.
     * @param attributeIdOrKey The id or key of the choice attribute.
     * @returns Undefined if attribute doesn't exist, or it is not a choice attribute.
     * @remarks Will suspend until the Configuration is fully initialized.
     */
    (attributeIdOrKey: GlobalAttributeId | GlobalAttributeIdKey): UseChoiceAttributeResult | undefined;
    /**
     * Gets the requested choice attribute with specific commands and queries.
     * @param attributeIdOrKey The id or key of the choice attribute.
     * @param suspend Whether to disable the Suspense API.
     * @returns Undefined if attribute doesn't exist, or it is not a choice attribute.
     */
    (attributeIdOrKey: GlobalAttributeId | GlobalAttributeIdKey, suspend: false): UseChoiceAttributeResult | undefined | ConfigurationUninitialized;
} = prepareAttributeUsageWithSuspense<UseChoiceAttributeResult | undefined>(s => s.choiceAttributeAtomFamily, s => s.choiceAttributeAtomFamily);

export const useNumericAttribute: {
    /**
     * Gets the requested numeric attribute with specific commands and queries.
     * @param attributeIdOrKey The id or key of the numeric attribute.
     * @returns Undefined if attribute doesn't exist, or it is not a numeric attribute.
     * @remarks Will suspend until the Configuration is fully initialized.
     */
    (attributeIdOrKey: GlobalAttributeId | GlobalAttributeIdKey): UseNumericAttributeResult | undefined;
    /**
     * Gets the requested numeric attribute with specific commands and queries.
     * @param attributeIdOrKey The id or key of the numeric attribute.
     * @param suspend Whether to disable the Suspense API.
     * @returns Undefined if attribute doesn't exist, or it is not a numeric attribute.
     */
    (attributeIdOrKey: GlobalAttributeId | GlobalAttributeIdKey, suspend: false): UseNumericAttributeResult | undefined | ConfigurationUninitialized;
} = prepareAttributeUsageWithSuspense<UseNumericAttributeResult | undefined>(s => s.numericAttributeAtomFamily, s => s.numericAttributeAtomFamily);

export const useBooleanAttribute: {
    /**
     * Gets the requested boolean attribute with specific commands and queries.
     * @param attributeIdOrKey The id of the boolean attribute.
     * @returns Undefined if attribute doesn't exist, or it is not a boolean attribute.
     * @remarks Will suspend until the Configuration is fully initialized.
     */
    (attributeIdOrKey: GlobalAttributeId | GlobalAttributeIdKey): UseBooleanAttributeResult | undefined;
    /**
     * Gets the requested boolean attribute with specific commands and queries.
     * @param attributeIdOrKey The id of the boolean attribute.
     * @param suspend Whether to disable the Suspense API.
     * @returns Undefined if attribute doesn't exist, or it is not a boolean attribute.
     */
    (attributeIdOrKey: GlobalAttributeId | GlobalAttributeIdKey, suspend: false): UseBooleanAttributeResult | undefined | ConfigurationUninitialized;
} = prepareAttributeUsageWithSuspense<UseBooleanAttributeResult | undefined>(s => s.booleanAttributeAtomFamily, s => s.booleanAttributeAtomFamily);

export const useComponentAttribute: {
    /**
     * Gets the requested component attribute with specific commands and queries.
     * @param attributeIdOrKey The id of the component attribute.
     * @returns Undefined if attribute doesn't exist, or it is not a component attribute.
     * @remarks Will suspend until the Configuration is fully initialized.
     */
    (attributeIdOrKey: GlobalAttributeId | GlobalAttributeIdKey): UseComponentAttributeResult | undefined;
    /**
     * Gets the requested component attribute with specific commands and queries.
     * @param attributeIdOrKey The id of the component attribute.
     * @param suspend Whether to disable the Suspense API.
     * @returns Undefined if attribute doesn't exist, or it is not a component attribute.
     */
    (attributeIdOrKey: GlobalAttributeId | GlobalAttributeIdKey, suspend: false): UseComponentAttributeResult | undefined | ConfigurationUninitialized;
} = prepareAttributeUsageWithSuspense<UseComponentAttributeResult | undefined>(s => s.componentAttributeAtomFamily, s => s.componentAttributeAtomFamily);