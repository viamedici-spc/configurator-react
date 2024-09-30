import {Selectors} from "../Selectors";
import {GuardedAtom} from "../../../types";
import atomWithGuard from "../helper/atomWithGuard";

export type UseResetConfigurationResult = {
    canReset: boolean,
    reset: () => Promise<void>
};

export function createUseResetConfigurationHookAtom(configurationSessionAtom: Selectors["guardedConfigurationSessionAtom"], canResetAtom: Selectors["guardedCanResetAtom"]): GuardedAtom<UseResetConfigurationResult> {
    return atomWithGuard((_, getGuarded) => {
        const session = getGuarded(configurationSessionAtom);
        const canReset = getGuarded(canResetAtom);

        return {
            canReset: canReset,
            reset: session.resetConfiguration.bind(session),
        };
    });
}