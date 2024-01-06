import { Handler } from '..';
import { BaseConfig } from '../types/config';

const empty = {};

/**
 * Create configs
 */
export namespace config {
    /**
     * Set a base follows by other configurations
     */
    export const base = <T extends string>(prefix: T, config: BaseConfig<T> = empty) => ({ ...config, prefix });

    /**
     * A type-safe wrapper for handler functions
     */
    export const fn = (...h: Handler[]) => h;
}
