import { wrapAsync } from '.';
import { Context } from './types';

const noop = () => null;

/**
 * Create a JSON parser for a validator that yield the object back or null
 */
export const json = <T>(vld: (d: any) => T | null) => wrapAsync(
    (c: Context): Promise<T | null> => c.req.json().then(vld).catch(noop)
);

/**
 * Create a JSON parser for a validator that returns a boolean to check whether
 * The JSON object has correct type or not
 */
export const jsonv = <T>(vld: (d: any) => d is T) => json(t => vld(t) ? t : null);

/**
 * Create a form parser
 */
export const form = wrapAsync(
    (c: Context): Promise<FormData | null> => c.req.formData().catch(noop)
);

/**
 * Create a blob parser
 */
export const blob = wrapAsync(
    (c: Context): Promise<Blob | null> => c.req.blob().catch(noop)
);

/**
 * Create a blob parser
 */
export const text = wrapAsync(
    (c: Context): Promise<string | null> => c.req.text().catch(noop)
);

/**
 * Create a blob parser
 */
export const buffer = wrapAsync(
    (c: Context): Promise<ArrayBuffer | null> => c.req.arrayBuffer().catch(noop)
);
