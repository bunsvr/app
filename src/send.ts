import { json as jsonOpts, html as htmlOpts, status as statusCodes } from './utils/options';
import type { Context } from './types';
import type { RedirectStatus, Status } from './types/basic';
import { plugin } from '.';

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
export const head = (init: Bun.ResponseInit) =>
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
    const options: Bun.ResponseInit = {
        headers: { Location }, status
    };

    return () => new Response(null, options);
}

/**
 * Send status with a response
 */
export const status = (d: Readable, status: Status) => new Response(d, statusCodes[status]);

/**
 * Send the context response
 */
export const ctx = (ctx: Context) => new Response(ctx.body, ctx);

/**
 * Stringifier for each type
 */
export const stringifier = {
    // Simple one right? (toString is faster than using String constructor)
    number: ctx => ctx.body.toString(),
    string: ctx => ctx.body,
    boolean: ctx => ctx.body.toString(),
    // It makes sense
    undefined: () => null,
    // Map sucks please don't even think of sending it
    object: ctx => {
        const { body } = ctx;
        if (body === null) return null;

        // Plain object
        if (body.constructor.name === 'Object') {
            ctx.headers['Content-Type'] ??= 'application/json';
            return JSON.stringify(body);
        }

        return body;
    },
    // Idk whatever, who sends this shit to client
    function: ctx => ctx.body.toString()
} satisfies Record<string, (c: Context) => any>;

/**
 * Cast response to string 
 */
export const generic = (ctx: Context) => new Response(stringifier[typeof ctx.body](ctx), ctx);

/**
 * Plugin to automatically send response based on context data
 */
export const plug = plugin(routes => routes.wrap(generic).reject(generic));
