import {ConfigurationUpdating} from "../../../types";
import {Selectors} from "../Selectors";
import {Bool, Eq} from "@viamedici-spc/fp-ts-extensions";
import atomWithEq from "../helper/atomWithEq";

const eq = Eq.struct<ConfigurationUpdating>({
    isUpdating: Bool.Eq,
    error: Eq.eqNullable(Eq.eqStrict)
});

export function createConfigurationUpdatingAtom(sessionUpdatingAtom: Selectors["sessionUpdatingAtom"]) {
    return atomWithEq<ConfigurationUpdating>(sessionUpdatingAtom, eq);
}