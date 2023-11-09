import { Context } from "./types";

const noop = () => null;

// Create a JSON parser with a validator
export const json = <T>(vld: (d: any) => T | null) =>
    (c: Context): Promise<T | null> => c.json().then(vld).catch(noop);
