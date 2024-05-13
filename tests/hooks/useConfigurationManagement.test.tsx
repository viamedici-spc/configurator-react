import {cleanup, renderHook} from "@testing-library/react-hooks";
import {emptyModel} from "./Common";
import {ConfigurationManagementProps, useConfigurationManagement} from "../../src/internal/configurationManagement";
import {describe, it, expect, afterEach, vi} from "vitest";

afterEach(async () => {
    vi.clearAllMocks();
    await cleanup();
});

describe("useConfigurationManagement test", () => {
    it("Warns if Client is null", async () => {
        const consoleWarnMock = vi.spyOn(global.console, 'warn');

        const props: ConfigurationManagementProps = {
            configuratorClient: null,
            sessionContext: {
                configurationModelSource: emptyModel
            }
        }
        const {waitFor} = renderHook(useConfigurationManagement, {initialProps: props});

        await waitFor(() => expect(consoleWarnMock).toBeCalledTimes(1));
    });

    it("Warns if Context is null", async () => {
        const consoleWarnMock = vi.spyOn(global.console, "warn");

        const props: ConfigurationManagementProps = {
            configuratorClient: {
                createSession: (_) => {
                    throw new Error("Not implemented");
                }
            },
            sessionContext: null
        }
        const {waitFor} = renderHook(useConfigurationManagement, {initialProps: props});

        await waitFor(() => expect(consoleWarnMock).toBeCalledTimes(1));
    });

    it("Warns if Client and Context are null", async () => {
        const consoleWarnMock = vi.spyOn(global.console, "warn");

        const props: ConfigurationManagementProps = {
            configuratorClient: null,
            sessionContext: null
        }
        const {waitFor} = renderHook(useConfigurationManagement, {initialProps: props});

        await waitFor(() => expect(consoleWarnMock).toBeCalledTimes(2));
    });
});