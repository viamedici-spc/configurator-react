import {PropsWithChildren} from "react";
import {useConfigurationInitialization} from "./configurationLifecycle";

/**
 * The ConfigurationSuspender avoids to manually handle the initialization state.
 * Combined with the React Suspense component, it stops the component subtree from rendering while the configuration is initializing.
 * So unsafe hooks like "useAttributes" can safely be used.
 * See the hook documentation whether a hook is safe to use while initialization.
 */
export default function ConfigurationSuspender(props: PropsWithChildren<{}>) {
    const {children} = props;
    const {isInitializingPromise} = useConfigurationInitialization();

    if (isInitializingPromise?.promise) {
        throw isInitializingPromise.promise;
    }

    return (
        <>
            {children}
        </>
    );
}