import {cleanup} from "@testing-library/react-hooks";
import * as Contract from "@viamedici-spc/configurator-ts";
import {
    FailureResult,
    FailureType,
    IConfiguratorClient,
    IConfigurationSession,
    SessionContext
} from "@viamedici-spc/configurator-ts";
import {emptyModel, modelWithOneAttribute} from "../hooks/Common";
import {
    ActorRefFrom,
    assign,
    createMachine,
    interpret,
    InterpreterStatus,
    spawn
} from "xstate";
import {sessionManagementMachine, SessionManagementStateChangedEvent} from "../../src/internal/sessionManagement";
import {waitFor} from "@testing-library/react";
import {describe, it, expect, afterEach, beforeEach, vi, Mocked} from "vitest";

const testMachine = createMachine({
    predictableActionArguments: true,
    schema: {
        context: {} as {
            child: ActorRefFrom<typeof sessionManagementMachine>,
            lastChildMessage: SessionManagementStateChangedEvent
        },
        events: {} as SessionManagementStateChangedEvent
    },
    context: {
        child: null,
        lastChildMessage: null
    },
    entry: [
        assign({
            child: () => spawn(sessionManagementMachine())
        })
    ],
    on: {
        SessionManagementStateChanged: {
            actions: [
                assign({
                    lastChildMessage: (_, event) => event
                })
            ]
        }
    },
    initial: "Idle",
    states: {
        Idle: {}
    }
});

let sut = interpret(testMachine);

const sendToChild: ActorRefFrom<typeof sessionManagementMachine>["send"] = (event) => sut.getSnapshot().context.child.send(event);
const getLastMessage = () => sut.getSnapshot().context.lastChildMessage;

beforeEach(() => {
    sut = interpret(testMachine);
});

afterEach(async () => {
    vi.clearAllMocks();
    await cleanup();

    if (sut.status === InterpreterStatus.Running)
        sut.stop();
});

