import { routes } from '@stricjs/app';
import { stat, text } from '@stricjs/app/send';

const list: Record<string, string> = { '1': 'Reve' };

export default routes('/user/:id')
    .get('/', c => text(c.params.id))
    .get('/name', c => {
        if (c.params.id in list)
            return text(list[c.params.id]);

        return stat('User not found', 404);
    });
