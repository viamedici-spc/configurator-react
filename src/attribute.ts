import {
    Attribute,
    AttributeType,
    BooleanAttribute,
    ChoiceAttribute,
    ChoiceValueDecisionState,
    ChoiceValueId,
    ComponentAttribute,
    ComponentDecisionState,
    ConfigurationInterpreter,
    ConstraintsExplainAnswer,
    DecisionsExplainAnswer,
    ExplainQuestion,
    ExplainQuestionSubject,
    ExplainQuestionType,
    ExplainSolution,
    ExplicitBooleanDecision,
    ExplicitChoiceDecision,
    ExplicitComponentDecision,
    ExplicitNumericDecision,
    FullExplainAnswer,
    GlobalAttributeId,
    NumericAttribute,
    WhyIsAttributeNotSatisfied,
    WhyIsBooleanStateNotPossible,
    WhyIsChoiceValueStateNotPossible,
    WhyIsComponentStateNotPossible,
    WhyIsNumericStateNotPossible,
    WhyIsStateNotPossible
} from "@viamedici-spc/configurator-ts";
import {flow, identity, O, pipe, RA} from "@viamedici-spc/fp-ts-extensions";
import {useMemo} from "react";
import useDecision from "./useDecision";
import {useConfigurationContext} from "./internal/contexts";
import {throwIfConfigurationIsNull} from "./internal/throwHelper";
import {getChoiceAttributeResetDecisions, getComponentSubtreeResetDecisions} from "./internal/attributeHelper";
import useExplain from "./useExplain";
import {match} from "ts-pattern";

export type SimplifiedExplainQuestion<T extends ExplainQuestion> = Omit<T, "attributeId" | "subject">;

export type ExplainQuestionParam<T extends WhyIsStateNotPossible> = SimplifiedExplainQuestion<WhyIsAttributeNotSatisfied> | SimplifiedExplainQuestion<T>;

export type UseAttributeExplainResult<T extends WhyIsStateNotPossible> = {
    explain(question: ExplainQuestionParam<T>, answerType: "decisions"): Promise<DecisionsExplainAnswer>,
    explain(question: ExplainQuestionParam<T>, answerType: "constraints"): Promise<ConstraintsExplainAnswer>,
    explain(question: ExplainQuestionParam<T>, answerType: "full"): Promise<FullExplainAnswer>,
    applySolution(solution: ExplainSolution): Promise<void>,
}

export type UseChoiceAttributeResult = UseAttributeExplainResult<WhyIsChoiceValueStateNotPossible> & {
    attribute: ChoiceAttribute,
    makeDecision: (choiceValueId: ChoiceValueId, state: ChoiceValueDecisionState | null | undefined) => Promise<void>,
    clearDecisions: () => Promise<void>
};

export type UseNumericAttributeResult = UseAttributeExplainResult<WhyIsNumericStateNotPossible> & {
    attribute: NumericAttribute,
    makeDecision: (state: number | null | undefined) => Promise<void>,

};

export type UseBooleanAttributeResult = UseAttributeExplainResult<WhyIsBooleanStateNotPossible> & {
    attribute: BooleanAttribute,
    makeDecision: (state: boolean | null | undefined) => Promise<void>
};

export type UseComponentAttributeResult = UseAttributeExplainResult<WhyIsComponentStateNotPossible> & {
    attribute: ComponentAttribute,
    makeDecision: (state: ComponentDecisionState | null | undefined) => Promise<void>,
    clearSubtree: () => Promise<void>
};

/**
 * Retrieves the requested attributes. Will return all existing attributes if requested attributes is null or undefined.
 * @param attributes The attributes to return or null/undefined if all attributes shall be returned.
 * @param ignoreMissingAttributes Whether to ignore that requested attributes are missing. If true, missing attributes will be filtered out of the result.
 * Otherwise, they will appear as undefined. Only applicable if @param attributes has items. Defaults to false.
 * @throws If configuration is initializing.
 */
export function useAttributes(attributes?: GlobalAttributeId[], ignoreMissingAttributes: boolean = false): readonly Attribute[] {
    const configuration = useConfigurationContext();

    throwIfConfigurationIsNull(configuration);

    return useMemo(() => pipe(
            O.fromNullable(attributes),
            O.map(flow(
                RA.map(id => ConfigurationInterpreter.getAttribute(configuration, id)),
                ignoreMissingAttributes ? RA.filterMap(O.fromNullable) : identity
            )),
            O.getOrElse(() => configuration.attributes)
        ),
        [attributes, configuration, ignoreMissingAttributes]);
}

/**
 * Gets the requested choice attribute with commands for making decisions or explaining consequences.
 * @param attributeId The id of the choice attribute.
 * @throws If configuration is initializing.
 * @returns Undefined if attribute doesn't exist, or it is not a choice attribute.
 */
export function useChoiceAttribute(attributeId: GlobalAttributeId): UseChoiceAttributeResult | undefined {
    const configuration = useConfigurationContext();
    const {makeDecision, setManyDecision} = useDecision();

    const attributeExplainResult = useAttributeExplain<WhyIsChoiceValueStateNotPossible>(attributeId, ExplainQuestionSubject.choiceValue);

    throwIfConfigurationIsNull(configuration);

    const attribute = ConfigurationInterpreter.getChoiceAttribute(configuration, attributeId);

    const commands = useMemo(() => ({
        makeDecision: (choiceValueId: ChoiceValueId, state: ChoiceValueDecisionState | null | undefined) =>
            makeDecision({
                type: AttributeType.Choice,
                attributeId: attributeId,
                choiceValueId: choiceValueId,
                state: state
            } as ExplicitChoiceDecision),
        clearDecisions: pipe(
            attribute,
            O.fromNullable,
            O.map(getChoiceAttributeResetDecisions),
            // Only setMany if there are decisions to clear.
            O.filter(RA.isNonEmpty),
            O.map(d => () => setManyDecision(d, {type: "Default"})),
            O.getOrElse(() => () => Promise.resolve())
        ),
        ...attributeExplainResult
    }), [attributeId, attribute, makeDecision, setManyDecision, attributeExplainResult]);

    const result = useMemo(() => ({
        ...commands,
        attribute: attribute,
    }), [attribute, commands]);

    if (!attribute) {
        return undefined;
    }

    return result;
}