describe("sessionManagementMachine tests", () => {
    it("Session is created only once", async () => {
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
        sendToChild({type: "ChangeConfigurationClient", client: configuratorClient});
        sendToChild({type: "ChangeSessionContext", sessionContext: {configurationModelSource: emptyModel}});

        await waitFor(() => expect(sessionMock).toBeCalledTimes(1));
    });

    it("Session is closed on umount", async () => {
        const closeMock = vi.fn().mockImplementation(() => Promise.resolve());

        const configuratorClient: IConfiguratorClient = {
            createSession: (sessionContext) => {
                return Promise.resolve({
                    getSessionContext: () => sessionContext,
                    getConfiguration: () => ({isSatisfied: true, attributes: []} as Contract.Configuration),
                    setOnConfigurationChangedHandler: (_) => {
                    },
                    close: () => closeMock()
                } as IConfigurationSession);
            }
        };

        sut.start();
        sendToChild({type: "ChangeConfigurationClient", client: configuratorClient});
        sendToChild({type: "ChangeSessionContext", sessionContext: {configurationModelSource: emptyModel}});

        await waitFor(() => expect(getLastMessage().sessionInitialization.isInitializing).toBe(false));
        sut.stop();

        await waitFor(() => expect(closeMock).toBeCalledTimes(1));
    });

    it("Session gets disposed and recreated on Client change", async () => {
        const closeMock = vi.fn().mockImplementation(() => Promise.resolve());

        const sessionMock = vi.fn().mockImplementation(async (sessionContext) => {
            return {
                getSessionContext: () => sessionContext,
                getConfiguration: () => ({isSatisfied: true, attributes: []} as Contract.Configuration),
                setOnConfigurationChangedHandler: (_) => {
                },
                close: () => closeMock()
            } as IConfigurationSession;
        });

        const configuratorClient1: IConfiguratorClient = {
            createSession: sessionMock
        };

        const configuratorClient2: IConfiguratorClient = {
            createSession: sessionMock
        };

        sut.start();
        sendToChild({type: "ChangeConfigurationClient", client: configuratorClient1});
        sendToChild({type: "ChangeSessionContext", sessionContext: {configurationModelSource: emptyModel}});

        await waitFor(() => expect(sessionMock).toBeCalledTimes(1), {timeout: 5000});

        sendToChild({type: "ChangeConfigurationClient", client: configuratorClient2});

        await waitFor(() => expect(closeMock).toBeCalledTimes(1), {timeout: 5000});
        await waitFor(() => expect(sessionMock).toBeCalledTimes(2), {timeout: 5000});
    });

    it("Session gets updated on Context change", async () => {
        const createSessionMock = vi.fn().mockImplementation((sessionContext) => {
            let currentContext = sessionContext;
            return {
                getSessionContext: () => currentContext,
                getConfiguration: () => ({isSatisfied: true, attributes: []} as Contract.Configuration),
                setOnConfigurationChangedHandler: (_) => {
                },
                close: vi.fn(() => Promise.resolve()) as () => Promise<void>,
                setSessionContext: vi.fn((c) => new Promise((resolve) => {
                    currentContext = c;
                    resolve();
                })) as (sessionContext: SessionContext) => Promise<void>
            } as IConfigurationSession;
        });

        const configuratorClient: IConfiguratorClient = {
            createSession: (context) => Promise.resolve(createSessionMock(context))
        };

        sut.start();
        sendToChild({type: "ChangeConfigurationClient", client: configuratorClient});
        sendToChild({type: "ChangeSessionContext", sessionContext: {configurationModelSource: emptyModel}});

        sendToChild({type: "ChangeSessionContext", sessionContext: {configurationModelSource: modelWithOneAttribute}});

        expect(createSessionMock).toBeCalledTimes(1);
        const initialSessionContext = createSessionMock.mock.calls[0][0] as SessionContext;
        expect(initialSessionContext.configurationModelSource).toBe(emptyModel);
        expect(initialSessionContext.attributeRelations).toBeUndefined();
        expect(initialSessionContext.usageRuleParameters).toBeUndefined();

        const session = createSessionMock.mock.results[0].value as Mocked<IConfigurationSession>;
        await waitFor(() => expect(session.setSessionContext).toBeCalledTimes(1), {timeout: 5000});
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
            } as IConfigurationSession;
        };

        const configuratorClient: IConfiguratorClient = {
            createSession: vi.fn() as (sessionContext: SessionContext) => Promise<IConfigurationSession>
        };

        vi.mocked(configuratorClient.createSession)
            .mockImplementationOnce(() => Promise.reject({
                type: FailureType.ConfigurationModelNotFound
            } as FailureResult))
            .mockImplementationOnce(c => Promise.resolve(getSession(c)));

        sut.start();
        sendToChild({type: "ChangeConfigurationClient", client: configuratorClient});
        sendToChild({type: "ChangeSessionContext", sessionContext: {configurationModelSource: emptyModel}});

        await waitFor(() => expect(getLastMessage().sessionInitialization.isInitializing).toBeFalsy());
        await waitFor(() => expect(getLastMessage().sessionInitialization.failureResult).toBeTruthy());
        expect(getLastMessage().sessionInitialization.failureResult.type).toBe(FailureType.ConfigurationModelNotFound);
        expect(configuratorClient.createSession).toHaveBeenCalledTimes(1);

        sendToChild({type: "RetrySessionCreation"});

        await waitFor(() => expect(getLastMessage().sessionInitialization.isInitializing).toBeFalsy());
        await waitFor(() => expect(getLastMessage().sessionInitialization.failureResult).toBeFalsy());
        expect(configuratorClient.createSession).toHaveBeenCalledTimes(2);
        expect(getLastMessage().session).toBeTruthy();
    });

    it("Session updating error - Retry", async () => {
        let currentContext: SessionContext;
        const setSessionContextMock = vi.fn()
            .mockImplementationOnce(() => Promise.reject({
                type: FailureType.ConfigurationModelNotFound
            } as FailureResult))
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
            } as IConfigurationSession;
        };

        const configuratorClient: IConfiguratorClient = {
            createSession: vi.fn()
                .mockImplementation(c => Promise.resolve(getSession(c))) as IConfiguratorClient["createSession"]
        };

        sut.start();
        sendToChild({type: "ChangeConfigurationClient", client: configuratorClient});
        sendToChild({type: "ChangeSessionContext", sessionContext: {configurationModelSource: emptyModel}});

        sendToChild({type: "ChangeSessionContext", sessionContext: {configurationModelSource: modelWithOneAttribute}});

        await waitFor(() => expect(getLastMessage().sessionUpdating.isUpdating).toBeFalsy());
        await waitFor(() => expect(getLastMessage().sessionUpdating.failureResult).toBeTruthy());
        expect(getLastMessage().sessionUpdating.failureResult.type).toBe(FailureType.ConfigurationModelNotFound);

        sendToChild({type: "RetrySessionUpdate"});

        await waitFor(() => expect(getLastMessage().sessionUpdating.isUpdating).toBeFalsy());
        await waitFor(() => expect(getLastMessage().sessionUpdating.failureResult).toBeFalsy());
        expect(setSessionContextMock).toHaveBeenCalledTimes(2);
        expect(getLastMessage().session).toBeTruthy();

        expect(configuratorClient.createSession).toHaveBeenCalledTimes(1);
    });
});