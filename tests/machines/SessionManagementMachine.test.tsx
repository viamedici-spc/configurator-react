import {cleanup} from "@testing-library/react-hooks";
import {ConfigurationModelNotFound, ConfiguratorError, ConfiguratorErrorType, IConfigurationSession, ISessionFactory, SessionContext, SessionFactory} from "@viamedici-spc/configurator-ts";
import {emptyModel, modelWithOneAttribute} from "../hooks/Common";
import {Actor, createActor} from "xstate";
import {waitFor} from "@testing-library/react";
import {afterEach, beforeEach, describe, expect, it, Mocked, vi} from "vitest";
import {sessionManagementMachine} from "../../src/internal/sessionManagementMachine";

vi.mock("@viamedici-spc/configurator-ts", async (importOriginal) => {
    return {
        ...(await importOriginal()),
        SessionFactory: {
            createSession: vi.fn()
        } satisfies ISessionFactory
    };
});

const createSessionMock = vi.mocked(SessionFactory.createSession);

globalThis.fetch = () => {
    console.log("Fetch got called");
    throw new Error("");
}

describe("SessionManagementMachine tests", () => {
    let sut: Actor<typeof sessionManagementMachine>;

    beforeEach(() => {
        sut = createActor(sessionManagementMachine);
    });

    afterEach(async () => {
        vi.clearAllMocks();
        vi.resetAllMocks();
        await cleanup();

        if (sut.getSnapshot().status === "active")
            sut.stop();
    });

    it("Session is closed on Shutdown", async () => {
        const closeMock = vi.fn().mockImplementation(() => Promise.resolve());
        createSessionMock.mockImplementation((sessionContext) => Promise.resolve({
            getSessionContext: () => sessionContext,
            close: () => closeMock()
        } as IConfigurationSession));

        sut.start();
        sut.send({type: "SessionContextChanged", sessionContext: {sessionInitialisationOptions: {accessToken: ""}, configurationModelSource: emptyModel}});
        await waitFor(() => expect(createSessionMock).toBeCalledTimes(1));

        sut.send({type: "Shutdown"});
        await waitFor(() => expect(closeMock).toBeCalledTimes(1));
    });

    it("Session gets updated on Context change", async () => {
        createSessionMock.mockImplementation((sessionContext) => {
            let currentContext = sessionContext;
            return Promise.resolve({
                getSessionContext: () => currentContext,
                close: vi.fn(() => Promise.resolve()) as () => Promise<void>,
                setSessionContext: vi.fn((c) => new Promise<void>((resolve) => {
                    currentContext = c;
                    resolve();
                })) as (sessionContext: SessionContext) => Promise<void>
            } as IConfigurationSession);
        });

        sut.start();
        sut.send({type: "SessionContextChanged", sessionContext: {sessionInitialisationOptions: {accessToken: ""}, configurationModelSource: emptyModel}});
        sut.send({type: "SessionContextChanged", sessionContext: {sessionInitialisationOptions: {accessToken: ""}, configurationModelSource: modelWithOneAttribute}});

        await waitFor(() => expect(createSessionMock).toBeCalledTimes(1));
        const initialSessionContext = createSessionMock.mock.calls[0][0] as SessionContext;
        expect(initialSessionContext.configurationModelSource).toBe(emptyModel);
        expect(initialSessionContext.attributeRelations).toBeUndefined();
        expect(initialSessionContext.usageRuleParameters).toBeUndefined();

        const session = (await createSessionMock.mock.results[0].value) as Mocked<IConfigurationSession>;
        await waitFor(() => expect(session.setSessionContext).toBeCalledTimes(1));
        const updatedSessionContext = session.setSessionContext.mock.calls[0][0] as SessionContext;
        expect(updatedSessionContext.configurationModelSource).toBe(modelWithOneAttribute);
        expect(updatedSessionContext.attributeRelations).toBeUndefined();
        expect(updatedSessionContext.usageRuleParameters).toBeUndefined();

        expect(session.close).toBeCalledTimes(0);
    });

    it("Session creation error - Retry", async () => {
        const getSession = (sessionContext: SessionContext) => {
            let currentContext = sessionContext;

            return {
                getSessionContext: () => currentContext,
                setSessionContext: (c) => {
                    currentContext = c;
                },
                close: () => Promise.resolve(null)
            } as any as IConfigurationSession;
        };

        createSessionMock
            .mockImplementationOnce(() => Promise.reject({
                type: ConfiguratorErrorType.ConfigurationModelNotFound,
                title: "",
                detail: ""
            } satisfies ConfigurationModelNotFound))
            .mockImplementationOnce(c => Promise.resolve(getSession(c)));

        sut.start();
        sut.send({type: "SessionContextChanged", sessionContext: {sessionInitialisationOptions: {accessToken: ""}, configurationModelSource: emptyModel}});

        // Expect that there is an error
        await waitFor(() => expect(sut.getSnapshot().context.sessionCreateOrUpdateError?.configurationError).toBeTruthy());
        expect(sut.getSnapshot().context.sessionCreateOrUpdateError?.configurationError.type).toBe(ConfiguratorErrorType.ConfigurationModelNotFound);
        expect(createSessionMock).toHaveBeenCalledTimes(1);

        sut.send({type: "Retry"});

        // The error must be gone after the retry.
        await waitFor(() => expect(sut.getSnapshot().context.sessionCreateOrUpdateError).toBeFalsy());
        expect(createSessionMock).toHaveBeenCalledTimes(2);
        expect(sut.getSnapshot().context.configurationSession).toBeTruthy();
    });

    it("Session updating error - Retry", async () => {
        let currentContext: SessionContext;
        const setSessionContextMock = vi.fn()
            .mockImplementationOnce(() => Promise.reject({
                type: ConfiguratorErrorType.ConfigurationModelNotFound
            } as ConfiguratorError))
            .mockImplementationOnce(c => {
                currentContext = c;
                return Promise.resolve();
            });

        const getSession = (sessionContext: SessionContext) => {
            currentContext = sessionContext;
            return {
                getSessionContext: () => currentContext,
                setSessionContext: setSessionContextMock as IConfigurationSession["setSessionContext"],
                close: () => Promise.resolve(null)
            } as any as IConfigurationSession;
        };

        createSessionMock.mockImplementation(c => Promise.resolve(getSession(c)));

        sut.start();
        // Create a session by setting the session context
        sut.send({type: "SessionContextChanged", sessionContext: {sessionInitialisationOptions: {accessToken: ""}, configurationModelSource: emptyModel}});
        await waitFor(() => expect(sut.getSnapshot().context.sessionCreateOrUpdateError).toBeFalsy());

        // Updating the session context should fail
        sut.send({type: "SessionContextChanged", sessionContext: {sessionInitialisationOptions: {accessToken: ""}, configurationModelSource: modelWithOneAttribute}});
        await waitFor(() => expect(sut.getSnapshot().context.sessionCreateOrUpdateError?.configurationError).toBeTruthy());
        expect(sut.getSnapshot().context.sessionCreateOrUpdateError?.configurationError.type).toBe(ConfiguratorErrorType.ConfigurationModelNotFound);

        sut.send({type: "Retry"});

        // The error must be gone after the retry.
        await waitFor(() => expect(sut.getSnapshot().context.sessionCreateOrUpdateError).toBeFalsy());
        expect(setSessionContextMock).toHaveBeenCalledTimes(2);
        expect(sut.getSnapshot().context.configurationSession).toBeTruthy();

        expect(createSessionMock).toHaveBeenCalledTimes(1);
    });
});