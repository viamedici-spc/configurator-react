import {Context, createContext, useContext} from "react";
import {Atoms} from "./jotai/Atoms";
import {getDefaultStore} from "jotai";
import {createStore} from "jotai/vanilla/store";

type Contexts = {
    AtomsContext: Context<Atoms>;
}

const contexts: Contexts = (window as any).configuratorReactContexts ?? {
    AtomsContext: createContext(null as any),
} satisfies Contexts;
(window as any).configuratorReactContexts = contexts;
(window as any).configuratorStore ||= getDefaultStore();

export const AtomsContext = contexts.AtomsContext;

export const useAtomsContext = () => useContext(AtomsContext);

export const useDefaultConfiguratorStore = (): ReturnType<typeof createStore> => {
    return (window as any).configuratorStore;
};