import { Handler } from '../types';
import { BaseConfig } from '../types/config';
import { layer as toLayer } from './func';

/**
 * Create configs
 */
export namespace config {
    /**
     * Register guards
     */
    export const guard = <T extends string>(prefix: T, ...guards: Handler<T>[]): BaseConfig<T> => ({ prefix, guards });

    /**
     * Prefix only
     */
    export const prefix = (prefix: string) => ({ prefix });

    /**
     * Register layers
     */
    export const layer = <T extends string>(prefix: T, ...guards: Handler<T>[]): BaseConfig<T> => ({
        prefix, guards: guards.map(toLayer)
    });
}
