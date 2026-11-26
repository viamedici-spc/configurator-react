import type {Primitives} from "./PrimitveAtoms";
import {createPrimitives} from "./PrimitveAtoms";
import type {Selectors} from "./Selectors";
import {createSelectors} from "./Selectors";
import type {Effects} from "./Effects";
import {createEffects} from "./Effects";
import type {SuspendedAtoms} from "./SuspendedAtoms";
import {createSuspendedAtoms} from "./SuspendedAtoms";

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