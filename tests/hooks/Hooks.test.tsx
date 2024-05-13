import {cleanup, renderHook} from "@testing-library/react-hooks";
import {useConfiguration, useConfigurationInitialization} from "../../src";
import {describe, it, expect, afterEach, vi} from "vitest";

afterEach(async () => {
    vi.clearAllMocks();
    await cleanup();
});

describe("Hook tests", () => {
    it("Unsafe hook throws", () => {
        const {result} = renderHook(useConfiguration);

        expect(result.error).toBeTruthy();
    });

    it("Safe hook don't throw", () => {
        const {result} = renderHook(useConfigurationInitialization);

        expect(result.error).toBeFalsy();
    });
});