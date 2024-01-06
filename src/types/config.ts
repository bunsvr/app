import { Handler } from '.';

export interface BaseConfig<T extends string = any> {
    /**
     * Prefix
     */
    prefix?: T;

    /**
     * Guards for all routes in the directory
     */
    guards?: Handler<T>[];

    /**
     * Layers for all routes in the directory
     */
    layers?: Handler<T>[];

    /**
     * Wraps for all routes in the directory
     */
    wraps?: Handler<T>[];

    /**
     * A fallback handler for all routes in the directory (unless manually specified)
     */
    reject?: Handler<T>;

    /**
     * Default export
     */
    default?: BaseConfig<T>;
}
