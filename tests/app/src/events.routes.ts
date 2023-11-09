import * as stream from '@stricjs/app/stream';
import * as send from '@stricjs/app/send';
import { routes } from '@stricjs/app';

export const main = () => routes()
    .get('/events', c => {
        const { signal } = c;

        return stream.events({
            type: 'direct',
            pull: async c => {
                while (!signal.aborted) {
                    // Hi
                    c.write('event: message\n');
                    c.write('data: Hi\n');
                    c.flush();

                    await Bun.sleep(5000);
                }

                // End if signal aborted
                c.close();
            }
        });
    })
    .get('/hi', () => send.text('Hi'));
