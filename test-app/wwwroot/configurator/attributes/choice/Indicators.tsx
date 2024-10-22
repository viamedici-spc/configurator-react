import {useActiveAttribute} from "../AttributeItem";
import {
    AttributeInterpreter
} from "@viamedici-spc/configurator-ts";
import {useAttributes, useChoiceAttribute} from "@viamedici-spc/configurator-react";

export function MandatoryIndicator() {
    const activeAttribute = useActiveAttribute();
    const [attribute] = useAttributes([activeAttribute], false);
    const color = AttributeInterpreter.isMandatory(attribute) ? "var(--color-mandatory)" : "var(--color-optional)";

    return (
        <span style={{color: color}}>
            {AttributeInterpreter.isMandatory(attribute) ? "mandatory" : "optional"}
        </span>
    )
}

export function SelectionModeIndicator() {
    const activeAttribute = useActiveAttribute();
    const {isMultiSelect} = useChoiceAttribute(activeAttribute);

    return (
        <span style={{color: "var(--color-selection-mode)"}}>
            {isMultiSelect() ? "multi-select" : "single-select"}
        </span>
    )
}

export function AvailableValuesIndicator() {
    const activeAttribute = useActiveAttribute();
    const {getAllowedChoiceValues} = useChoiceAttribute(activeAttribute);
    const allowed = getAllowedChoiceValues();

    return (
        <span style={{color: "var(--color-allowed-values)"}}>
            {`${allowed.length} allowed values`}
        </span>
    )
}