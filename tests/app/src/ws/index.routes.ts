import { routes } from '@stricjs/app';
import ping from './ping.ws';

export const main = () => routes('/ws')
    .get('/', c => {
        // Try upgrade
        ping.upgrade(c, {
            data: { id: performance.now().toString() }
        });

        // Exit the chain
        return null;
    });
