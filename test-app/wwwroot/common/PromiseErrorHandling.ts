export function handleDecisionResponse<T>(lazyPromise: () => Promise<T>, explain?: (error: any) => (() => void) | null): Promise<void> {
    return handleError(lazyPromise, null, explain, "Press Ok to Explain");
}

export function handleError<T>(lazyPromise: () => Promise<T>, onResult?: (result: T) => void, onError?: (error: any) => (() => void) | null, errorMessageAddition?: string): Promise<void> {
    return lazyPromise()
        .then(r => {
            if (onResult) {
                onResult(r);
            }
        })
        .catch(error => {
            console.error(error);

            const message = "An error occurred while executing the request:\n" + JSON.stringify(error, null, 4);
            const execute = onError && onError(error);
            if (execute != null) {
                const confirmed = confirm(message + errorMessageAddition ? `\n\n${errorMessageAddition}` : "");
                if (confirmed) {
                    execute();
                }
            } else {
                alert(message);
            }
        });
}