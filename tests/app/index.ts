import App from '@stricjs/app';
import { status } from '@stricjs/app/send';

const app = await new App({
    routes: [import.meta.dir],
    fallback: () => status(404)
}).build();

export default app;

