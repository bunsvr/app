import { join, relative } from 'path';
import { Routes, type App } from '..';
import { Glob } from 'bun';
import { BaseConfig } from '../types/config';
import { readdirSync, statSync, existsSync } from 'fs';

const importRoute = async (
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
}

const
    // More patterns might be added
    patterns = {
        routes: new Glob('*.routes.*'),
    },

    f = async (
        directory: string,
        app: App,
        prefix: string = '/'
    ) => {

        // Check config
        const config = join(directory, app.options.config);

        let guards = [];
        if (existsSync(config)) {
            let baseConfig = await import(config) as BaseConfig;

            // @ts-ignore
            if (baseConfig.default)
                // @ts-ignore
                baseConfig = baseConfig.default as BaseConfig;

            if (baseConfig) {
                // Add prefix
                if (baseConfig.prefix) {
                    prefix = join(prefix, baseConfig.prefix);

                    console.log(`- Current prefix: '${prefix}'`);
                }

                if (Array.isArray(baseConfig.guards))
                    guards = baseConfig.guards;
            }
        }

        // Check all routes
        for (var item of readdirSync(directory)) {
            var itemPath = join(directory, item),
                fileStat = statSync(itemPath);

            if (fileStat.isFile()) {
                // Register routes
                if (patterns.routes.match(item)) {
                    // Log routes file path
                    console.info(`+ Entry: ${relative(directory, itemPath)}'`);

                    var route = await importRoute(itemPath, app);

                    // Extend
                    app.routes.extend(
                        route.prependGuards(...guards).prefix(prefix)
                    );
                }
            }

            // Check directory
            else if (fileStat.isDirectory())
                await f(itemPath, app, prefix);
        }
    }

export default f;
