import type {ScheduleTaskResult} from "@viamedici-spc/configurator-ts";
import type {Selectors} from "../Selectors";
import type {GuardedAtom} from "../../../types";
import atomWithGuard from "../helper/atomWithGuard";

export type UseTaskSchedulingResult = {
    scheduleTask: (signal?: AbortSignal | null) => Promise<ScheduleTaskResult>;
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