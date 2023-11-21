import { ws, routes, type App } from '@stricjs/app';

const ping = ws.route<{ id: string }>({
    message(ws, msg) {
        if (msg === 'Ping')
            ws.send(ws.data.id);
    }
});

export function main(app: App) {
    app.ws(ping);

    return routes('/ws')
        .get('/', c => ping.upgrade(c, {
            data: {
                id: performance.now().toString()
            }
        }));
}
