import { Router } from 'wint-js/types/types';
import Wint from 'wint-js/turbo';
import { Context, Handler } from './types';
import { Server, ServeOptions } from 'bun';
import { relative, resolve } from 'path';
import scanDir from './utils/scanDir';
import { routes, type Routes } from './routes';

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
    routes: string[];
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
}

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

        // Defaults to turbo router
        options.router ??= new Wint;

        // Set to default hostname and port
        options.serve ??= {
            // Allow reuse port by default
            reusePort: true
        };

        // Set port in ENV if found
        if (!('port' in options.serve) && 'PORT' in Bun.env)
            options.serve.port = Number(process.env.PORT);
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
        this.server = Bun.serve(
            this.options.serve as ServeOptions
        );
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

        // Fetch function
        this.options.serve.fetch = ((c: Context) => {
            // This part can be optimized more
            c._pathStart = c.url.indexOf('/', 12) + 1;
            c._pathEnd = c.url.indexOf('?', c._pathStart);

            const res = find(c);
            return res === null ? null : res(c);
        }) as any;

        // Serve directly
        if (serve) this.boot();

        return this;
    }

    /**
     * Add routes from a directory
     */
    async route(dir: string) {
        dir = resolve(dir);

        // Log the searching directory
        console.log('Searching', `'${relative(process.cwd(), dir)}':`);

        const res = scanDir(dir, routePathValidator);

        for (var absPath of res) {
            // Log the entry file
            console.log('+ Entry:', `'${relative(dir, absPath)}'`);

            var fn = await import(absPath);

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
