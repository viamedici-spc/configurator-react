import {
    Attribute,
    AttributeInterpreter,
    AttributeRefinements,
    AttributeType,
    BooleanAttribute,
    ChoiceAttribute,
    ChoiceValue,
    ChoiceValueDecisionState,
    ChoiceValueId,
    ChoiceValueInterpreter,
    ComponentAttribute,
    ComponentDecisionState,
    ConstraintsExplainAnswer,
    DecisionsExplainAnswer,
    ExplainQuestion,
    ExplainQuestionSubject,
    ExplainQuestionType,
    ExplainSolution, ExplicitBooleanDecision,
    ExplicitChoiceDecision, ExplicitComponentDecision,
    ExplicitNumericDecision,
    FullExplainAnswer,
    GlobalAttributeIdKey, MakeManyDecisionsResult,
    NumericAttribute,
    WhyIsAttributeNotSatisfied,
    WhyIsBooleanStateNotPossible,
    WhyIsChoiceValueStateNotPossible,
    WhyIsComponentStateNotPossible,
    WhyIsNumericStateNotPossible,
    WhyIsStateNotPossible
} from "@viamedici-spc/configurator-ts";
import {AtomFamily} from "jotai/vanilla/utils/atomFamily";
import {atomFamily} from "jotai/utils";
import {Getter} from "jotai";
import {Selectors} from "../Selectors";
import {constVoid, O, pipe, RA, T} from "@viamedici-spc/fp-ts-extensions";
import {Refinement} from "fp-ts/Refinement";
import {getChoiceAttributeResetDecisions} from "../../attributeHelper";
import {match} from "ts-pattern";
import {ConfigurationUninitialized, GuardedAtom} from "../../../types";
import atomWithGuard, {GuardedGetter} from "../helper/atomWithGuard";
import memize from "memize";

export type SimplifiedExplainQuestion<T extends ExplainQuestion> = Omit<T, "attributeId" | "subject">;

export type ExplainQuestionParam<T extends WhyIsStateNotPossible> = SimplifiedExplainQuestion<WhyIsAttributeNotSatisfied> | SimplifiedExplainQuestion<T>;

export type UseAttributeExplainResult<T extends WhyIsStateNotPossible> = {
    explain: {
        (question: ExplainQuestionParam<T>, answerType: "decisions"): Promise<DecisionsExplainAnswer>;
        (question: ExplainQuestionParam<T>, answerType: "constraints"): Promise<ConstraintsExplainAnswer>;
        (question: ExplainQuestionParam<T>, answerType: "full"): Promise<FullExplainAnswer>;
    },
    applySolution(solution: ExplainSolution): Promise<MakeManyDecisionsResult>,
};

export type UseChoiceAttributeResult = UseAttributeExplainResult<WhyIsChoiceValueStateNotPossible> & {
    attribute: ChoiceAttribute;
    makeDecision: (choiceValueId: ChoiceValueId, state: ChoiceValueDecisionState | null | undefined) => Promise<void>;
    clearDecisions: () => Promise<void>;
    isMultiSelect: () => boolean;
    isMandatory: () => boolean;
    getAllowedChoiceValues: () => ReadonlyArray<ChoiceValue>;
    getBlockedChoiceValues: () => ReadonlyArray<ChoiceValue>;
    getIncludedChoiceValues: () => ReadonlyArray<ChoiceValue>;
    isChoiceValueAllowed: (choiceValue: ChoiceValue) => boolean;
    isChoiceValueBlocked: (choiceValue: ChoiceValue) => boolean;
};

export type UseNumericAttributeResult = UseAttributeExplainResult<WhyIsNumericStateNotPossible> & {
    attribute: NumericAttribute;
    makeDecision: (state: number | null | undefined) => Promise<void>;
    isMandatory: () => boolean;
};

export type UseBooleanAttributeResult = UseAttributeExplainResult<WhyIsBooleanStateNotPossible> & {
    attribute: BooleanAttribute;
    makeDecision: (state: boolean | null | undefined) => Promise<void>;
    isMandatory: () => boolean;
};

