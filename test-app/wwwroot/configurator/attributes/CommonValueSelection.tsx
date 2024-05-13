import styled from "styled-components/macro";

const Root = styled.select`
    grid-area: value-selection;
`;

export type Value<TId extends string> = {
    id: TId,
    name?: string,
    isImplicit?: boolean
}

type Props<TId extends string> = {
    nothingValue: Value<TId>,
    allowedValues: ReadonlyArray<Value<TId>>,
    blockedValues: ReadonlyArray<Value<TId>>,
    isMultiselect: boolean,
    selectedValues: TId | TId[],
    onChange: (value: TId) => void
}

export default function CommonValueSelection<TId extends string>(props: Props<TId>) {
    const allowedValues = props.allowedValues.filter(Boolean);
    const blockedValues = props.blockedValues.filter(Boolean);

    return (
        <Root value={props.selectedValues}
              multiple={props.isMultiselect}
              onChange={e => props.onChange(e.currentTarget.value as TId)}>

            <Option value={props.nothingValue}/>

            {allowedValues.map(v => (
                <Option key={v.id} value={v}/>
            ))}

            {blockedValues.length > 0 && (
                <optgroup label="Blocked">
                    {blockedValues.map(v => (
                        <Option key={v.id} value={v}/>
                    ))}
                </optgroup>
            )}
        </Root>
    )
}

function Option<TId extends string>({value}: { value: Value<TId> }) {
    return (
        <option key={value.id} value={value.id}>
            {value.isImplicit ? "Implicit: " : ""}
            {value.name ?? value.id}
        </option>
    );
}