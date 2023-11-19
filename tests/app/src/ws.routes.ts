import { ws, routes, type App } from '@stricjs/app';

const ping = ws.route({
    message(ws, msg) {
        if (msg === 'Ping')
            ws.send('Pong');
    }
});

export function main(app: App) {
    app.ws(ping);

    return routes('/ws')
        .get('/', c => ping.upgrade(c));
}
