import { join } from 'path';
import { Routes, type App, ws } from '..';
import { Glob } from 'bun';
import { BaseConfig } from '../types/config';
import { readdirSync, existsSync } from 'fs';
import { Handler } from '../types';

const
    // Import a routes file
    importRoute = async (
        absPath: string,
        app: App
    ) => {
        // Log the entry file
        let fn = await import(absPath);

        if ('main' in fn) fn = fn.main(app);
        else if ('default' in fn) fn = fn.default;
        else throw new Error(`Route file ${absPath} does not have a default export or export a main function.`);

        if (fn instanceof Promise) fn = await fn;

        // If it is not route throw an error
        if (!(fn instanceof Routes))
            throw new Error(`Route file ${absPath} main function result or export default is not a routes group.`);

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
        prefix: string = '/',
        prevGuards: Handler[] = []
    ) => {
        // Check config
        const config = await importConfig(
            join(directory, app.options.config)
        );

        // Route guards
        const guards = [];
        guards.push(...prevGuards);

        if (config) {
            if (config.prefix)
                prefix = join(prefix, config.prefix);

            if (config.guards)
                guards.push(...config.guards);
        }

        // Check all routes
        for (var item of readdirSync(directory)) {
            var itemPath = join(directory, item);

            if (await isFile(itemPath)) {
                // Import routes
                if (routesPattern.match(item)) {
                    var route = await importRoute(itemPath, app);
                    route.prependGuards(...guards).prefix(prefix);

                    // Extend
                    app.routes.extend(route);
                }
                // Match WebSocket route
                else if (app.options.ws)
                    if (wsPattern.match(item))
                        await registerWS(itemPath, app);
            }
            // Recursively scan dir
            else await scan(itemPath, app, prefix, guards);
        }
    }

export default scan;
