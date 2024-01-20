import type { Server, ServerWebSocket, WebSocketHandler } from 'bun';
import type { Context } from '../types';

const noop = () => null, symbol = Symbol('ws');

export namespace ws {
    export interface Data {
        f: WebSocketHandler<any>,
        body: any
    };

    export interface Socket<D = any> extends ServerWebSocket<D> {
        _: WebSocketHandler<D>;
    }

    // WebSocket routing
    export const options: WebSocketHandler<Data> = {
        message: (ws: Socket, message) => {
            ws._.message(ws, message);
        },

        // All optional handlers must be set to noop
        open: (ws: Socket) => {
            // Set handler
            ws._ = ws.data.f;
            ws.data = ws.data.body;

            ws._.open(ws);
        },

        close: (ws: Socket, ...args) => {
            ws._.close(ws, ...args);
        },

        drain: (ws: Socket) => {
            ws._.drain(ws);
        },

        ping: (ws: Socket, buf) => {
            ws._.ping(ws, buf);
        },

        pong: (ws: Socket, buf) => {
            ws._.pong(ws, buf);
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
            headers?: Bun.HeadersInit
        }): boolean;

        /**
         * Current Bun server
         */
        server: Server;

        /**
         * The special symbol to check for WebSocket route
         */
        [symbol]: null;
    }

    /**
     * Create a WebSocket route
     */
    export const route = <D = any>(f: WebSocketHandler<D>) => {
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
                [symbol]: null,

                bind: s => {
                    o.server = s;
                    return o;
                },

                upgrade: (c, info) => {
                    if (info) {
                        // @ts-ignore Reassign
                        info.data = { f, body: info.data };
                        return o.server.upgrade(c.req, info);
                    }

                    return o.server.upgrade(c.req, noDataUpgrade);
                }
            };

        return o;
    }

    export const isRoute = (d: any): d is Route => d[symbol] === null;
}
