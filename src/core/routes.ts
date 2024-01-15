import { join } from 'path/posix';
import type { Handler } from '../types';
import { ConcatPath } from '../utils/concatPath';
import { lowercaseMethods } from '../utils/methods';
import mergeHandlers from '../utils/mergeHandlers';
import { t } from 'wint-js';
import normalizePath from '../utils/normalizePath';
import { layer } from './func';

export type Route = [method: string, path: string, handlers: Handler[]];

type UnwrapPromise<T> = T extends Promise<infer R> ? R : T;

export interface RouteHandler<Root extends string, State extends t.BaseState> {
    <Path extends string>(path: Path, ...handlers: Handler<ConcatPath<Root, Path>, State>[]): Routes<Root, State>;
}

interface Routes<Root extends string, State extends t.BaseState> extends Record<
    typeof lowercaseMethods[number], RouteHandler<Root, State>
> { };

/**
 * A routes plugin
 */
export interface Plugin<T extends Routes = Routes, R extends Routes = Routes> {
    (routes: T): R;
}

type LastOf<T extends any[]> = T extends [...any[], infer R] ? R : never;

const isVariable = /^[a-zA-Z_$][0-9a-zA-Z_$]*$/, args = (f: Function) => f.length === 0 ? '' : 'c';

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
        for (const method of lowercaseMethods) {
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
     * Add layers (Guards with no validation)
     */
    layer(...fns: Handler<Root, State>[]) {
        return this.guard(...fns.map(layer));
    }

    /**
     * Plug a plugin
     */
    plug<T extends [...Plugin[], Plugin]>(...f: T): ReturnType<LastOf<T>> {
        let current = this;

        for (let i = 0, len = f.length; i < len; ++i)
            current = f[i](current) as any;

        return current as any;
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
        Root, NonNullable<UnwrapPromise<ReturnType<F>>>
    >

    /**
     * Add multiple fields to the state
     */
    state<O extends Record<string, Handler<Root, State>>>(rec: O): Routes<
        Root, {
            [key in keyof O]: NonNullable<UnwrapPromise<ReturnType<O[key]>>>
        }
    >

    state(a: any): any {
        return this.guard(typeof a === 'object' ? this.registerMultipleState(a) : this.registerSingleState(a));
    }

    private registerMultipleState(rec: Record<string, any>) {
        let isAsync = false,
            parts = [], keys = [], values = [];

        for (var key in rec) {
            if (!isVariable.test(key))
                throw new Error(`Key \`${key}\` must be in variable format!`);

            // Put the corresponding KV into the args list
            var fnName = `f_${key}`;
            keys.push(fnName);
            values.push(rec[key]);

            parts.push(`const ${key}=`);

            // Async function check
            if (rec[key].constructor.name === 'AsyncFunction') {
                isAsync = true;
                parts.push('await');
            }

            // Push the function call and condition checking
            parts.push(
                fnName, `(${args(rec[key])});`,
                `if(${key}===null)return null;`
            );
        }

        // Set the final state
        parts.push(`c.state={${Object.keys(rec)}}`);

        return Function(...keys, `return ${isAsync ? 'async ' : ''}c=>{${parts.join('')}}`)(...values);
    }

    private registerSingleState(fn: any) {
        const isAsync = fn.constructor.name === 'AsyncFunction';

        return Function(
            'f', `return ${isAsync ? 'async ' : ''}c=>{const r=${isAsync ? 'await ' : ''}f(${args(fn)});if(r===null)return null;c.state=r}`
        )(fn);
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
     * Add this reject only if there is no fallback yet
     */
    optionalReject(fn: Handler<Root, State>) {
        if (typeof this.fallback !== 'function')
            this.fallback = fn;
        return this;
    }

    private loadFallback() {
        if (typeof this.fallback !== 'function') return;

        // Prevent overriding
        for (const guard of this.guards)
            guard.fallback ??= this.fallback;

        for (const wrap of this.wraps)
            wrap.fallback ??= this.fallback;

        for (const f of this.record)
            for (var item of f[2])
                item.fallback ??= this.fallback;
    }

    /**
     * Extend other routes 
     */
    extend(...routes: Routes[]) {
        for (const route of routes) {
            route.loadFallback();

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
        }

        return this;
    }

    /**
     * Infer all routes to the router
     */
    infer<T extends t.FastWint>(router: T) {
        this.loadFallback();

        for (const rec of this.record)
            router.put(
                rec[0], normalizePath(
                    join(this.base, rec[1])
                ),
                mergeHandlers([...this.guards, ...rec[2], ...this.wraps])
            );

        return router;
    }
}

/**
 * Route groups
 */
export const routes = <Root extends string = any>(base: Root = '/' as Root) => new Routes(base);

export { Routes };
