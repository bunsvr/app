import { routes } from '@stricjs/app';
import send from '@stricjs/app/send';

const list: Record<string, string> = { '1': 'Reve' };

export default routes('/user/:id')
    .get('/', c => send.text(c.params.id))
    .get('/name', c => {
        if (c.params.id in list)
            return send.text(list[c.params.id]);

        return send.stat('User not found', 404);
    });
