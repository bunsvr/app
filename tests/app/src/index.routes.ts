import { routes } from '../../..';
import send from '../../../send';
import parser from '../../../parser';

export function main() {
    // JSON parser
    const parse = parser.json(
        (d): { message: string } | null =>
            typeof d?.message === 'string' ? d : null
    );

    // Routes
    return routes()
        .get('/', () => send.text('Hi'))
        .post('/json', async c => {
            const d = await parse(c);
            return d === null ? null : send.text(d.message);
        });
}
