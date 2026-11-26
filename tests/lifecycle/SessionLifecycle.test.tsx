import {afterEach, describe, expect, it, vi} from "vitest";
import {act, cleanup, fireEvent, render, type RenderResult, screen} from "@testing-library/react";
import {type ReactElement, StrictMode, Suspense, useState, version as reactVersion} from "react";
import {
    Configuration,
    useChoiceAttribute,
    useConfigurationInitialization,
    useDecisions,
    useStoredConfiguration,
} from "../../src";
import type {IConfigurationSession, ISessionFactory, SessionContext} from "@viamedici-spc/configurator-ts";
import {DecisionKind, SessionFactory} from "@viamedici-spc/configurator-ts";
import {choiceAttribute, emptyModel} from "../hooks/Common";

// The session lifecycle as an application drives it: mount, suspend until the session exists, mount more readers later,
// unmount — with and without StrictMode, which mounts effects twice.

vi.mock("@viamedici-spc/configurator-ts", async importOriginal => ({
    ...(await importOriginal<object>()),
    SessionFactory: {createSession: vi.fn()} satisfies ISessionFactory,
}));
const createSessionMock = vi.mocked(SessionFactory.createSession);

const sessions = {created: 0, closed: 0};
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function fakeSession(context: SessionContext): IConfigurationSession {
    sessions.created++;
    let sessionContext = context;
    const configuration = {isSatisfied: false, attributes: new Map([[choiceAttribute.key, choiceAttribute]])};
    const subscription = {unsubscribe() {}};
    return {
        getSessionContext: () => sessionContext,
        setSessionContext: async (c: SessionContext) => {
            sessionContext = c;
        },
        close: async () => {
            sessions.closed++;
        },
        reinitialize: async () => {},
        storeConfiguration: () => ({}),
        restoreConfiguration: async () => {},
        explain: async () => ({}),
        applySolution: async () => ({}),
        getDecisions: () => [],
        makeDecision: async () => {},
        makeManyDecisions: async () => ({}),
        resetConfiguration: async () => {},
        scheduleTask: async () => {},
        addConfigurationChangedListener: (handler: (...args: unknown[]) => void) => {
            handler(configuration, {
                isSatisfied: false,
                attributes: {added: [choiceAttribute], changed: [], removed: []},
            });
            return subscription;
        },
        addCanResetConfigurationChangedListener: (handler: (canReset: boolean) => void) => {
            handler(false);
            return subscription;
        },
        addDecisionsChangedListener: (...args: unknown[]) => {
            (args[args.length - 1] as (decisions: unknown[]) => void)([]);
            return subscription;
        },
        addStoredConfigurationChangedListener: (handler: (stored: unknown) => void) => {
            handler({schemaVersion: 1, explicitDecisions: []});
            return subscription;
        },
    } as unknown as IConfigurationSession;
}

const sessionContext = {
    sessionInitialisationOptions: {accessToken: ""},
    configurationModelSource: emptyModel,
} as SessionContext;

function Attribute() {
    const attribute = useChoiceAttribute(choiceAttribute.key);
    return <div>attr:{attribute?.attribute.id.localId}</div>;
}

function Decisions() {
    const decisions = useDecisions();
    return <div>decisions:{decisions.length}</div>;
}

function TwoSuspendingHooks() {
    const decisions = useDecisions(DecisionKind.Explicit);
    useStoredConfiguration();
    return <div>two:{decisions.length}</div>;
}

function Initialization() {
    const initialization = useConfigurationInitialization();
    return <div>init:{String(initialization.isInitializing)}</div>;
}

function App(props: {strict: boolean; initializationOutside?: boolean}) {
    const [late, setLate] = useState(false);
    const tree = (
        <Configuration sessionContext={sessionContext}>
            {props.initializationOutside && <Initialization />}
            <Suspense fallback={<div>loading</div>}>
                <Attribute />
                <Decisions />
            </Suspense>
            {late && (
                <Suspense fallback={<div>late-loading</div>}>
                    <TwoSuspendingHooks />
                </Suspense>
            )}
            <button onClick={() => setLate(true)}>show</button>
        </Configuration>
    );
    return props.strict ? <StrictMode>{tree}</StrictMode> : tree;
}

// React 19 resumes a suspended render only within an awaited act scope.
async function renderAndSettle(element: ReactElement): Promise<RenderResult> {
    let rendered: RenderResult | undefined;
    await act(async () => {
        rendered = render(element);
    });
    return rendered!;
}

async function waitForText(text: string, timeoutMs = 1500): Promise<boolean> {
    const end = Date.now() + timeoutMs;
    while (Date.now() < end) {
        if (screen.queryByText(text)) {
            return true;
        }
        await act(async () => {
            await sleep(20);
        });
    }
    return false;
}

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    sessions.created = 0;
    sessions.closed = 0;
});

describe(`Session lifecycle on React ${reactVersion}`, () => {
    for (const strict of [false, true]) {
        it(`${strict ? "StrictMode" : "no StrictMode"}: loads, then a later component with two suspending hooks loads too`, async () => {
            createSessionMock.mockImplementation(c => sleep(30).then(() => fakeSession(c)));
            const rendered = await renderAndSettle(<App strict={strict} />);

            expect(await waitForText("decisions:0")).toBe(true);
            await act(async () => {
                fireEvent.click(screen.getByText("show"));
            });
            expect(await waitForText("two:0")).toBe(true);

            rendered.unmount();
            await act(async () => {
                await sleep(100);
            });
            expect(sessions.closed).toBe(sessions.created);
        });
    }

    it("StrictMode with useConfigurationInitialization outside Suspense loads and closes every session", async () => {
        createSessionMock.mockImplementation(c => sleep(30).then(() => fakeSession(c)));
        const rendered = await renderAndSettle(<App strict={true} initializationOutside={true} />);

        expect(await waitForText("decisions:0")).toBe(true);

        rendered.unmount();
        await act(async () => {
            await sleep(100);
        });
        expect(sessions.closed).toBe(sessions.created);
    });

    it("unmounting while the session is being created closes it once created", async () => {
        createSessionMock.mockImplementation(c => sleep(50).then(() => fakeSession(c)));
        const rendered = await renderAndSettle(<App strict={false} />);
        await act(async () => {
            await sleep(10);
        });

        rendered.unmount();
        await act(async () => {
            await sleep(150);
        });
        expect(sessions.created).toBe(1);
        expect(sessions.closed).toBe(1);
    });
});