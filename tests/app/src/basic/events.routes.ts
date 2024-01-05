import { events } from '@stricjs/app/stream';
import { routes } from '@stricjs/app';

const stream = events(async c => {
    c.write('event: message\n');
    c.write('data: Hi\n');

    await Bun.sleep(3000);
}).stream();

export default routes()
    .get('/events', stream);
