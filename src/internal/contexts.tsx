import type {Context} from "react";
import {createContext, useContext} from "react";
import type {Atoms} from "./jotai/Atoms";
import type {createStore} from "jotai";
import {getDefaultStore} from "jotai";

type Contexts = {
    AtomsContext: Context<Atoms>;
    StoreContext: Context<ReturnType<typeof createStore>>;
};

const contexts: Contexts =
    (globalThis as any).configuratorReactContexts ??
    ({
        AtomsContext: createContext(null as any),
        StoreContext: createContext(getDefaultStore()),
    } satisfies Contexts);
(globalThis as any).configuratorReactContexts = contexts;

export const AtomsContext = contexts.AtomsContext;
export const StoreContext = contexts.StoreContext as Context<ReturnType<typeof createStore>>;

export const useAtomsContext = () => useContext(AtomsContext);

export const useConfiguratorStore = (): ReturnType<typeof createStore> => useContext(StoreContext);