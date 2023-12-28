import { wrapAsync } from '.';
import { Context } from './types';

const noop = () => null;

/**
 * Create a parser for a validator that yield the object back or null
 */
export const json = <T>(vld: (d: any) => T | null) => wrapAsync(
    (c: Context): Promise<T | null> => c.req.json().then(vld).catch(noop)
);

/**
 * Create a parser for a validator that returns a boolean to check whether
 * The JSON object has correct type or not
 */
export const jsonv = <T>(vld: (d: any) => d is T) => json(t => vld(t) ? t : null);
