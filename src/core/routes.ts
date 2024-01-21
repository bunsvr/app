import { join } from 'path/posix';
import type { Handler } from '../types';
import { ConcatPath } from '../utils/concatPath';
import { lowercaseMethods } from '../utils/methods';
import mergeHandlers from '../utils/mergeHandlers';
import { t } from 'wint-js';
import normalizePath from '../utils/normalizePath';
import { layer } from './func';

type Merge<A, B> = B extends object ? (
    A extends object ? A & B : B
) : B;

type MergeRoutes<A extends Routes, B extends Routes> =
    Routes<A['base'], Merge<StateOf<A>, StateOf<B>>>

export type StateOf<T extends Routes> = T extends Routes<any, infer State> ? State : never;

export type Route = [method: string, path: string, handlers: Handler[]];

export interface RouteHandler<Root extends string, State extends t.BaseState> {
    <Path extends string>(path: Path, ...handlers: Handler<ConcatPath<Root, Path>, State>[]): Routes<Root, State>;
}

export interface Routes<Root extends string, State extends t.BaseState> extends Record<
    typeof lowercaseMethods[number], RouteHandler<Root, State>
> { };

/**
 * A routes plugin
 */
export interface Plugin<B extends Routes = Routes, R extends B = B> {
    plugin<T extends B>(routes: T): R;
}

const isVariable = /^[a-zA-Z_$][0-9a-zA-Z_$]*$/, args = (f: Function) => f.length === 0 ? '' : 'c';

export class Routes<Root extends string = any, State extends t.BaseState = {}> implements Plugin {
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
     * Non-typesafe plugins
     */
    plug<T extends Plugin<this>[]>(...plugins: T) {
        for (const f of plugins)
            f.plugin(this);

        return this;
    }

    /**
     * Register a plugin
     */
    use<T extends Plugin<this>>(f: T): MergeRoutes<this, ReturnType<T['plugin']>> {
        return f.plugin(this as any) as any;
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
    state<F extends Handler<Root, State>>(fn: F, reject?: Handler<Root, State>): Routes<
        Root, NonNullable<Awaited<ReturnType<F>>>
    >

    /**
     * Add multiple fields to the state
     */
    state<O extends Record<string, Handler<Root, State>>>(rec: O, reject?: Handler<Root, State>): Routes<
        Root, {
            [key in keyof O]: NonNullable<Awaited<ReturnType<O[key]>>>
        } & State
    >

    state(a: any, reject: any): any {
        const handler: Handler<Root, State> = typeof a === 'object'
            ? this.registerMultipleState(a)
            : this.registerSingleState(a);

        // Set reject for only this state
        if (typeof reject !== 'undefined')
            handler.fallback = reject;

        return this.guard(handler);
    }

    private hasMultipleState = false;

    private registerMultipleState(rec: Record<string, Handler>) {
        let isAsync = false, layerStates = {},
            parts = [], keys = [], values = [];

        for (const key in rec) {
            if (!isVariable.test(key))
                throw new Error(`Key \`${key}\` must be in variable format!`);

            // Put the corresponding KV into the args list
            const fnName = `f_${key}`;
            keys.push(fnName);
            values.push(rec[key]);

            let fnCall = `${fnName}(${args(rec[key])})`;

            // Async function check
            if (rec[key].constructor.name === 'AsyncFunction') {
                isAsync = true;
                fnCall += 'await ';
            }

            // Save to layer states (no checking)
            if (rec[key].noValidation)
                layerStates[key] = fnCall;
            // Push the function call and condition checking
            else
                parts.push(`const ${key}=`, fnCall, `if(${key}===null)return null;`);
        }

        // Set the final state
        if (this.hasMultipleState) {
            for (const key in rec)
                parts.push(`c.state.${key}=${key}`, ';');

            // States that requires no checking
            for (const key in layerStates)
                parts.push(`c.state.${key}=${layerStates[key]}`, ';');

            parts.pop();
        } else {
            this.hasMultipleState = true;

            const states = Object.keys(rec);
            for (const key in layerStates)
                states.push(`${key}:${layerStates[key]}`);

            parts.push(`c.state={${states.join()}}`);
        }

        return Function(...keys, `return ${isAsync ? 'async ' : ''}c=>{${parts.join('')}}`)(...values);
    }

    private registerSingleState(fn: any) {
        this.hasMultipleState = false;
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
     * Register a reject handler for current handlers
     */
    reject(fn: Handler<Root, State>) {
        if (typeof fn !== 'function') return;

        // Prevent overriding
        for (const guard of this.guards)
            guard.fallback ??= fn;

        for (const wrap of this.wraps)
            wrap.fallback ??= fn;

        for (const f of this.record)
            for (const item of f[2])
                item.fallback ??= fn;

        return this;
    }

    /**
     * Extend other routes 
     */
    extend(...routes: Routes[]) {
        for (const route of routes)
            for (const rec of route.record)
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
     * Routes can be used as a plugin
     */
    plugin<T extends Routes>(routes: T) {
        routes.extend(this);
        return routes;
    }

    /**
     * Infer all routes to the router
     */
    infer<T extends t.FastWint>(router: T) {
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

/**
 * Create reusable states
 */
export const state = <T extends Handler | Record<string, Handler>>(s: T) => s;

/**
 * Create a plugin from a function
 */
export const plugin = <R extends Routes>(plugin: (routes: Routes) => R): Plugin<Routes, R> => ({ plugin });
