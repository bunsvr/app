import { layer } from '@stricjs/app';

// Prefix for all routes
export const prefix = '/api';

// Guard and layer functions
export const guards = [
    layer(c => {
        console.log('A request arrived.');
        console.log('Request URL:', c.url);
    })
];
