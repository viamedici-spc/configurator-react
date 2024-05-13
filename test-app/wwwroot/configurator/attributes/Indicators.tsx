import {useActiveAttribute} from "./AttributeItem";
import {useAttributes, useExplain} from "@viamedici-spc/configurator-react";
import {handleExplain} from "../../common/Explain";

export function SatisfactionIndicator() {
    const activeAttribute = useActiveAttribute();
    const [attribute] = useAttributes([activeAttribute]);
    const {explain, applySolution} = useExplain();


    const onExplain = () => {
        handleExplain(() => explain(b => b.whyIsNotSatisfied.attribute(attribute.id), "full"), applySolution);
    };

    const color = attribute.isSatisfied ? "var(--color-satisfied)" : "var(--color-unsatisfied)";
    return (<>
        <span style={{color: color}}>
            {attribute.isSatisfied ? "satisfied" : "unsatisfied "}
        </span>
        {!attribute.isSatisfied && <button onClick={onExplain}>Explain</button>}
    </>);
}