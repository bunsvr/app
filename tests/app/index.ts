import { build } from '@stricjs/app';
import { status } from '@stricjs/app/send';

// Create an register routes
const app = await build({
    routes: [import.meta.dir + '/src'],
    fallback: () => status(404),
    ws: true,
});

// Register all routes
app.logRoutes();

// Start the server
app.boot();
