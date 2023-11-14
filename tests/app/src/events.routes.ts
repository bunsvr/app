import { events } from '@stricjs/app/stream';
import send from '@stricjs/app/send';
import { routes } from '@stricjs/app';

export function main() {
    const stream = events(async c => {
        c.write('event: message\n');
        c.write('data: Hi\n');

        await Bun.sleep(3000);
    }).stream();

    return routes()
        .get('/events', stream)
        .get('/hi', () => send('Hi'));
}
