import { json as jsonOpts, html as htmlOpts } from './options';
import { ResponseOptions } from './types';
import { RedirectStatus } from './types/basic';

/**
 * Type for everything that can be passed into `Response` constructor
 */
export type Readable = ConstructorParameters<typeof Response>[0];

/**
 * Send text and blob.
 */
export const text = (d: Readable) => new Response(d);

const { stringify } = JSON;
/**
 * Send JSON response
 */
export const json = (d: object) =>
    new Response(stringify(d), jsonOpts);

/**
 * Send HTML response
 */
export const html = (d: Readable) =>
    new Response(d, htmlOpts);

const getFile = globalThis.Bun?.file;
/**
 * Send a path as response
 */
export const file = (path: string) =>
    new Response(getFile(path));

/**
 * Send response options only
 */
export const head = (init: ResponseOptions) =>
    new Response(null, init);

/**
 * Redirect to a specific location
 */
export const redirect = (Location: string, status: RedirectStatus) =>
    new Response(null, { headers: { Location }, status });

/**
 * Create a redirect function
 */
export const createLink = (Location: string, status: RedirectStatus) => {
    const options: ResponseOptions = {
        headers: { Location }, status
    };

    return () => new Response(null, options);
}
