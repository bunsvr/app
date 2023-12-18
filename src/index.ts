import { FastWint } from 'wint-js/turbo';
import { Context } from './types';
import { Server, ServeOptions, WebSocketServeOptions } from 'bun';
import { resolve } from 'path';
import scanDir from './utils/scanDir';
import { routes, Routes } from './core/routes';
import { ws } from './core/ws';
import { ContextSet, ctx } from './send';

export interface AppOptions {
    router?: FastWint<any>;

    /**
     * Serve options
     */
    serve?: Partial<ServeOptions>;

    /**
     * Directories that contain routes files
     */
    routes: string[];

    /**
     * Fallback if routes are not found
     */
    fallback?: (c: Context) => any;

    /**
     * The config file name
     */
    config?: string;

    /**
     * Enable WebSocket
     */
    ws?: boolean;

    /**
     * Initialize context set. 
     * May slightly decrease performance.
     */
    contextSet?: boolean;
}

/**
 * The main function to import
 */
export interface MainFunction {
    (app: App): Routes<any> | Promise<Routes<any>>;
}

const
    // Preset all commonly used values
    optimize = (initSet: boolean) => {
        // @ts-ignore
        Request.prototype.path = null;
        // @ts-ignore
        Request.prototype._pathStart = null;
        // @ts-ignore
        Request.prototype._pathEnd = null;
        // Initialize
        if (initSet)
            // @ts-ignore
            Request.prototype.set = ContextSet.prototype;
    },
    isBun = !!globalThis.Bun;

export class App {
    /**
     * Record of routes
     */
    readonly routes: Routes<any> = routes();

    /**
     * The current running server
     */
    server: Server;

    /**
     * Initialize an app
     */
    constructor(readonly options: AppOptions) {
        optimize(options.contextSet);

        // Do direct call optimization
        this.options.router ??= new FastWint;
        if (this.options.fallback)
            this.options.router.fallback(this.options.fallback);

        // Set to default hostname and port
        this.options.serve ??= {};

        // Base config of each dir
        this.options.config ??= 'base.ts';

        // Set port in ENV if found
        if (!('port' in options.serve) && 'PORT' in Bun.env)
            this.options.serve.port = Number(process.env.PORT);

        // Set development
        if (!('development' in options.serve))
            this.options.serve.development = process.env.NODE_ENV !== 'production';
    }

    /**
     * Extend routes
     */
    put(routes: Routes<any>) {
        this.routes.extend(routes);
        return this;
    }

    /**
     * Start the server. Only works in Bun
     */
    boot() {
        if (isBun) {
            this.server = Bun.serve(
                this.options.serve as ServeOptions
            );

            // Register WebSocket handlers
            if (this.options.ws)
                for (var fn of this.wsList)
                    fn.bind(this.server);

            // Log server info
            console.info(
                `Server started at http://${this.server.hostname}:${this.server.port}`
                + ` in ${this.server.development ? 'development' : 'production'} mode.`
            );
        }

        return this;
    }

    /**
     * WebSocket handlers list
     */
    readonly wsList: ws.Route[] = [];
    ws(f: ws.Route) {
        this.wsList.push(f);
        return this;
    }

    /**
     * Load routes from options.
     */
    async loadRoutes() {
        // All routes directories
        const routesDirs = this.options.routes;

        switch (routesDirs.length) {
            case 0: break;
            case 1:
                await this.route(routesDirs[0]);
                break;

            // Set up parallel register
            default:
                // Promise list to load
                const promiseList = new Array(routesDirs.length);
                for (var i = 0; i < promiseList.length; ++i)
                    promiseList[i] = this.route(routesDirs[i]);

                await Promise.all(promiseList);
                break;
        }
    }

    /**
     * Register all routes from directories and returns the serve options
     */
    async build(serve?: boolean) {
        await this.loadRoutes();

        // If default context initialization is set
        if (this.options.contextSet)
            this.routes.wrap(ctx);

        // Set fetch function
        this.options.serve.fetch = this.routes.infer(
            // This infer step returns the reference to the router
            this.options.router
        ).build().query as any;

        // Set generic WebSocket handler
        if (this.options.ws)
            (this.options.serve as WebSocketServeOptions).websocket = ws.options;

        // Serve directly
        if (serve) this.boot();

        return this;
    }

    /**
     * Check whether server is a dev server
     */
    get dev() {
        return this.options.serve.development;
    }

    /**
     * Set development mode
     */
    set dev(value: boolean) {
        this.options.serve.development = value;
    }

    /**
     * Log all routes registered
     */
    logRoutes() {
        if (this.dev)
            for (var route of this.routes.record)
                console.info(`${route[0]} ${route[1]}`);
    }

    /**
     * Load routes from a directory
     */
    async route(dir: string) {
        await scanDir(resolve(dir), this);
        return this;
    }
}

/**
 * Shorthand for `new App().build(true)`.
 */
export const init = (options: AppOptions) => new App(options).build(true);

/**
 * Shorthand for `new App().build()`
 */
export const build = (options: AppOptions) => new App(options).build();

export * from './core/routes';
export * from './core/config';
export * from './core/ws';
export * from './core/func';

export default App;
