import {Selectors} from "../Selectors";
import {GuardedAtom} from "../../../types";
import atomWithGuard from "../helper/atomWithGuard";

export type UseConfigurationReinitializationResult = {
    reinitialize: () => Promise<void>;
};

export function createUseSessionReinitializationHookAtom(configurationSessionAtom: Selectors["guardedConfigurationSessionAtom"]): GuardedAtom<UseConfigurationReinitializationResult> {
    return atomWithGuard((_, getGuarded) => {
        const session = getGuarded(configurationSessionAtom);

        return session.reinitialize.bind(session);
    });
}