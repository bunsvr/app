import { layer, wrapAsync } from '.';
import { Context } from './types';

/**
 * Create a JSON parser for a validator that yield the object back or null
 */
export const json = <T>(vld: (d: any) => T | null) => wrapAsync(
    (c: Context): Promise<T> => c.req.json().then(vld)
);

/**
 * Create a JSON parser for a validator that returns a boolean to check whether
 * The JSON object has correct type or not
 */
export const jsonv = <T>(vld: (d: any) => d is T) => json(t => vld(t) ? t : null);

/**
 * Create a form parser
 */
export const form = layer(
    wrapAsync((c: Context): Promise<FormData> => c.req.formData())
);

/**
 * Create a blob parser
 */
export const blob = layer(
    wrapAsync((c: Context): Promise<Blob> => c.req.blob() as Promise<Blob>)
);

/**
 * Create a text parser
 */
export const text = layer(
    wrapAsync((c: Context): Promise<string> => c.req.text())
);

/**
 * Create an array buffer parser
 */
export const buffer = layer(
    wrapAsync((c: Context): Promise<ArrayBuffer> => c.req.arrayBuffer())
);
