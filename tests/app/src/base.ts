import { config } from '@stricjs/app';

export default config.guard('/api', c => {
    console.log('A request arrived.');
    console.log('URL:', c.url);
});
