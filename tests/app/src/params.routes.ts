import { routes } from '@stricjs/app';
import { text } from '@stricjs/app/send';

const list = { '1': 'Reve' };

export function main() {
    return routes('/user/:id')
        .get('/', c => text(c.params.id))
        .get('/name', c => text(
            list[c.params.id] ?? 'User not found'
        ));
}
