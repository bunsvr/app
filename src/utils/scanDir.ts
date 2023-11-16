import { exists, readdir, stat } from 'fs/promises';
import { join, relative } from 'path';
import { Routes } from '..';
import { BaseConfig } from '../types/config';

const isRoute = (path: string) => {
    const lastDot = path.lastIndexOf('.');
    if (lastDot === -1) return false;

    const route = path.indexOf('.routes.');
    if (route === -1) return false;

    return route + 7 === lastDot;
}

const register = async (
    routes: Routes,
    dir: string,
    absPath: string,
    prefix: string
) => {
    // Log the entry file
    console.info('+ Entry:', `'${relative(dir, absPath)}'`);

    let fn = await import(absPath);

    // Run the main function
    if (!('main' in fn))
        throw new Error(
            `Route file ${absPath} does not `
            + `export a main function.`
        );

    // Evaluate the main function
    fn = fn.main(this);
    if (fn instanceof Promise) fn = await fn;

    // If it is not route throw an error
    if (!(fn instanceof Routes))
        throw new Error(
            `Route file ${absPath} main function`
            + `does not return a routes group.`
        );

    fn.prefix(prefix);
    routes.extend(fn);
}

const f = async (
    directory: string,
    app: import('..').default,
    prefix: string = '/'
) => {
    // Check config
    const config = join(directory, app.options.config);
    if (await exists(config)) {
        let baseConfig = await import(config) as BaseConfig;

        // @ts-ignore
        if (baseConfig.default)
            // @ts-ignore
            baseConfig = baseConfig.default as BaseConfig;

        if (baseConfig) {
            // Add prefix
            if (baseConfig.prefix) {
                prefix = join(prefix, baseConfig.prefix)

                console.log(`- Current prefix: '${prefix}'`);
            }
        }
    }

    // Check all routes
    for (var item of await readdir(directory)) {
        var itemPath = join(directory, item),
            fileStat = await stat(itemPath);

        // Check base
        if (fileStat.isFile()) {
            // Register routes
            if (isRoute(itemPath))
                await register(
                    app.routes, directory,
                    itemPath, prefix
                );
        }
        // Check directory
        else if (fileStat.isDirectory())
            await f(itemPath, app, prefix);
    }
}

export default f;
