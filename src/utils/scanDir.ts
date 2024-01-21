import { join } from 'path';
import { readdirSync, existsSync } from 'fs';
import { Glob } from 'bun';

import { Routes } from '../core/routes';
import { ws } from '../core/ws';
import { layer as toLayer } from '../core/func';

import type { BaseConfig } from '../types/config';
import type { Handler } from '../types';
import type { App } from '..';

const
    notObj = (o: any): o is object => o === null || typeof o !== 'object',

    // Import a routes file
    importRoute = async (
        absPath: string,
        app: App
    ) => {
        // Check import
        let fn = await import(absPath);
        if (notObj(fn)) throw new Error(`Route file ${absPath} should export a main function or a routes record.`);

        // Try to get a route group object by running the main function
        if (typeof fn.main === 'function') fn = fn.main(app);
        // Try getting the export default
        else if (fn.default) fn = fn.default;

        // Unwrap promise
        if (fn instanceof Promise) fn = await fn;

        // If it is not route throw an error
        if (!(fn instanceof Routes))
            throw new Error(`Route file ${absPath} main function result or export default is not a routes record.`);

        return fn as Routes<any>;
    },

    isFile = (path: string) => Bun.file(path).exists(),

    // Import a config file 
    importConfig = async (path: string) => {
        if (existsSync(path)) {
            let t = await import(path);
            if (t.default) t = t.default;

            return t as BaseConfig;
        }

        return null;
    },

    // Register a WebSocket route file
    registerWS = async (absPath: string, app: App) => {
        // Import and check
        const o = await import(absPath);
        if (notObj(o)) throw new Error(`Route file ${absPath} should export a WebSocket route.`);

        // Try looping through every named export
        // and find every WebSocket routes available
        for (const key in o)
            if (ws.isRoute(o[key]))
                app.ws(o[key]);
    },

    // File patterns
    routesPattern = new Glob('*.routes.*'),
    wsPattern = new Glob('*.ws.*'),

    // Recursively scan a directory and register routes
    scan = async (
        directory: string,
        app: App,
        prefix: string = '/',
        // Previous stuff
        prevGuards: Handler[] = [],
        prevWraps: Handler[] = [],
        fallback: Handler = null,
    ) => {

        const
            autoprefix = app.options.autoprefix === true,
            // Import config file and returns the config object
            config = await importConfig(
                join(directory, app.options.config)
            ),
            // Route guards, wraps and fallback
            guards = [...prevGuards], wraps = [...prevWraps];

        // Check every option in config
        if (config) {
            if (typeof config.prefix === 'string') {
                if (autoprefix)
                    throw new Error(`Specify a prefix path (in ${directory} configuration file) is not allowed when autoprefix is enabled!`)

                prefix = join(prefix, config.prefix);
            }

            // Append: [Prev guards] -> [Current guards]
            if (Array.isArray(config.guards))
                guards.push(...config.guards);

            // Same as guards
            if (Array.isArray(config.layers))
                guards.push(...config.layers.map(toLayer));

            // Prepend: [Current wrappers] -> [Prev wrappers]
            if (Array.isArray(config.wraps))
                wraps.unshift(...config.wraps);

            // Register fallback
            if (typeof config.reject === 'function')
                fallback = config.reject;
        }

        // Check all routes
        for (const item of readdirSync(directory)) {
            const itemPath = join(directory, item);

            if (await isFile(itemPath)) {
                // Import routes
                if (routesPattern.match(item)) {
                    const route = await importRoute(itemPath, app);

                    // Set current prefix
                    route.prefix(prefix);

                    // Add previous guards and wraps
                    route
                        .prependGuards(...guards)
                        .wrap(...wraps);

                    // Add fallback if not exists
                    route.reject(fallback);

                    // Extend
                    app.routes.extend(route);
                }
                // Match WebSocket route
                else if (wsPattern.match(item))
                    await registerWS(itemPath, app);
            }

            // Scan the child directory
            else await scan(
                itemPath, app, autoprefix ? join(prefix, item) : prefix,
                guards, wraps, fallback
            );
        }
    }

export default scan;
