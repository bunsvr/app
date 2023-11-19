import type { Server, WebSocketHandler } from 'bun';
import type { Context, ContextHeaders } from '../types';

const noop = () => null;

export namespace ws {
    export interface Data<D = any> {
        f: WebSocketHandler<Data<D>>,
        body: D
    };

    // WebSocket routing
    export const options: WebSocketHandler<Data> = {
        message: (ws, message) => {
            ws.data.f.message(ws, message);
        },

        // All optional handlers must be set to noop
        open: ws => {
            ws.data.f.open(ws);
        },

        close: (ws, ...args) => {
            ws.data.f.close(ws, ...args);
        },

        drain: ws => {
            ws.data.f.drain(ws);
        },

        ping: (ws, buf) => {
            ws.data.f.ping(ws, buf);
        },

        pong: (ws, buf) => {
            ws.data.f.pong(ws, buf);
        }
    }

    /**
     * A WebSocket route
     */
    export interface Route<D = any> {
        /**
         * Bind to a server
         */
        bind(server: Server): this;

        /**
         * Upgrade to WebSocket
         */
        upgrade(ctx: Context, info?: {
            data?: D,
            headers?: ContextHeaders
        }): boolean;

        /**
         * Current Bun server
         */
        server: Server;
    }

    /**
     * Create a WebSocket route
     */
    export const route = <D = any>(f: WebSocketHandler<Data<D>>) => {
        if (!f.open) f.open = noop;
        if (!f.close) f.close = noop;
        if (!f.drain) f.drain = noop;
        if (!f.ping) f.ping = noop;
        if (!f.pong) f.pong = noop;

        const
            // Upgrade with no passed data
            noDataUpgrade = {
                data: { f, body: null }
            },
            // Main route
            o: Route<D> = {
                server: null,

                bind: s => {
                    o.server = s;
                    return o;
                },

                upgrade: (c, info) => {
                    if (info) {
                        // @ts-ignore Reassign
                        info.data = { f, body: info.data };
                        return o.server.upgrade(c, info);
                    }

                    return o.server.upgrade(c, noDataUpgrade);
                }
            };

        return o;
    }
}
