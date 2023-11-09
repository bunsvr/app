import send from '../../../send';
import { routes } from '../../..';

export const main = () => routes()
    .get('/events', () => send.events({
        type: 'direct',
        pull: c => {
            c.write('data: Hi');
            c.close();
        }
    }));
