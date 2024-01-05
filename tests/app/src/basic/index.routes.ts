import { routes } from '@stricjs/app';
import send from '@stricjs/app/send';
import parser from '@stricjs/app/parser';

// JSON parser
const parse = parser.json(
    (d): { message: string } | null =>
        typeof d?.message === 'string' ? d : null
);

// Routes
export default routes()
    .get('/', () => send.text('Hi'))
    .post('/json', async c => {
        const d = await parse(c);
        return d === null ? null : send.text(d.message);
    });
