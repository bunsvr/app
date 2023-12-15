import App from '@stricjs/app';
import { status } from '@stricjs/app/send';

const app = new App({
    routes: [import.meta.dir + '/src'],
    fallback: () => status(404),
    ws: true
});

// Register all routes 
await app.build();
app.logRoutes();

// Start the server
app.boot();
