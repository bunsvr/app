import { Context } from "./types";

/**
 * Send text and blob.
 */
export const text = (d: any) => new Response(d);

const jsonOpts = {
    headers: {
        'Content-Type': 'application/json'
    }
}, { stringify } = JSON;

/**
 * Send JSON response
 */
export const json = (d: any) =>
    new Response(stringify(d), jsonOpts);

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
 * Send the body of the context set
 */
export const ctext = (d: any, c: Context<any>) =>
    new Response(d, c.set);

/**
 * Send the body of the context set as JSON.
 *
 * The context must set `Content-Type` explicitly
 */
export const cjson = (d: any, c: Context<any>) =>
    new Response(stringify(d), c.set);

/**
 * Send response options in the context set
 */
export const chead = (c: Context<any>) =>
    new Response(null, c.set);

/**
 * Redirect to a specific location
 */
export const to = (Location: string, status: 301 | 302 | 307 | 308) =>
    new Response(null, {
        headers: { Location },
        status
    });
