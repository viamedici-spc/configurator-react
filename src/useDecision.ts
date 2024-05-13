import {ExplicitDecision, SetManyMode} from "@viamedici-spc/configurator-ts";
import {useMemo} from "react";
import {useConfigurationSessionContext} from "./internal/contexts";
import {throwIfSessionIsNull} from "./internal/throwHelper";

export type UseDecisionResult = {
    makeDecision: (decision: ExplicitDecision) => Promise<void>,
    setManyDecision: (decisions: ReadonlyArray<ExplicitDecision>, mode: SetManyMode) => Promise<void>
};

/**
 * Gets commands for making one or many decisions.
 * @throws If configuration is initializing.
 */
export default function useDecision(): UseDecisionResult {
    const configurationSession = useConfigurationSessionContext();
    throwIfSessionIsNull(configurationSession);

    return useMemo(() => ({
        makeDecision: d => configurationSession.makeDecision(d),
        setManyDecision: (d, m) => configurationSession.setMany(d, m)
    }) as UseDecisionResult, [configurationSession]);
}