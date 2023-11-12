import { init } from '../..';

init({
    routes: [import.meta.dir],
    fallback: () => new Response('Not found')
});

