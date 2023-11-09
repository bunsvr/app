# `@stricjs/app`
Create high-performance and scalable web apps with Stric app module.

## Install
Install the app and utils module.

```bash
bun add @stricjs/app @stricjs/utils
```

## Usage
To register routes from specific directories, 
create a new app.
```ts
import { init } from '@stricjs/app';

init({
    routes: ['./src/routes']
});
```

Create files in `./src/routes` with extension 
`.routes.ts` and export a `main` function .
```ts
import { routes } from '@stricjs/app';
import send from '@stricjs/app/send';

export const main = () => routes()
    .get('/', () => send.text('A'))
    .post('/json', c => c.json().then(send.json));
```

The process will automatically handle routes 
from registered directories.

## Note
This package is experimental. Production use is not recommended.
