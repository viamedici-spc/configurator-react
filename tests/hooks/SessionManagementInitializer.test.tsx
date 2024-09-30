import {cleanup} from "@testing-library/react-hooks";
import {describe, it, expect, afterEach, vi} from "vitest";
import {render, waitFor} from "@testing-library/react";
import {AtomsContext} from "../../src/internal/contexts";
import {createAtoms} from "../../src/internal/jotai/Atoms";
import SessionManagementInitializer, {sessionContextNullishWarningText} from "../../src/internal/SessionManagementInitializer";
import {SessionContext} from "@viamedici-spc/configurator-ts";

afterEach(async () => {
    vi.clearAllMocks();
    await cleanup();
});

describe("SessionManagementInitializer tests", () => {
    it("Warns if Context is null", async () => {
        const consoleWarnMock = vi.spyOn(console, "warn");

        const atoms = createAtoms();
        render(<AtomsContext.Provider value={atoms}>
            <SessionManagementInitializer sessionContext={null as any as SessionContext}/>
        </AtomsContext.Provider>)

        await waitFor(() => expect(consoleWarnMock).toBeCalledTimes(1));
        expect(consoleWarnMock.mock.calls[0][0]).toBe(sessionContextNullishWarningText);
    });
});