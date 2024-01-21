import type App from '.';
import { lowercaseMethods } from './utils/methods';

export interface RequestFunction {
    (path: string, init?: RequestInit): Promise<Response>;
}

export interface Client extends Record<typeof lowercaseMethods[number], RequestFunction> {
    fetch: RequestFunction;
}

const objToString = Object.prototype.toString;

const castBodyInit = (init: RequestInit) => {
    const { body } = init;

    if (typeof body === 'object' && body.toString === objToString)
        init.body = JSON.stringify(body);
}

/**
 * A test client for the current server
 */
export const client = (app: App, basePath: string = '/'): Client => {
    let base = app.server.url.href;
    if (base.endsWith('/'))
        base = base.slice(0, -1);

    base += basePath;
    if (base.endsWith('/'))
        base = base.slice(0, -1);


    const obj: Partial<Client> = {
        fetch: (path: string, init?: RequestInit) => {
            if (typeof init !== 'undefined')
                castBodyInit(init);

            return fetch(base + path, init);
        }
    };

    for (const lowerCaseMethod of lowercaseMethods) {
        const method = lowerCaseMethod.toUpperCase(), defaultObj = { method };

        obj[lowerCaseMethod] = (path: string, init?: RequestInit) => {
            if (typeof init === 'undefined')
                init = defaultObj;
            else
                init.method = method;

            castBodyInit(init);
            return fetch(base + path, init);
        }
    }

    return obj as Client;
}
