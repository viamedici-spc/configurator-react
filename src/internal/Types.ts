import {ConfiguratorErrorWithRetry} from "../types";

export type PromiseOrValue<Value> = Promise<Value> | Value;

export type SessionInitialization = {
    isInitializing: boolean,
    error?: ConfiguratorErrorWithRetry
};

export type SessionUpdating = {
    isUpdating: boolean,
    error?: ConfiguratorErrorWithRetry
};

export interface Subscription {
    unsubscribe(): void;
}