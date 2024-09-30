import {useAtomsContext} from "./contexts";
import {useAtom} from "jotai";

export default function EffectLoader() {
    const {effects} = useAtomsContext();
    const {addSessionListenersEffect, cleanupAtomFamiliesEffect, atomSubscriberEffect, atomSubscriptionCleanupEffect} = effects;
    useAtom(addSessionListenersEffect);
    useAtom(cleanupAtomFamiliesEffect);
    useAtom(atomSubscriberEffect);
    useAtom(atomSubscriptionCleanupEffect);

    return null;
}