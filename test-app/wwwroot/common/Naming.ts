import {GlobalAttributeId, GlobalConstraintId} from "@viamedici-spc/configurator-ts";

export function attributeIdToString(attributeId: GlobalAttributeId): string {
    const sharedModel = attributeId.sharedConfigurationModelId && `shared::${attributeId.sharedConfigurationModelId}`;
    const componentPath = (attributeId.componentPath ?? []).join("::");

    return [
        sharedModel,
        componentPath,
        attributeId.localId
    ]
        .filter(s => s != null && s !== "")
        .join("::");
}

export function constraintIdToString(constraintId: GlobalConstraintId): string {
    return `${constraintId.configurationModelId}::${constraintId.localId}`;
}