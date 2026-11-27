import type {Selectors} from "../Selectors";
import type {GuardedAtom} from "../../../types";
import atomWithGuard from "../helper/atomWithGuard";

export type UseSessionReinitializationResult = {
    readonly reinitializeSession: () => Promise<void>;
};

export function createSessionReinitializationAtom(
    configurationSessionAtom: Selectors["guardedConfigurationSessionAtom"],
): GuardedAtom<UseSessionReinitializationResult> {
    return atomWithGuard((_, getGuarded) => {
        const session = getGuarded(configurationSessionAtom);

        return {
            reinitializeSession: session.reinitialize.bind(session),
        };
    });
}