import { wrapAsync } from '.';
import { Context, Handler } from './types';

const noop = () => null;

/**
 * Create a JSON parser for a validator that yield the object back or null
 */
export const json = <T>(vld: (d: any) => T | null, reject?: Handler) => {
    const err = typeof reject === 'undefined' ? noop : reject;

    return wrapAsync(
        (c: Context): Promise<T> => c.req.json().then(vld).catch(err)
    );
}

/**
 * Create a JSON parser for a validator that returns a boolean to check whether
 * The JSON object has correct type or not
 */
export const jsonv = <T>(vld: (d: any) => d is T, reject?: Handler) => json(t => vld(t) ? t : null, reject);

/**
 * Create a form parser
 */
export const form = (reject?: Handler) => {
    const err = typeof reject === 'undefined' ? noop : reject;

    return wrapAsync(
        (c: Context): Promise<FormData> => c.req.formData().catch(err)
    );
}

/**
 * Create a blob parser
 */
export const blob = (reject?: Handler) => {
    const err = typeof reject === 'undefined' ? noop : reject;

    return wrapAsync(
        (c: Context): Promise<Blob> => c.req.blob().catch(err)
    );
}

/**
 * Create a text parser
 */
export const text = (reject?: Handler) => {
    const err = typeof reject === 'undefined' ? noop : reject;

    return wrapAsync(
        (c: Context): Promise<string> => c.req.text().catch(err)
    );
}

/**
 * Create an array buffer parser
 */
export const buffer = (reject?: Handler) => {
    const err = typeof reject === 'undefined' ? noop : reject;

    return wrapAsync(
        (c: Context): Promise<ArrayBuffer> => c.req.arrayBuffer().catch(err)
    );
}

