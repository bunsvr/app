import { wrapAsync } from '.';
import { Context } from './types';

const noop = () => null;

// Create a JSON parser with a validator
export const json = <T>(vld: (d: any) => T | null) => wrapAsync(
    (c: Context): Promise<T | null> => c.req.json().then(vld).catch(noop)
);

export const jsonv = <T>(vld: (d: any) => d is T) => json(t => vld(t) ? t : null);
