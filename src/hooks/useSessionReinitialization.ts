import {ConfigurationUninitialized} from "../types";
import {prepareAtomValueUsageWithSuspense} from "./AtomValueUsageHelper";
import {UseSessionReinitializationResult} from "../internal/jotai/domain/sessionReinitialization";

const useSessionReinitialization: {
    /**
     * Gets a command to reinitialize the session.
     * @remarks Will suspend until the configuration is fully initialized.
     */
    (): UseSessionReinitializationResult;
    /**
     * Gets a command to reinitialize the session.
     * @param suspend Whether to disable the Suspense api.
     */
    (suspend: false): UseSessionReinitializationResult | ConfigurationUninitialized;
} = prepareAtomValueUsageWithSuspense<UseSessionReinitializationResult>(s => s.sessionReinitializationAtom, s => s.sessionReinitializationAtom);

export default useSessionReinitialization;