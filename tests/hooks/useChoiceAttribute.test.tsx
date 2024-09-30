import {act, cleanup, renderHook} from "@testing-library/react-hooks";
import {useChoiceAttribute} from "../../src";
import {
    AttributeType,
    ChoiceValueDecisionState,
    Configuration,
    ExplicitChoiceDecision, IConfigurationSession
} from "@viamedici-spc/configurator-ts";
import {booleanAttribute, choiceAttribute, WrappingComponent} from "./Common";
import {afterEach, describe, expect, it, vi} from "vitest";

afterEach(async () => {
    vi.clearAllMocks();
    await cleanup();
});

describe("useChoiceAttribute tests", () => {
    it("Command partial application and unmodified attribute passing", async () => {
        const session = {
            makeDecision: vi.fn() as IConfigurationSession["makeDecision"],
            makeManyDecisions: vi.fn() as IConfigurationSession["makeManyDecisions"],
            explain: vi.fn() as IConfigurationSession["explain"],
            applySolution: vi.fn() as IConfigurationSession["applySolution"],
            getDecisions: vi.fn() as IConfigurationSession["getDecisions"],
        } as IConfigurationSession;

        const configuration: Configuration = {
            isSatisfied: true,
            attributes: new Map([
                [choiceAttribute.key, choiceAttribute]
            ])
        };

        const {result} = renderHook(() => useChoiceAttribute({localId: "A1"}), {
            wrapper: WrappingComponent,
            initialProps: {
                session: session,
                configuration: configuration
            }
        });

        await act(async () => {
            await result.current?.makeDecision("V1", ChoiceValueDecisionState.Included);
            await result.current?.makeDecision("V1", ChoiceValueDecisionState.Excluded);
            await result.current?.makeDecision("V1", null);

            // await result.current.explainConsequence("V1", ExplainMode.WhyMustBeIncluded);
            // await result.current.explainConsequence("V1", ExplainMode.WhyCanNotBeIncluded);
            //
            // await result.current.explainConsequences(ExplainMode.WhyMustBeIncluded);
            // await result.current.explainConsequences(ExplainMode.WhyCanNotBeIncluded);
        });

        expect(result.current?.attribute).toBe(choiceAttribute);
        expect(session.makeDecision).toHaveBeenCalledTimes(3);
        expect(session.makeDecision).toHaveBeenNthCalledWith(1, {
            type: AttributeType.Choice,
            attributeId: {localId: "A1"},
            choiceValueId: "V1",
            state: ChoiceValueDecisionState.Included
        } as ExplicitChoiceDecision);
        expect(session.makeDecision).toHaveBeenNthCalledWith(2, {
            type: AttributeType.Choice,
            attributeId: {localId: "A1"},
            choiceValueId: "V1",
            state: ChoiceValueDecisionState.Excluded
        } as ExplicitChoiceDecision);
        expect(session.makeDecision).toHaveBeenNthCalledWith(3, {
            type: AttributeType.Choice,
            attributeId: {localId: "A1"},
            choiceValueId: "V1",
            state: null
        } as ExplicitChoiceDecision);

        // expect(session.explain).toHaveBeenCalledTimes(4);
        // expect(session.explain).toHaveBeenNthCalledWith(1, {
        //     type: ExplainType.ChoiceValue,
        //     attributeId: {localId: "A1"},
        //     choiceValueId: "V1",
        //     question: ExplainMode.WhyMustBeIncluded
        // } as ExplainChoiceValue);
        // expect(session.explain).toHaveBeenNthCalledWith(2, {
        //     type: ExplainType.ChoiceValue,
        //     attributeId: {localId: "A1"},
        //     choiceValueId: "V1",
        //     question: ExplainMode.WhyCanNotBeIncluded
        // } as ExplainChoiceValue);
        //
        // expect(session.explain).toHaveBeenNthCalledWith(3, {
        //     type: ExplainType.Choice,
        //     attributeId: {localId: "A1"},
        //     question: ExplainMode.WhyMustBeIncluded
        // } as ExplainChoice);
        // expect(session.explain).toHaveBeenNthCalledWith(4, {
        //     type: ExplainType.Choice,
        //     attributeId: {localId: "A1"},
        //     question: ExplainMode.WhyCanNotBeIncluded
        // } as ExplainChoice);
    });

    it("Attribute not found", async () => {
        const session = {} as IConfigurationSession;

        const configuration: Configuration = {
            isSatisfied: true,
            attributes: new Map()
        };

        const {result} = renderHook(() => useChoiceAttribute({localId: "A1"}), {
            wrapper: WrappingComponent,
            initialProps: {
                session: session,
                configuration: configuration
            }
        });

        expect(result.current).toBeUndefined();
    });

    it("Attribute of wrong type", async () => {
        const session = {} as IConfigurationSession;

        const configuration: Configuration = {
            isSatisfied: true,
            attributes: new Map([
                [booleanAttribute.key, booleanAttribute]
            ])
        };

        const {result} = renderHook(() => useChoiceAttribute({localId: "A1"}), {
            wrapper: WrappingComponent,
            initialProps: {
                session: session,
                configuration: configuration
            }
        });

        expect(result.current).toBeUndefined();
    });
});