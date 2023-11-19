import { join } from 'path/posix';
import type { Handler } from '../types';
import { ConcatPath } from '../utils/concatPath';
import { lowercaseMethods } from '../utils/methods';
import mergeHandlers from '../utils/mergeHandlers';
import { FastWint } from 'wint-js/turbo';
import normalizePath from '../utils/normalizePath';

export type Route = [method: string, path: string, handlers: Handler[]];

export interface RouteHandler<Root extends string> {
    <Path extends string>(path: Path, ...handlers: Handler<ConcatPath<Root, Path>>[]): Routes<Root>;
}

class Routes<Root extends string = any> {
    /**
     * Fallback when guard functions reject
     */
    fallback: Handler<Root> = null;

    /**
     * Routes record
     */
    readonly record: Route[] = [];

    /**
     * Route guards
     */
    readonly guards: Handler<Root>[] = [];

    /**
     * Create a route group
     */
    constructor(public base: Root = '/' as Root) {
        // Initialize route register methods
        for (var method of lowercaseMethods) {
            const METHOD = method.toUpperCase();

            this[method] = (path, ...handlers) => {
                this.record.push([METHOD, normalizePath(path), handlers]);
                return this;
            }
        }
    }

    /**
     * Add prefix
     */
    prefix<B extends string>(base: B): Routes<ConcatPath<B, Root>> {
        this.base = join(base, this.base) as any;

        return this as any;
    }

    /**
     * Add guards
     */
    guard(...fns: Handler<Root>[]) {
        this.guards.push(...fns);
        return this;
    }

    /**
     * Prepend guard. This function is considered to be internal API.
     */
    prependGuards(...fns: Handler<Root>[]) {
        if (fns.length > 0)
            this.guards.splice(0, 0, ...fns);
        return this;
    }

    /**
     * Handle guards reject
     */
    reject(fn: Handler<Root>) {
        this.fallback = fn;
        return this;
    }

    /**
     * Extend other routes 
     */
    extend(...routes: Routes<any>[]) {
        for (var route of routes)
            for (var rec of route.record)
                this.record.push([
                    rec[0],
                    // Push the concatenated path
                    normalizePath(
                        join(route.base, rec[1])
                    ),
                    // Load all guards into routes
                    [...route.guards, ...rec[2]]
                ]);

        return this;
    }

    /**
     * Infer all routes to the router
     */
    infer<T extends FastWint<any>>(router: T) {
        for (var rec of this.record)
            router.put(
                rec[0], normalizePath(
                    join(this.base, rec[1])
                ),
                mergeHandlers(rec[2], this.fallback)
            );

        return router;
    }
}

/**
 * Route groups
 */
export const routes = <Root extends string = any>(base: Root = '/' as Root) => new Routes(base);

interface Routes<Root extends string> extends Record<
    typeof lowercaseMethods[number], RouteHandler<Root>
> { };

export { Routes };
