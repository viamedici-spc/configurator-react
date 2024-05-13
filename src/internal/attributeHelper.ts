import {
    Attribute,
    AttributeType,
    BooleanAttribute,
    ChoiceAttribute,
    ComponentAttribute,
    ConfigurationInterpreter,
    Decision,
    DecisionKind,
    ExplicitBooleanDecision,
    ExplicitChoiceDecision,
    ExplicitComponentDecision,
    ExplicitDecision,
    ExplicitNumericDecision, GlobalAttributeId,
    NumericAttribute,
} from "@viamedici-spc/configurator-ts";
import {none, O, Option, pipe, RA, some} from "@viamedici-spc/fp-ts-extensions";
import * as Refinement from "fp-ts/Refinement";

const choiceAttributeRefinement = Refinement.fromOptionK<Attribute, ChoiceAttribute>(a => a.type === AttributeType.Choice ? some(a) : none);
const numericAttributeRefinement = Refinement.fromOptionK<Attribute, NumericAttribute>(a => a.type === AttributeType.Numeric ? some(a) : none);
const booleanAttributeRefinement = Refinement.fromOptionK<Attribute, BooleanAttribute>(a => a.type === AttributeType.Boolean ? some(a) : none);
const componentAttributeRefinement = Refinement.fromOptionK<Attribute, ComponentAttribute>(a => a.type === AttributeType.Component ? some(a) : none);

function hasExplicitResettableDecision(attribute: { decision: Decision<any> }): boolean {
    return attribute.decision != null && attribute.decision.kind === DecisionKind.Explicit;
}

export function getChoiceAttributeResetDecisions(attribute: ChoiceAttribute): ReadonlyArray<ExplicitDecision> {
    return pipe(
        attribute.values,
        RA.filter(hasExplicitResettableDecision),
        RA.map(v => ({
            type: AttributeType.Choice,
            attributeId: attribute.id,
            choiceValueId: v.id,
            state: null
        }) as ExplicitChoiceDecision)
    );
}

function getNumericResetDecision(attribute: NumericAttribute): Option<ExplicitDecision> {
    return pipe(
        attribute,
        O.fromPredicate(hasExplicitResettableDecision),
        O.map(() => ({
            type: AttributeType.Numeric,
            attributeId: attribute.id,
            state: null
        }) as ExplicitNumericDecision)
    );
}

function getBooleanResetDecision(attribute: BooleanAttribute): Option<ExplicitDecision> {
    return pipe(
        attribute,
        O.fromPredicate(hasExplicitResettableDecision),
        O.map(() => ({
            type: AttributeType.Boolean,
            attributeId: attribute.id,
            state: null
        }) as ExplicitBooleanDecision)
    );
}

function getComponentResetDecision(attribute: ComponentAttribute): Option<ExplicitDecision> {
    return pipe(
        attribute,
        O.fromPredicate(hasExplicitResettableDecision),
        O.map(() => ({
            type: AttributeType.Component,
            attributeId: attribute.id,
            state: null
        }) as ExplicitComponentDecision)
    );
}

export function getComponentSubtreeResetDecisions(attributeId: GlobalAttributeId, attributes: ReadonlyArray<Attribute>): ReadonlyArray<ExplicitDecision> {
    return pipe(
        ConfigurationInterpreter.filterAttributesOfComponent(attributes, attributeId, true),
        attributes => [
            pipe(
                attributes,
                RA.filter(choiceAttributeRefinement),
                RA.chain(getChoiceAttributeResetDecisions)
            ),
            pipe(
                attributes,
                RA.filter(numericAttributeRefinement),
                RA.map(getNumericResetDecision),
                RA.compact
            ),
            pipe(
                attributes,
                RA.filter(booleanAttributeRefinement),
                RA.map(getBooleanResetDecision),
                RA.compact
            ),
            pipe(
                attributes,
                RA.filter(componentAttributeRefinement),
                RA.map(getComponentResetDecision),
                RA.compact
            )
        ],
        RA.flatten
    );
}