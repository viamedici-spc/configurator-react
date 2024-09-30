import {cleanup, renderHook} from "@testing-library/react-hooks";
import {useConfiguration, useConfigurationInitialization} from "../../src";
import {describe, it, expect, afterEach, vi} from "vitest";
import {createAtoms} from "../../src/internal/jotai/Atoms";
import {AtomsContext} from "../../src/internal/contexts";
import {PropsWithChildren} from "react";

afterEach(async () => {
    vi.clearAllMocks();
    await cleanup();
});
const atoms = createAtoms();

function ContextWrapper(props: PropsWithChildren<any>) {
    return (<AtomsContext.Provider value={atoms}>{props.children}</AtomsContext.Provider>);
}

function useConfigurationWrapper(): "CaughtPromise" | "CaughtError" | "ResolvedSuccessful" {
    try {
        useConfiguration();
    } catch (e) {
        if ('then' in e) {
            return "CaughtPromise";
        }
        return "CaughtError";
    }

    return "ResolvedSuccessful";
}

describe("Hook tests", () => {
    it("Unsafe hook throws", async () => {
        const {result} = renderHook(useConfigurationWrapper, {wrapper: ContextWrapper});

        expect(result.current).toBe("CaughtPromise")
    });

    it("Safe hook don't throw", () => {
        const {result} = renderHook(useConfigurationInitialization, {wrapper: ContextWrapper});

        expect(result.error).toBeFalsy();
    });
});