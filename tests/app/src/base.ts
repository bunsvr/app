import { config, layer } from '@stricjs/app';

export default config.guard(
    '/api', layer(c => {
        console.log('A request arrived.');
        console.log('URL:', c.url);
    })
);
