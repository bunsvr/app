import { join, relative } from 'path';
import { Routes, type App, ws } from '..';
import { Glob } from 'bun';
import { BaseConfig } from '../types/config';
import { readdirSync, existsSync } from 'fs';

const
    // Import a routes file
    importRoute = async (
        absPath: string,
        app: App
    ) => {
        // Log the entry file
        let fn = await import(absPath);

        // Run the main function
        if (!('main' in fn))
            throw new Error(`Route file ${absPath} does not export a main function.`);

        // Evaluate the main function
        fn = fn.main(app);
        if (fn instanceof Promise) fn = await fn;

        // If it is not route throw an error
        if (!(fn instanceof Routes))
            throw new Error(`Route file ${absPath} main function does not return a routes group.`);

        return fn as Routes<any>;
    },

    isFile = (path: string) =>
        Bun.file(path).exists(),

    // Import a config file 
    importConfig = async (path: string) => {
        if (existsSync(path)) {
            let t = await import(path);
            if (t.default) t = t.default;

            return t as BaseConfig;
        }

        return null;
    },

    registerWS = async (path: string, app: App) => {
        const o = await import(path);

        for (var key in o)
            if (ws.isRoute(o[key]))
                app.ws(o[key]);
    },

    routesPattern = new Glob('*.routes.*'),
    wsPattern = new Glob('*.ws.*'),

    scan = async (
        directory: string,
        app: App,
        prefix: string = '/'
    ) => {
        // Check config
        const config = await importConfig(
            join(directory, app.options.config)
        ), guards = [];

        if (config) {
            // Add prefix
            if (config.prefix) {
                prefix = join(prefix, config.prefix);

                console.log(`- Current prefix: '${prefix}'`);
            }

            // Push guards
            if (config.guards)
                guards.push(...config.guards);
        }

        // Check all routes
        for (var item of readdirSync(directory)) {
            var itemPath = join(directory, item);

            if (await isFile(itemPath)) {
                // Import routes
                if (routesPattern.match(item)) {
                    // Log routes file path
                    console.info(`+ Entry: ${relative(directory, itemPath)}'`);

                    // Extend
                    app.routes.extend(
                        // Get the route
                        (await importRoute(itemPath, app))
                            .prependGuards(...guards)
                            .prefix(prefix)
                    );
                }
                // Match WebSocket route
                else if (wsPattern.match(item))
                    await registerWS(itemPath, app);
            } else await scan(itemPath, app, prefix);
        }
    }

export default scan;
