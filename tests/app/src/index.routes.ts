import { routes } from '../../..';
import { json, text } from '../../../wrap';

export const main = () => routes()
    .get('/', () => text('Hi'))
    .post('/json', c => c.json().then(json));
