import {GlobalAttributeIdKeyBuilder, type Attribute, type GlobalAttributeId} from "@viamedici-spc/configurator-ts";
import {isConfigurationInitialized} from "../helper";
import {isImmutablyExcluded} from "../internal/ActiveAttributesController";
import {useAttributes} from "./attribute";
import {useConfigurationInitialization, useConfigurationUpdating} from "./configurationLifecycle";
import {useActiveAttributes, useRegisterActiveAttributes} from "./useActiveAttributes";

export type LiveAttributesResult =
    | {readonly status: "inactive" | "pending"}
    | {readonly status: "ready"; readonly attributes: readonly Attribute[]}
    | {readonly status: "missing"; readonly missingIds: readonly GlobalAttributeId[]}
    | {readonly status: "error"; readonly error: unknown; readonly retry?: () => void};

/**
 * Keep a visualization's dependencies active and read their confirmed values in the requested order.
 * Pass false when the visualization stays mounted in a hidden tab or panel.
 */
export function useLiveAttributes(ids: readonly GlobalAttributeId[], active = true): LiveAttributesResult {
    useRegisterActiveAttributes(ids, active);
    const attributes = useAttributes(active ? ids : [], false, false);
    const scope = useActiveAttributes();
    const initialization = useConfigurationInitialization();
    const updating = useConfigurationUpdating();

    if (!active) return {status: "inactive"};
    const sessionError = initialization.error ?? updating.error;
    if (sessionError) return {status: "error", error: sessionError, retry: sessionError.retry};
    if (scope.error) return {status: "error", error: scope.error, retry: scope.retry};
    if (scope.scopedDecisionRefresh?.status === "error") {
        return {status: "error", error: scope.scopedDecisionRefresh.error, retry: scope.retryScopedDecisionRefresh};
    }
    if (initialization.isInitializing || updating.isUpdating || !isConfigurationInitialized(attributes)
        || !scope.isScopeSettled || scope.scopedDecisionRefresh?.status === "refreshing") return {status: "pending"};
    if (!attributes.every(attribute => attribute !== undefined)) {
        return {status: "missing", missingIds: ids.filter((_, index) => attributes[index] === undefined)};
    }

    if (scope.activeAttributes !== null) {
        const confirmed = new Set(scope.activeAttributes.map(GlobalAttributeIdKeyBuilder));
        if (attributes.some((attribute, index) => !isImmutablyExcluded(attribute) && !confirmed.has(GlobalAttributeIdKeyBuilder(ids[index])))) {
            return {status: "pending"};
        }
    }
    return {status: "ready", attributes};
}
