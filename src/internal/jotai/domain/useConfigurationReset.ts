import {Selectors} from "../Selectors";
import {GuardedAtom} from "../../../types";
import atomWithGuard from "../helper/atomWithGuard";

export type UseConfigurationResetResult = {
    canResetConfiguration: boolean,
    resetConfiguration: () => Promise<void>
};

export function createUseConfigurationResetHookAtom(configurationSessionAtom: Selectors["guardedConfigurationSessionAtom"], canResetAtom: Selectors["guardedCanResetAtom"]): GuardedAtom<UseConfigurationResetResult> {
    return atomWithGuard((_, getGuarded) => {
        const session = getGuarded(configurationSessionAtom);
        const canReset = getGuarded(canResetAtom);

        return {
            canResetConfiguration: canReset,
            resetConfiguration: session.resetConfiguration.bind(session),
        };
    });
}