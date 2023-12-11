import { routes } from '@stricjs/app';
import ping from './ping.ws';

export const main = () => routes('/ws')
    .get('/', c => ping.upgrade(c, {
        data: { id: performance.now().toString() }
    }));
