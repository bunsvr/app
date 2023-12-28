import { join } from 'path/posix';
import type { Handler } from '../types';
import { ConcatPath } from '../utils/concatPath';
import { lowercaseMethods } from '../utils/methods';
import mergeHandlers from '../utils/mergeHandlers';
import { t } from 'wint-js';
import normalizePath from '../utils/normalizePath';

export type Route = [method: string, path: string, handlers: Handler[]];

export interface RouteHandler<Root extends string, State extends t.BaseState> {
    <Path extends string>(path: Path, ...handlers: Handler<ConcatPath<Root, Path>, State>[]): Routes<Root, State>;
}

type UnwrapPromise<T> = T extends Promise<infer R> ? R : T;

class Routes<Root extends string = any, State extends t.BaseState = {}> {
    /**
     * Fallback when guard functions reject
     */
    fallback: Handler<Root> = null;

    /**
     * Routes record
     */
    readonly record: Route[] = [];

    /**
     * Route guards - before handling
     */
    readonly guards: Handler<Root, State>[] = [];

    /**
     * Route wrappers - after handling
     */
    readonly wraps: Handler<Root, State>[] = [];

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
    prefix<B extends string>(base: B): Routes<ConcatPath<B, Root>, State> {
        this.base = join(base, this.base) as any;

        return this as any;
    }

    /**
     * Add guards
     */
    guard(...fns: Handler<Root, State>[]) {
        this.guards.push(...fns);
        return this;
    }

    /**
     * Add wraps
     */
    wrap(...fns: Handler<Root, State>[]) {
        this.wraps.push(...fns);
        return this;
    }

    /**
     * Add a state as a guard
     */
    state<F extends Handler<Root, State>>(fn: F): Routes<
        Root, NonNullable<UnwrapPromise<ReturnType<F>>> & State
    > {
        const isAsync = fn.constructor.name === 'AsyncFunction';

        return this.guard(
            Function(
                'f', `return ${isAsync ? 'async ' : ''}c=>{const r=${isAsync ? 'await ' : ''}f(c);if(r===null)return null;c.state=r}`
            )(fn)
        );
    }

    /**
     * Prepend guard. This function is considered internal API.
     */
    prependGuards(...fns: Handler<Root, State>[]) {
        this.guards.unshift(...fns);
        return this;
    }

    /**
     * Handle guards reject
     */
    reject(fn: Handler<Root, State>) {
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
                    rec[0],
                    // Push the concatenated path
                    normalizePath(
                        join(route.base, rec[1])
                    ),
                    // Load all guards into routes
                    [...route.guards, ...rec[2], ...route.wraps]
                ]);

        return this;
    }

    /**
     * Infer all routes to the router
     */
    infer<T extends t.FastWint>(router: T) {
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

interface Routes<Root extends string, State extends t.BaseState> extends Record<
    typeof lowercaseMethods[number], RouteHandler<Root, State>
> { };

export { Routes };
