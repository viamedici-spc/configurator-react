import {Context, createContext, useContext} from "react";
import {Atoms} from "./jotai/Atoms";

type Contexts = {
    AtomsContext: Context<Atoms>;
}

const contexts: Contexts = (window as any).configuratorReactContexts ?? {
    AtomsContext: createContext(null as any),
} satisfies Contexts;
(window as any).configuratorReactContexts = contexts;

export const AtomsContext = contexts.AtomsContext;

export const useAtomsContext = () => useContext(AtomsContext);