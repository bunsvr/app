import { config } from '@stricjs/app';

export default config.guards('/api', c => {
    console.log('A request arrived.');
    console.log('URL:', c.url);
});
