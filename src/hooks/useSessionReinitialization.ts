import {ConfigurationUninitialized} from "../types";
import {prepareAtomValueUsageWithSuspense} from "./AtomValueUsageHelper";
import {UseSessionReinitializationResult} from "../internal/jotai/domain/sessionReinitialization";

const useSessionReinitialization: {
    /**
     * Gets a command to reinitialize the session by creating a new session and attempts to migrate all existing decisions.
     * @remarks Will suspend until the configuration is fully initialized.
     */
    (): UseSessionReinitializationResult;
    /**
     * Gets a command to reinitialize the session by creating a new session and attempts to migrate all existing decisions.
     * @param suspend Whether to disable the Suspense API.
     */
    (suspend: false): UseSessionReinitializationResult | ConfigurationUninitialized;
} = prepareAtomValueUsageWithSuspense<UseSessionReinitializationResult>(s => s.sessionReinitializationAtom, s => s.sessionReinitializationAtom);

export default useSessionReinitialization;