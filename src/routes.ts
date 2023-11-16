import { join } from 'path/posix';
import type { Handler } from './types';
import { ConcatPath } from './utils/concatPath';
import { lowercaseMethods } from './utils/methods';
import mergeHandlers from './utils/mergeHandlers';
import { FastWint } from 'wint-js/turbo';
import normalizePath from './utils/normalizePath';

export type Route = [method: string, path: string, handler: Handler];

export interface RouteHandler<Root extends string> {
    <Path extends string>(path: Path, ...handlers: Handler<ConcatPath<Root, Path>>[]): Routes<Root>;
}

class Routes<Root extends string = '/'> {
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
                if (this.guards.length > 0)
                    handlers = [...this.guards, ...handlers] as any;

                this.record.push([
                    METHOD, path,
                    mergeHandlers(handlers, this.fallback)
                ]);
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
     * Handle guards reject
     */
    reject(fn: Handler<Root>) {
        this.fallback = fn;
        return this;
    }

    /**
     * Extend other routes 
     */
    extend(...routes: Routes[]) {
        for (var route of routes)
            for (var rec of route.record)
                this.record.push([
                    rec[0], normalizePath(
                        join(route.base, rec[1])
                    ), rec[2]
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
                ), rec[2]
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
