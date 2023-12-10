import { routes } from '@stricjs/app';
import ping from './ping.ws';

export function main() {
    return routes('/ws')
        .get('/', c => ping.upgrade(c, {
            data: { id: performance.now().toString() }
        }));
}
