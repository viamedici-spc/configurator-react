import {ConfigurationUninitialized} from "../types";
import {UseConfigurationStoringResult} from "../internal/jotai/domain/configurationStoring";
import {prepareAtomValueUsageWithSuspense} from "./AtomValueUsageHelper";
import {UseTaskSchedulingResult} from "../internal/jotai/domain/taskScheduling";

const useTaskScheduling: {
    /**
     * Gets a command to schedule tasks.
     * @remarks Will suspend until the configuration is fully initialized.
     */
    (): UseTaskSchedulingResult;
    /**
     * Gets a command to schedule tasks.
     * @param suspend Whether to disable the Suspense API.
     */
    (suspend: false): UseTaskSchedulingResult | ConfigurationUninitialized;
} = prepareAtomValueUsageWithSuspense<UseTaskSchedulingResult>(s => s.taskSchedulingAtom, s => s.taskSchedulingAtom);

export default useTaskScheduling;