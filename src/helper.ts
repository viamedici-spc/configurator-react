import {ConfigurationUninitialized} from "./types";

/**
 * A type guard that checks if the given value is initialized.
 *
 * This type guard is useful for narrowing a union type containing {@link ConfigurationUninitialized}
 * to only include the initialized type `T`.
 *
 * @returns `true` if the value is of type `T`.
 */
export const isConfigurationInitialized = <T>(v: T | ConfigurationUninitialized): v is T => v !== ConfigurationUninitialized;