export type UseComponentAttributeResult = UseAttributeExplainResult<WhyIsComponentStateNotPossible> & {
    attribute: ComponentAttribute;
    makeDecision: (state: ComponentDecisionState | null | undefined) => Promise<void>;
    isMandatory: () => boolean;
};

export function createChoiceAttributeAtomFamily(guardedAttributesAtom: Selectors["guardedAttributesAtom"], makeDecisionAtom: Selectors["makeDecisionAtom"], explainAtom: Selectors["explainAtom"]): AtomFamily<GlobalAttributeIdKey, GuardedAtom<UseChoiceAttributeResult | undefined>> {
    return createAttributeAtomFamily<ChoiceAttribute, WhyIsChoiceValueStateNotPossible, Omit<UseChoiceAttributeResult, "attribute" | "explain" | "applySolution" | "isMandatory">>(
        guardedAttributesAtom,
        explainAtom,
        AttributeRefinements.choiceAttributeRefinement,
        ExplainQuestionSubject.choiceValue,
        (attribute, _, getGuarded) => {
            const {makeDecision, makeManyDecisions} = getGuarded(makeDecisionAtom);

            return {
                makeDecision: (v, s) => makeDecision({
                    type: AttributeType.Choice,
                    attributeId: attribute.id,
                    choiceValueId: v,
                    state: s
                } satisfies ExplicitChoiceDecision),
                clearDecisions: () => pipe(
                    attribute,
                    getChoiceAttributeResetDecisions,
                    // Only execute if there are decisions to clear.
                    O.fromPredicate(RA.isNonEmpty),
                    O.match(
                        () => () => Promise.resolve(),
                        d => pipe(() => makeManyDecisions(d, {type: "KeepExistingDecisions"}), T.map(constVoid))
                    ),
                )(),
                isMultiSelect: memize(() => AttributeInterpreter.isChoiceAttributeMultiSelect(attribute)),
                getAllowedChoiceValues: memize(() => AttributeInterpreter.getAllowedChoiceValues(attribute)),
                getIncludedChoiceValues: memize(() => AttributeInterpreter.getIncludedChoiceValues(attribute)),
                getBlockedChoiceValues: memize(() => AttributeInterpreter.getBlockedChoiceValues(attribute)),
                isChoiceValueAllowed: memize((v) => ChoiceValueInterpreter.isAllowed(v)),
                isChoiceValueBlocked: memize((v) => ChoiceValueInterpreter.isBlocked(v)),
            };
        }) satisfies AtomFamily<GlobalAttributeIdKey, GuardedAtom<UseChoiceAttributeResult | undefined>>;
}

export function createNumericAttributeAtomFamily(guardedAttributesAtom: Selectors["guardedAttributesAtom"], makeDecisionAtom: Selectors["makeDecisionAtom"], explainAtom: Selectors["explainAtom"]): AtomFamily<GlobalAttributeIdKey, GuardedAtom<UseNumericAttributeResult | undefined>> {
    return createAttributeAtomFamily<NumericAttribute, WhyIsNumericStateNotPossible, Pick<UseNumericAttributeResult, "makeDecision">>(
        guardedAttributesAtom,
        explainAtom,
        AttributeRefinements.numericAttributeRefinement,
        ExplainQuestionSubject.numeric,
        (attribute, _, getGuarded) => {
            const {makeDecision} = getGuarded(makeDecisionAtom);

            return {
                makeDecision: (s) => makeDecision({
                    type: AttributeType.Numeric,
                    attributeId: attribute.id,
                    state: s
                } satisfies ExplicitNumericDecision)
            };
        }) satisfies AtomFamily<GlobalAttributeIdKey, GuardedAtom<UseNumericAttributeResult | undefined>>;
}

