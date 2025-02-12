import {act, cleanup, renderHook} from "@testing-library/react-hooks";
import {afterEach, describe, expect, it, vi} from "vitest";
import {
    AttributeType,
    ComponentDecisionState,
    Configuration,
    ExplicitComponentDecision,
    IConfigurationSession
} from "@viamedici-spc/configurator-ts";
import {componentAttribute, numericAttribute, WrappingComponent} from "./Common";
import {useComponentAttribute} from "../../src";

afterEach(async () => {
    vi.clearAllMocks();
    await cleanup();
});

describe("useComponentAttribute tests", () => {
    it("Command partial application and unmodified attribute passing", async () => {
        const session = {
            makeDecision: vi.fn() as IConfigurationSession["makeDecision"],
            makeManyDecisions: vi.fn() as IConfigurationSession["makeManyDecisions"],
            explain: vi.fn() as IConfigurationSession["explain"],
            applySolution: vi.fn() as IConfigurationSession["applySolution"],
            getDecisions: vi.fn() as IConfigurationSession["getDecisions"],
        } as IConfigurationSession;

        const configuration = {
            isSatisfied: true,
            attributes: new Map([
                [componentAttribute.key, componentAttribute]
            ])
        } as Configuration;

        const {result} = renderHook(() => useComponentAttribute({localId: "A1"}), {
            wrapper: WrappingComponent,
            initialProps: {
                session: session,
                configuration: configuration
            }
        });

        await act(async () => {
            await result.current?.makeDecision(ComponentDecisionState.Included);
            await result.current?.makeDecision(ComponentDecisionState.Excluded);
            await result.current?.makeDecision(null);
        });

        expect(result.current?.attribute).toBe(componentAttribute);
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

        const configuration: Configuration = {
            isSatisfied: true,
            attributes: new Map()
        };

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

        const configuration: Configuration = {
            isSatisfied: true,
            attributes: new Map([
                [numericAttribute.key, numericAttribute]
            ])
        };

        const {result} = renderHook(() => useComponentAttribute({localId: "A1"}, false), {
            wrapper: WrappingComponent,
            initialProps: {
                session: session,
                configuration: configuration
            }
        });

        expect(result.current).toBeUndefined();
    });
});