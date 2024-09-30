import {createPrimitives, Primitives} from "./PrimitveAtoms";
import {createSelectors, Selectors} from "./Selectors";
import {createEffects, Effects} from "./Effects";
import {createSuspendedAtoms, SuspendedAtoms} from "./SuspendedAtoms";

export type Atoms = {
    primitives: Primitives;
    selectors: Selectors;
    suspended: SuspendedAtoms;
    effects: Effects;
};

export function createAtoms(): Atoms {
    const primitives = createPrimitives();
    const selectors = createSelectors(primitives);
    const suspended = createSuspendedAtoms(selectors);

    return {
        primitives: primitives,
        selectors: selectors,
        suspended: suspended,
        effects: createEffects(primitives, selectors, suspended),
    };
}