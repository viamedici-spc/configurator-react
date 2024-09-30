import {act, cleanup, renderHook} from "@testing-library/react-hooks";
import {useNumericAttribute} from "../../src";
import {
    AttributeType,
    Configuration,
    IConfigurationSession, ExplicitNumericDecision
} from "@viamedici-spc/configurator-ts";
import {booleanAttribute, numericAttribute, WrappingComponent} from "./Common";
import {describe, it, expect, afterEach, vi} from "vitest";

afterEach(async () => {
    vi.clearAllMocks();
    await cleanup();
});

describe("useNumericAttribute tests", () => {
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
                [numericAttribute.key, numericAttribute]
            ])
        };

        const {result} = renderHook(() => useNumericAttribute({localId: "A1"}), {
            wrapper: WrappingComponent,
            initialProps: {
                session: session,
                configuration: configuration
            }
        });

        await act(async () => {
            await result.current?.makeDecision(1);
            await result.current?.makeDecision(2);
            await result.current?.makeDecision(null);
            await result.current?.makeDecision(undefined);
        });

        expect(result.current?.attribute).toBe(numericAttribute);
        expect(session.makeDecision).toHaveBeenCalledTimes(4);
        expect(session.makeDecision).toHaveBeenNthCalledWith(1, {
            type: AttributeType.Numeric,
            attributeId: {localId: "A1"},
            state: 1
        } as ExplicitNumericDecision);
        expect(session.makeDecision).toHaveBeenNthCalledWith(2, {
            type: AttributeType.Numeric,
            attributeId: {localId: "A1"},
            state: 2
        } as ExplicitNumericDecision);
        expect(session.makeDecision).toHaveBeenNthCalledWith(3, {
            type: AttributeType.Numeric,
            attributeId: {localId: "A1"},
            state: null
        } as ExplicitNumericDecision);
        expect(session.makeDecision).toHaveBeenNthCalledWith(4, {
            type: AttributeType.Numeric,
            attributeId: {localId: "A1"},
            state: undefined
        } as ExplicitNumericDecision);
    });

    it("Attribute not found", async () => {
        const session = {} as IConfigurationSession;

        const configuration: Configuration = {
            isSatisfied: true,
            attributes: new Map()
        };

        const {result} = renderHook(() => useNumericAttribute({localId: "A1"}), {
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

        const {result} = renderHook(() => useNumericAttribute({localId: "A1"}), {
            wrapper: WrappingComponent,
            initialProps: {
                session: session,
                configuration: configuration
            }
        });

        expect(result.current).toBeUndefined();
    });
});