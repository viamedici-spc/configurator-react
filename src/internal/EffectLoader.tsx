import {useAtomsContext} from "./contexts";
import {useAtom} from "jotai";

export default function EffectLoader() {
    const {effects} = useAtomsContext();
    const {addSessionListenersEffect, cleanupAtomFamiliesEffect, atomSubscriberAtom, atomSubscriptionCleanupEffect} =
        effects;
    useAtom(addSessionListenersEffect);
    useAtom(cleanupAtomFamiliesEffect);
    useAtom(atomSubscriberAtom);
    useAtom(atomSubscriptionCleanupEffect);

    return null;
}