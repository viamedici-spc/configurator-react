import {cleanup, render, renderHook, screen} from "@testing-library/react";
import {useConfiguration, useConfigurationInitialization} from "../../src";
import {describe, it, expect, afterEach, vi} from "vitest";
import {createAtoms} from "../../src/internal/jotai/Atoms";
import {AtomsContext} from "../../src/internal/contexts";
import type {PropsWithChildren} from "react";
import {Suspense} from "react";

afterEach(async () => {
    vi.clearAllMocks();
    await cleanup();
});
const atoms = createAtoms();

function ContextWrapper(props: PropsWithChildren<any>) {
    return <AtomsContext.Provider value={atoms}>{props.children}</AtomsContext.Provider>;
}

function ConfigurationReader() {
    useConfiguration();
    return <span>resolved</span>;
}

describe("Hook tests", () => {
    it("Unsafe hook suspends", async () => {
        // The test observes what an application sees: the Suspense fallback.
        render(
            <Suspense fallback={<span>suspended</span>}>
                <ConfigurationReader />
            </Suspense>,
            {wrapper: ContextWrapper},
        );

        expect(screen.getByText("suspended")).toBeTruthy();
        expect(screen.queryByText("resolved")).toBeNull();
    });

    it("Safe hook don't throw", () => {
        const {result} = renderHook(useConfigurationInitialization, {wrapper: ContextWrapper});

        expect(result.current).toBeDefined();
    });
});