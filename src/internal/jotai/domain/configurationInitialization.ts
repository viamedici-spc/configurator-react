import {atom} from "jotai";
import {ConfigurationInitialization, ConfigurationUninitialized, GuardedAtom} from "../../../types";
import {Selectors} from "../Selectors";
import {Bool, Eq, pipe, RA} from "@viamedici-spc/fp-ts-extensions";
import atomWithEq from "../helper/atomWithEq";

const eq = Eq.struct<ConfigurationInitialization>({
    isInitializing: Bool.Eq,
    error: Eq.eqNullable(Eq.eqStrict)
});

export function createConfigurationInitializationAtom(
    sessionInitializationAtom: Selectors["sessionInitializationAtom"],
    session: Selectors["guardedConfigurationSessionAtom"],
    configuration: Selectors["guardedConfigurationAtom"],
    canReset: Selectors["guardedCanResetAtom"],
    isSatisfied: Selectors["guardedIsSatisfiedAtom"],
    attributes: Selectors["guardedAttributesAtom"],
) {
    const guardedAtoms: ReadonlyArray<GuardedAtom<unknown>> = [
        session,
        configuration,
        canReset,
        isSatisfied,
        attributes,
    ];

    const baseAtom = atom<ConfigurationInitialization>(get => {
        const everyGuardedAtomIsInitialized = pipe(
            guardedAtoms,
            RA.every(loadable => get(loadable) !== ConfigurationUninitialized)
        );

        const sessionInitialization = get(sessionInitializationAtom);
        const isReady = !sessionInitialization.isInitializing && everyGuardedAtomIsInitialized;

        return {
            isInitializing: !isReady,
            error: sessionInitialization.error
        };
    });

    return atomWithEq(baseAtom, eq);
}