import {render, screen, cleanup} from "@testing-library/react";
import React, {Suspense} from "react";
import {ConfigurationSuspender} from "../src";
import {ConfigurationInitializationContext} from "../src/internal/contexts";
import {newDeferredPromise} from "../src/internal/deferredPromise";
import {describe, it, expect, afterEach, vi} from "vitest";


afterEach(() => {
    vi.clearAllMocks();
    cleanup();
});

describe("ConfigurationSuspender tests", () => {
    it("Suspense when the configuration is initializing", async () => {
        function WrappingComponent(props: { isInitializing: boolean, promise: Promise<void> }) {
            return (
                <ConfigurationInitializationContext.Provider
                    value={{isInitializing: props.isInitializing, isInitializingPromise: {promise: props.promise}}}>
                    <Suspense fallback={<span>Loading</span>}>
                        <ConfigurationSuspender>
                            <span>Loaded</span>
                        </ConfigurationSuspender>
                    </Suspense>
                </ConfigurationInitializationContext.Provider>
            );
        }

        let deferredPromise = newDeferredPromise<void>();
        const {rerender} = render(<WrappingComponent isInitializing={true} promise={deferredPromise.promise}/>);
        expect(screen.getByText("Loading")).toBeTruthy();
        expect(() => screen.getByText("Loaded")).toThrow();

        deferredPromise.resolve();
        rerender(<WrappingComponent isInitializing={false} promise={null}/>);
        expect(() => screen.getByText("Loading")).toThrow();
        expect(screen.getByText("Loaded")).toBeTruthy();

        deferredPromise = newDeferredPromise<void>();
        rerender(<WrappingComponent isInitializing={true} promise={deferredPromise.promise}/>);
        expect(screen.getByText("Loading")).toBeTruthy();
        // React Suspense sets display:none if suspender throws a promise after the children were loaded.
        expect(screen.getByText("Loaded").style.display).toBe("none");
    });
});