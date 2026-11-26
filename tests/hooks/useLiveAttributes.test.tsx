import {act, renderHook} from "@testing-library/react-hooks";
import {GlobalAttributeIdKeyBuilder, type GlobalAttributeId, type IConfigurationSession} from "@viamedici-spc/configurator-ts";
import type {PropsWithChildren} from "react";
import {expect, it, vi} from "vitest";
import {useLiveAttributes} from "../../src";
import {ActiveAttributesProvider} from "../../src/hooks/useActiveAttributes";
import {booleanAttribute, WrappingComponent} from "./Common";

it("shares a dynamic preview scope and only returns confirmed values", async () => {
    const first = booleanAttribute;
    const secondId = {localId: first.id.localId, componentPath: ["Housing"]};
    const second = {...first, id: secondId, key: GlobalAttributeIdKeyBuilder(secondId)};
    const configuration = {isSatisfied: true, attributes: new Map([[first.key, first], [second.key, second]])};
    let active: readonly GlobalAttributeId[] | null = null;
    let refresh: {status: "idle" | "refreshing"} | {status: "error"; error: unknown} = {status: "idle"};
    let releaseScope = () => {};
    const gate = new Promise<void>(resolve => {releaseScope = resolve;});
    const listeners = new Set<() => void>();
    const notify = () => listeners.forEach(listener => listener());
    const retry = vi.fn();
    const sessionContext = {};
    const setActiveAttributes = vi.fn(async (ids: readonly GlobalAttributeId[] | null) => {
        await gate;
        active = ids;
    });
    const session = {
        getSessionContext: () => sessionContext,
        getConfiguration: () => configuration,
        getActiveAttributes: () => active,
        setActiveAttributes,
        getPendingOperationCount: () => 0,
        addPendingOperationsChangedListener: (listener: () => void) => {
            listeners.add(listener);
            return {unsubscribe: () => {listeners.delete(listener);}};
        },
        getScopedDecisionRefreshState: () => refresh,
        retryScopedDecisionRefresh: retry,
    } as unknown as IConfigurationSession;
    const wrapper = ({children}: PropsWithChildren<{}>) => (
        <WrappingComponent session={session} configuration={configuration}>
            <ActiveAttributesProvider enabled>{children}</ActiveAttributesProvider>
        </WrappingComponent>
    );
    const {result, waitFor, rerender, unmount} = renderHook(
        ({ids, visible}: {ids: readonly GlobalAttributeId[]; visible: boolean}) => useLiveAttributes(ids, visible),
        {wrapper, initialProps: {ids: [secondId, first.id], visible: true}}
    );
    try {
        expect(result.current.status).toBe("pending");
        await act(async () => {releaseScope();});
        await waitFor(() => expect(result.current).toEqual({status: "ready", attributes: [second, first]}));
        expect(setActiveAttributes).toHaveBeenCalledTimes(1);
        rerender({ids: [{...secondId}, {...first.id}], visible: true});
        expect(setActiveAttributes).toHaveBeenCalledTimes(1);

        act(() => {refresh = {status: "refreshing"}; notify();});
        expect(result.current.status).toBe("pending");
        const error = new Error("Read failed");
        act(() => {refresh = {status: "error", error}; notify();});
        expect(result.current).toMatchObject({status: "error", error});
        if (result.current.status === "error") result.current.retry?.();
        expect(retry).toHaveBeenCalledTimes(1);
        act(() => {refresh = {status: "idle"}; notify();});
        expect(result.current.status).toBe("ready");

        rerender({ids: [first.id, {localId: "missing"}], visible: true});
        await waitFor(() => expect(result.current).toEqual({status: "missing", missingIds: [{localId: "missing"}]}));
        rerender({ids: [first.id], visible: false});
        await waitFor(() => expect(setActiveAttributes).toHaveBeenLastCalledWith([]));
        expect(result.current.status).toBe("inactive");
    } finally {
        unmount();
    }
});
