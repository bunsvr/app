import { FastWint } from 'wint-js/turbo';
import { Context } from './types';
import { Server, ServeOptions } from 'bun';
import { relative, resolve } from 'path';
import scanDir from './utils/scanDir';
import { routes, type Routes } from './routes';

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
}

/**
 * The main function to import
 */
export interface MainFunction {
    (app: App): Routes<any> | Promise<Routes<any>>;
}

const optimize = () => {
    // @ts-ignore
    Request.prototype.path = '';
    // @ts-ignore
    Request.prototype._pathStart = 0;
    // @ts-ignore
    Request.prototype._pathEnd = 0;
    // @ts-ignore
    Request.prototype.params = null;
    // @ts-ignore
    Request.prototype.set = null;
}, isBun = !!globalThis.Bun;

export default class App {
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
        optimize();

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
    }

    /**
     * Start the server
     */
    boot() {
        if (isBun) {
            this.server = Bun.serve(
                this.options.serve as ServeOptions
            );

            // Log server info
            console.info(
                `Server started at http://${this.server.hostname}:${this.server.port}`
                + ` in ${this.server.development ? 'development' : 'production'} mode.`
            );
        }

        return this;
    }

    /**
     * Register all routes from directories and returns the serve options
     */
    async build(serve?: boolean) {
        // Build the routes
        for (var dir of this.options.routes)
            await this.route(dir);

        this.options.serve.fetch = this.routes.infer(
            // This infer step returns the reference to the router
            this.options.router
        ).build().query as any;

        // Serve directly
        if (serve) this.boot();

        return this.options.serve;
    }

    /**
     * Add routes from a directory
     */
    async route(dir: string) {
        dir = resolve(dir);

        // Log the searching directory
        console.info(
            'Searching',
            `'${relative(process.cwd(), dir)}':`
        );
        await scanDir(dir, this);
    }
}

/**
 * Shorthand for `new App().build()`.
 */
export const init = (options: AppOptions) => new App(options).build(true);

export * from './routes';
export * from './config';
