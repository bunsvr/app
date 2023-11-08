import { routes } from '../../..';
import { text } from '../../../wrap';

export const main = () => routes()
    .get('/', () => text('Hi'));
