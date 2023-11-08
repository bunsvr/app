import { Router } from 'wint-js/types/types';
import Wint from 'wint-js/turbo';
import { Context, Handler } from './types';
import { ServeOptions } from 'bun';
import { resolve } from 'path';
import scanDir from './utils/scanDir';
import { Routes } from './routes';

const routePathValidator = (p: string) => p.endsWith('.routes.ts');

export interface AppOptions {
    /**
     * The internal router to use
     */
    router?: Router<Handler>;

    /**
     * Serve options
     */
    serve?: Partial<ServeOptions>;

    /**
     * Directories that contain routes files
     */
    routes?: string[];
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
}

export default class App {
    /**
     * Record of routes
     */
    readonly routes: Routes<any> = new Routes;

    /**
     * Initialize an app
     */
    constructor(readonly options: AppOptions = {}) {
        optimize();

        // Defaults to turbo router
        options.router ??= new Wint;

        // Set to default hostname and port
        options.serve ??= {
            // Allow reuse port by default
            reusePort: true
        };

        // Set port in ENV if found
        if (!('port' in options.serve) && 'PORT' in process.env)
            options.serve.port = Number(process.env.PORT);

        // Serve routes in src by default
        options.routes ??= ['src'];
    }

    /**
     * Extend routes
     */
    put(routes: Routes<any>) {
        this.routes.extend(routes);
    }

    /**
     * Register all routes from directories
     */
    async build(serve: boolean = true) {
        // Build the routes
        for (var dir of this.options.routes)
            await this.route(dir);

        this.routes.infer(this.options.router);

        // Build the find function
        const find = this.options.router.build().find;

        // @ts-ignore Fetch function
        this.options.serve.fetch = (c: Context) => {
            // Parse path
            c._pathStart = c.url.indexOf('/', 12) + 1,
                c._pathEnd = c.url.indexOf('?', c._pathStart);

            c.path = c._pathEnd === -1
                ? c.url.substring(c._pathStart)
                : c.url.substring(c._pathStart, c._pathEnd);

            const res = find(c);
            return res === null ? null : res(c);
        };

        // Serve directly
        if (serve) Bun.serve(
            this.options.serve as ServeOptions
        );
    }

    /**
     * Add routes from a directory
     */
    async route(dir: string) {
        dir = resolve(dir);

        const res = scanDir(dir, routePathValidator);
        for (var absPath of res) {
            var fn = await import(absPath);

            console.log('Registering', absPath);

            // Run the main function
            if ('main' in fn) {
                // Evaluate the main function
                fn = fn.main(this);
                if (fn instanceof Promise) fn = await fn;

                this.routes.extend(fn);
            } else
                throw new Error(`Route file ${absPath} does not export a main function.`);
        }
    }
}

export * from './routes';
