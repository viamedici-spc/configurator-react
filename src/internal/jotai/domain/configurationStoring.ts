import {MakeManyDecisionsMode, MakeManyDecisionsResult, StoredConfiguration} from "@viamedici-spc/configurator-ts";
import {Selectors} from "../Selectors";
import {GuardedAtom} from "../../../types";
import atomWithGuard from "../helper/atomWithGuard";

export type UseConfigurationStoringResult = {
    storeConfiguration: () => Promise<StoredConfiguration>;
    restoreConfiguration: (storedConfiguration: StoredConfiguration, mode: MakeManyDecisionsMode) => Promise<MakeManyDecisionsResult>;
};

export function createConfigurationStoringAtom(configurationSessionAtom: Selectors["guardedConfigurationSessionAtom"]): GuardedAtom<UseConfigurationStoringResult> {
    return atomWithGuard((_, getGuarded) => {
        const session = getGuarded(configurationSessionAtom);

        return {
            storeConfiguration: session.storeConfiguration.bind(session),
            restoreConfiguration: session.restoreConfiguration.bind(session),
        };
    });
}