export function createBooleanAttributeAtomFamily(guardedAttributesAtom: Selectors["guardedAttributesAtom"], makeDecisionAtom: Selectors["makeDecisionAtom"], explainAtom: Selectors["explainAtom"]): AtomFamily<GlobalAttributeIdKey, GuardedAtom<UseBooleanAttributeResult | undefined>> {
    return createAttributeAtomFamily<BooleanAttribute, WhyIsBooleanStateNotPossible, Pick<UseBooleanAttributeResult, "makeDecision">>(
        guardedAttributesAtom,
        explainAtom,
        AttributeRefinements.booleanAttributeRefinement,
        ExplainQuestionSubject.boolean,
        (attribute, _, getGuarded) => {
            const {makeDecision} = getGuarded(makeDecisionAtom);

            return {
                makeDecision: (s) => makeDecision({
                    type: AttributeType.Boolean,
                    attributeId: attribute.id,
                    state: s
                } satisfies ExplicitBooleanDecision)
            };
        }) satisfies AtomFamily<GlobalAttributeIdKey, GuardedAtom<UseBooleanAttributeResult | undefined>>;
}

export function createComponentAttributeAtomFamily(guardedAttributesAtom: Selectors["guardedAttributesAtom"], makeDecisionAtom: Selectors["makeDecisionAtom"], explainAtom: Selectors["explainAtom"]): AtomFamily<GlobalAttributeIdKey, GuardedAtom<UseComponentAttributeResult | undefined>> {
    return createAttributeAtomFamily<ComponentAttribute, WhyIsComponentStateNotPossible, Pick<UseComponentAttributeResult, "makeDecision">>(
        guardedAttributesAtom,
        explainAtom,
        AttributeRefinements.componentAttributeRefinement,
        ExplainQuestionSubject.component,
        (attribute, _, getGuarded) => {
            const {makeDecision} = getGuarded(makeDecisionAtom);

            return {
                makeDecision: (s) => makeDecision({
                    type: AttributeType.Component,
                    attributeId: attribute.id,
                    state: s
                } satisfies ExplicitComponentDecision),
            };
        }) satisfies AtomFamily<GlobalAttributeIdKey, GuardedAtom<UseComponentAttributeResult | undefined>>;
}


function createAttributeAtomFamily<A extends Attribute, E extends WhyIsStateNotPossible, TAdd>(guardedAttributesAtom: Selectors["guardedAttributesAtom"], explainAtom: Selectors["explainAtom"], refinement: Refinement<Attribute, A>, whyIsStateNotPossibleSubject: E["subject"], getAdditional: (attribute: A, get: Getter, getGuarded: GuardedGetter) => TAdd | ConfigurationUninitialized) {
    type Result = UseAttributeExplainResult<E> & TAdd & {
        attribute: A;
        isMandatory: () => boolean;
    };
    return atomFamily<GlobalAttributeIdKey, GuardedAtom<Result | undefined>>(key => atomWithGuard<Result | undefined>((get, getGuarded) => {
        const attributes = getGuarded(guardedAttributesAtom);

        const attribute = get(attributes(key));
        if (!attribute || !refinement(attribute)) {
            return undefined;
        }
        const {explain, applySolution} = getGuarded(explainAtom);
        const additional = getAdditional(attribute, get, getGuarded);
        if (additional === ConfigurationUninitialized) {
            return ConfigurationUninitialized;
        }

        return {
            attribute: attribute,
            isMandatory: memize(() => AttributeInterpreter.isMandatory(attribute)),
            explain: (question: ExplainQuestionParam<E>, answerType: "decisions" | "constraints" | "full"): Promise<any> => {
                const subject = match(question.question)
                    .with(ExplainQuestionType.whyIsNotSatisfied, () => ExplainQuestionSubject.attribute)
                    .otherwise(() => whyIsStateNotPossibleSubject);

                const explainQuestion = {
                    ...question,
                    subject: subject,
                    attributeId: attribute.id
                } as ExplainQuestion;

                return match(answerType)
                    .with("decisions", a => explain(explainQuestion, a))
                    .with("constraints", a => explain(explainQuestion, a))
                    .with("full", a => explain(explainQuestion, a))
                    .exhaustive();
            },
            applySolution: applySolution,
            ...additional
        };
    }));
}