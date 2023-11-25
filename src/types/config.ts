import { Handler } from '.';

export interface BaseConfig<T extends string = any> {
    /**
     * Prefix
     */
    prefix?: T;

    /**
     * Guards
     */
    guards?: Handler<T>[];

    /**
     * Default export
     */
    default?: BaseConfig<T>;
}
