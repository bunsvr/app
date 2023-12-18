import { build } from '@stricjs/app';
import ctx from '../../lib/send';

// Create an register routes
const app = await build({
    routes: [import.meta.dir + '/src'],
    fallback: c => {
        c.set.status = 404;
        return ctx(c);
    },
    ws: true,
    contextSet: true
});

// Register all routes
app.logRoutes();

// Start the server
app.boot();
