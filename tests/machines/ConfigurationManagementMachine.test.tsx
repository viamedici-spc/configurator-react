import {cleanup} from "@testing-library/react-hooks";
import * as Contract from "@viamedici-spc/configurator-ts";
import {
    IConfiguratorClient,
    IConfigurationSession
} from "@viamedici-spc/configurator-ts";
import {emptyModel} from "../hooks/Common";
import {
    interpret,
    InterpreterStatus
} from "xstate";
import {waitFor} from "@testing-library/react";
import {describe, it, expect, afterEach, beforeEach, vi} from "vitest";
import {configurationManagementMachine} from "../../src/internal/configurationManagement";

let sut = interpret(configurationManagementMachine());

beforeEach(() => {
    sut = interpret(configurationManagementMachine());
});

afterEach(async () => {
    vi.clearAllMocks();
    await cleanup();

    if (sut.status === InterpreterStatus.Running)
        sut.stop();
});

describe("configurationManagementMachine tests", () => {
    it("isReadyPromise become null when object reference is kept", async () => {
        const sessionMock = vi.fn().mockImplementation(async (sessionContext) => {
            return {
                getSessionContext: () => sessionContext,
                getConfiguration: () => ({isSatisfied: true, attributes: []} as Contract.Configuration),
                setOnConfigurationChangedHandler: (_) => {
                },
                close: () => Promise.resolve()
            } as IConfigurationSession;
        });

        const configuratorClient: IConfiguratorClient = {
            createSession: sessionMock
        };

        sut.start();

        await waitFor(() => sut.getSnapshot().context.isReadyPromise != null);
        const promiseCapsule = sut.getSnapshot().context.isReadyPromise.capsule;
        const promise = promiseCapsule.promise;

        // Send the prerequisites
        sut.send({type: "ChangeConfigurationClient", client: configuratorClient});
        sut.send({type: "ChangeSessionContext", sessionContext: {configurationModelSource: emptyModel}});

        await waitFor(() => promise);
        expect(promiseCapsule.promise).toBeNull();
        expect(sut.getSnapshot().context.isReadyPromise).toBeNull();
    });
});