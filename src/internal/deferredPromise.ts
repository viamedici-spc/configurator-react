export type DeferredPromise<T> = {
    promise: Promise<T>,
    resolve: (value: T) => void,
    reject: () => void
}

export type DeferredEncapsulatedPromise<T> = {
    capsule: { promise: Promise<T> },
    resolve: (value: T) => void,
    reject: () => void
}

export const newDeferredPromise = <T>(): DeferredPromise<T> => {
    let resolvePromise: (value: T) => void;
    let rejectPromise: () => void;
    const promise = new Promise<T>((resolve, reject) => {
        resolvePromise = resolve;
        rejectPromise = reject;
    });

    return {
        promise: promise,
        resolve: resolvePromise,
        reject: rejectPromise
    };
};

export const newDeferredEncapsulatedPromise = <T>(): DeferredEncapsulatedPromise<T> => {
    const deferredPromise = newDeferredPromise<T>();

    return {
        capsule: {promise: deferredPromise.promise},
        resolve: deferredPromise.resolve,
        reject: deferredPromise.reject
    };
};