/**
 * Gets the requested numeric attribute with the command to make decisions.
 * @param attributeId The id of the numeric attribute.
 * @throws If configuration is initializing.
 * @returns Undefined if attribute doesn't exist, or it is not a numeric attribute.
 */
export function useNumericAttribute(attributeId: GlobalAttributeId): UseNumericAttributeResult | undefined {
    const configuration = useConfigurationContext();
    const {makeDecision} = useDecision();

    const attributeExplainResult = useAttributeExplain<WhyIsNumericStateNotPossible>(attributeId, ExplainQuestionSubject.numeric);

    throwIfConfigurationIsNull(configuration);

    const attribute = ConfigurationInterpreter.getNumericAttribute(configuration, attributeId);

    const commands = useMemo(() => ({
        makeDecision: (state: number | null | undefined) => makeDecision({
            type: AttributeType.Numeric,
            attributeId: attributeId,
            state: state
        } as ExplicitNumericDecision),
        ...attributeExplainResult
    }), [attributeId, makeDecision, attributeExplainResult]);

    const result = useMemo(() => ({
        ...commands,
        attribute: attribute,
    }), [attribute, commands]);

    if (!attribute) {
        return undefined;
    }

    return result;
}

/**
 * Gets the requested boolean attribute with the command to make decisions.
 * @param attributeId The id of the boolean attribute.
 * @throws If configuration is initializing.
 * @returns Undefined if attribute doesn't exist, or it is not a boolean attribute.
 */
export function useBooleanAttribute(attributeId: GlobalAttributeId): UseBooleanAttributeResult | undefined {
    const configuration = useConfigurationContext();
    const {makeDecision} = useDecision();

    const attributeExplainResult = useAttributeExplain<WhyIsBooleanStateNotPossible>(attributeId, ExplainQuestionSubject.boolean);

    throwIfConfigurationIsNull(configuration);

    const attribute = ConfigurationInterpreter.getBooleanAttribute(configuration, attributeId);

    const commands = useMemo(() => ({
        makeDecision: (state: boolean | null | undefined) => makeDecision({
            type: AttributeType.Boolean,
            attributeId: attributeId,
            state: state
        } as ExplicitBooleanDecision),
        ...attributeExplainResult
    }), [attributeId, makeDecision, attributeExplainResult]);

    const result = useMemo(() => ({
        ...commands,
        attribute: attribute,
    }), [attribute, commands]);

    if (!attribute) {
        return undefined;
    }

    return result;
}

export function useComponentAttribute(attributeId: GlobalAttributeId): UseComponentAttributeResult | undefined {
    const configuration = useConfigurationContext();
    const {makeDecision, setManyDecision} = useDecision();

    const attributeExplainResult = useAttributeExplain<WhyIsComponentStateNotPossible>(attributeId, ExplainQuestionSubject.component);

    throwIfConfigurationIsNull(configuration);

    const attributes = configuration.attributes;

    const attribute = ConfigurationInterpreter.getComponentAttribute(configuration, attributeId);

    const commands = useMemo(() => ({
        makeDecision: (state: ComponentDecisionState | null | undefined) => makeDecision({
            type: AttributeType.Component,
            attributeId: attributeId,
            state: state
        } as ExplicitComponentDecision),
        clearSubtree: pipe(
            getComponentSubtreeResetDecisions(attributeId, attributes),
            // Only setMany if there are decisions to clear.
            O.fromPredicate(RA.isNonEmpty),
            O.map(d => () => setManyDecision(d, {type: "Default"})),
            O.getOrElse(() => () => Promise.resolve())
        ),
        ...attributeExplainResult
    }), [attributeId, makeDecision, attributes, setManyDecision, attributeExplainResult]);

    const result = useMemo(() => ({
        ...commands,
        attribute: attribute,
    }), [attribute, commands]);

    if (!attribute) {
        return undefined;
    }

    return result;
}

function useAttributeExplain<T extends WhyIsStateNotPossible>(attributeId: GlobalAttributeId, whyIsStateNotPossibleSubject: T["subject"]): UseAttributeExplainResult<T> {
    const {explain, applySolution} = useExplain();

    return useMemo(() => ({
        explain: (question: ExplainQuestionParam<T>, answerType: "decisions" | "constraints" | "full"): Promise<any> => {
            const subject = match(question.question)
                .with(ExplainQuestionType.whyIsNotSatisfied, () => ExplainQuestionSubject.attribute)
                .otherwise(() => whyIsStateNotPossibleSubject);

            const explainQuestion = {
                ...question,
                subject: subject,
                attributeId: attributeId
            } as ExplainQuestion;

            return match(answerType)
                .with("decisions", a => explain(explainQuestion, a))
                .with("constraints", a => explain(explainQuestion, a))
                .with("full", a => explain(explainQuestion, a))
                .exhaustive();
        },
        applySolution: applySolution
    }) satisfies UseAttributeExplainResult<T>, [attributeId, whyIsStateNotPossibleSubject, explain, applySolution]);
}