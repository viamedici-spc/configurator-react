import {act, cleanup, renderHook} from "@testing-library/react-hooks";
import {afterEach, describe, expect, it, Mock, vi} from "vitest";
import {
    AttributeType,
    ComponentAttribute,
    ComponentDecisionState,
    Configuration,
    DecisionKind, ExplicitComponentDecision,
    ExplicitDecision,
    IConfigurationSession,
    SetManyMode
} from "@viamedici-spc/configurator-ts";
import {componentAttribute, numericAttribute, WrappingComponent} from "./Common";
import {useComponentAttribute} from "../../src/attribute";

afterEach(async () => {
    vi.clearAllMocks();
    await cleanup();
});

describe("useComponentAttribute tests", () => {
    it("Command partial application and unmodified attribute passing", async () => {
        const session = {
            makeDecision: vi.fn() as (decision: ExplicitDecision) => Promise<void>
        } as IConfigurationSession;

        const configuration = {
            isSatisfied: true,
            attributes: [
                componentAttribute
            ]
        } as Configuration;

        const {result} = renderHook(() => useComponentAttribute({localId: "A1"}), {
            wrapper: WrappingComponent,
            initialProps: {
                session: session,
                configuration: configuration
            }
        });

        await act(async () => {
            await result.current.makeDecision(ComponentDecisionState.Included);
            await result.current.makeDecision(ComponentDecisionState.Excluded);
            await result.current.makeDecision(null);
        });

        expect(result.current.attribute).toBe(componentAttribute);
        expect(session.makeDecision).toHaveBeenCalledTimes(3);
        expect(session.makeDecision).toHaveBeenNthCalledWith(1, {
            type: AttributeType.Component,
            attributeId: {localId: "A1"},
            state: ComponentDecisionState.Included
        } as ExplicitComponentDecision);
        expect(session.makeDecision).toHaveBeenNthCalledWith(2, {
            type: AttributeType.Component,
            attributeId: {localId: "A1"},
            state: ComponentDecisionState.Excluded
        } as ExplicitComponentDecision);
        expect(session.makeDecision).toHaveBeenNthCalledWith(3, {
            type: AttributeType.Component,
            attributeId: {localId: "A1"},
            state: null
        } as ExplicitComponentDecision);
    });

    it("Attribute not found", async () => {
        const session = {} as IConfigurationSession;

        const configuration = {
            isSatisfied: true,
            attributes: []
        } as Configuration;

        const {result} = renderHook(() => useComponentAttribute({localId: "A1"}), {
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

        const configuration = {
            isSatisfied: true,
            attributes: [
                numericAttribute
            ]
        } as Configuration;

        const {result} = renderHook(() => useComponentAttribute({localId: "A1"}), {
            wrapper: WrappingComponent,
            initialProps: {
                session: session,
                configuration: configuration
            }
        });

        expect(result.current).toBeUndefined();
    });

    it.skip("ClearSubtree clears subtree recursively but not the attribute itself", async () => {
        const session = {
            setMany: vi.fn() as (decisions: ReadonlyArray<ExplicitDecision>, mode: SetManyMode) => Promise<void>
        } as IConfigurationSession;

        const configuration = {
            isSatisfied: true,
            attributes: [
                {
                    id: {localId: "A1"},
                    type: AttributeType.Component,
                    decision: {
                        state: ComponentDecisionState.Included,
                        kind: DecisionKind.Explicit
                    },
                } as ComponentAttribute,
                {
                    id: {localId: "A2", componentPath: ["A1"]},
                    type: AttributeType.Component,
                    decision: {
                        state: ComponentDecisionState.Excluded,
                        kind: DecisionKind.Explicit
                    }
                } as ComponentAttribute,
                {
                    id: {localId: "A3", componentPath: ["A1", "A2"]},
                    type: AttributeType.Component,
                    decision: {
                        state: ComponentDecisionState.Excluded,
                        kind: DecisionKind.Explicit
                    }
                } as ComponentAttribute,
                // The implicit attribute must not be cleared.
                {
                    id: {localId: "A4", componentPath: ["A1", "A2"]},
                    type: AttributeType.Component,
                    decision: {
                        state: ComponentDecisionState.Excluded,
                        kind: DecisionKind.Implicit
                    }
                } as ComponentAttribute
            ]
        } as Configuration;

        const {result} = renderHook(() => useComponentAttribute({localId: "A1"}), {
            wrapper: WrappingComponent,
            initialProps: {
                session: session,
                configuration: configuration
            }
        });

        await act(async () => {
            await result.current.clearSubtree();
        });

        expect(session.setMany).toHaveBeenCalledTimes(1);
        const expected = [
            {
                type: AttributeType.Component,
                attributeId: {localId: "A2", componentPath: ["A1"]},
                state: null
            } as ExplicitComponentDecision,
            {
                type: AttributeType.Component,
                attributeId: {localId: "A3", componentPath: ["A1", "A2"]},
                state: null
            } as ExplicitComponentDecision
        ];
        const firstCallParameters = (session.setMany as Mock).mock.calls[0] as [decisions: any, setManyMode: any][];
        expect(firstCallParameters[0].length).toBe(expected.length);
        expect(firstCallParameters[0]).toEqual(expect.arrayContaining(expected));
        expect(firstCallParameters[1]).toBe({type: "Default"} as SetManyMode);
    })
});