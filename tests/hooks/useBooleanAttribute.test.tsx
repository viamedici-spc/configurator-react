import {act, cleanup, renderHook} from "@testing-library/react-hooks";
import {useBooleanAttribute} from "../../src";
import {describe, it, expect, afterEach, vi} from "vitest";
import {
    AttributeType,
    Configuration, ExplicitBooleanDecision, IConfigurationSession
} from "@viamedici-spc/configurator-ts";
import {booleanAttribute, numericAttribute, WrappingComponent} from "./Common";

afterEach(async () => {
    vi.clearAllMocks();
    await cleanup();
});

describe("useBooleanAttribute tests", () => {
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
                [booleanAttribute.key, booleanAttribute]
            ])
        };

        const {result} = renderHook(() => useBooleanAttribute({localId: "A1"}), {
            wrapper: WrappingComponent,
            initialProps: {
                session: session,
                configuration: configuration
            }
        });

        await act(async () => {
            await result.current?.makeDecision(true);
            await result.current?.makeDecision(false);
            await result.current?.makeDecision(null);
            await result.current?.makeDecision(undefined);
        });

        expect(result.current?.attribute).toBe(booleanAttribute);
        expect(session.makeDecision).toHaveBeenCalledTimes(4);
        expect(session.makeDecision).toHaveBeenNthCalledWith(1, {
            type: AttributeType.Boolean,
            attributeId: {localId: "A1"},
            state: true
        } as ExplicitBooleanDecision);
        expect(session.makeDecision).toHaveBeenNthCalledWith(2, {
            type: AttributeType.Boolean,
            attributeId: {localId: "A1"},
            state: false
        } as ExplicitBooleanDecision);
        expect(session.makeDecision).toHaveBeenNthCalledWith(3, {
            type: AttributeType.Boolean,
            attributeId: {localId: "A1"},
            state: null
        } as ExplicitBooleanDecision);
        expect(session.makeDecision).toHaveBeenNthCalledWith(4, {
            type: AttributeType.Boolean,
            attributeId: {localId: "A1"},
            state: undefined
        } as ExplicitBooleanDecision);
    });

    it("Attribute not found", async () => {
        const session = {} as IConfigurationSession;

        const configuration = {
            isSatisfied: true,
            attributes: new Map()
        } as Configuration;

        const {result} = renderHook(() => useBooleanAttribute({localId: "A1"}), {
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
            attributes: new Map([
                [numericAttribute.key, numericAttribute]
            ])
        } as Configuration;

        const {result} = renderHook(() => useBooleanAttribute({localId: "A1"}), {
            wrapper: WrappingComponent,
            initialProps: {
                session: session,
                configuration: configuration
            }
        });

        expect(result.current).toBeUndefined();
    });
});