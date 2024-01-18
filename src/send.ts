import { json as jsonOpts, html as htmlOpts, status as statusCodes } from './utils/options';
import type { Context } from './types';
import type { RedirectStatus, Status } from './types/basic';
import { Plugin } from '.';

/**
 * Type for everything that can be passed into `Response` constructor
 */
export type Readable = ConstructorParameters<typeof Response>[0];

/**
 * Send a response
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
export const head = (init: ResponseInit) =>
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
    const options: ResponseInit = {
        headers: { Location }, status
    };

    return () => new Response(null, options);
}

/**
 * Send only status
 */
export const status = (status: Status) =>
    new Response(null, statusCodes[status]);

/**
 * Send status with a response
 */
export const stat = (d: Readable, status: Status) => new Response(d, statusCodes[status]);

/**
 * Send the context response
 */
export const ctx = (c: Context) => new Response(c.body, c);

/**
 * Plugin to automatically send response based on context data
 */
export const plug = {
    plugin: routes => routes.wrap(ctx).reject(ctx)
} satisfies Plugin;
