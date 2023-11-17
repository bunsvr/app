import { Handler } from './types';
import { BaseConfig } from './types/config';

/**
 * Create configs
 */
export namespace config {
    /**
     * Type-safe config without importing types
     */
    export const guard = <T extends string>(prefix: T, ...guards: Handler<T>[]): BaseConfig<T> => ({ prefix, guards });

    /**
     * Prefix only
     */
    export const prefix = (prefix: string) => ({ prefix });
}
