import {Selectors} from "../Selectors";
import {GuardedAtom} from "../../../types";
import atomWithGuard from "../helper/atomWithGuard";

export type UseTaskSchedulingResult = {
    scheduleTask: (signal?: AbortSignal | null) => Promise<void>;
};

export function createTaskSchedulingAtom(configurationSessionAtom: Selectors["guardedConfigurationSessionAtom"]): GuardedAtom<UseTaskSchedulingResult> {
    return atomWithGuard((_, getGuarded) => {
        const session = getGuarded(configurationSessionAtom);

        return {
            scheduleTask: session.scheduleTask.bind(session),
        };
    });
}