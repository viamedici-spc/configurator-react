import type {ScheduleTaskResult} from "@viamedici-spc/configurator-ts";
import type {Selectors} from "../Selectors";
import type {GuardedAtom} from "../../../types";
import atomWithGuard from "../helper/atomWithGuard";

/** The command {@link useTaskScheduling} returns. */
export type UseTaskSchedulingResult = {
    /**
     * Schedules a task at the end of the session's queue and resolves once it runs — for example to wait until all
     * decisions made so far are processed.
     *
     * @param signal Aborts the wait; the promise then rejects with the signal's reason.
     * @returns The {@link ScheduleTaskResult}; its `pendingTasks` counts the tasks still waiting.
     * @throws `TaskCancelled` if the session is closed while the task waits.
     * @throws `SessionClosed` if the session is already closed.
     * @throws `ConfiguratorError` if a general configuration error occurs.
     */
    readonly scheduleTask: (signal?: AbortSignal | null) => Promise<ScheduleTaskResult>;
};

export function createTaskSchedulingAtom(
    configurationSessionAtom: Selectors["guardedConfigurationSessionAtom"],
): GuardedAtom<UseTaskSchedulingResult> {
    return atomWithGuard((_, getGuarded) => {
        const session = getGuarded(configurationSessionAtom);

        return {
            scheduleTask: session.scheduleTask.bind(session),
        };
    });
}