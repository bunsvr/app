import { routes } from '@stricjs/app';
import { t, vld, Infer } from 'vld-ts';
import { jsonv } from '@stricjs/app/parser';

// Schema
const User = t.obj({
    name: t.str,
    age: t.num
}), isUser = vld(User);

type User = Infer<typeof User>;

export default routes()
    .state(jsonv(isUser))
    .post('/json', c => c.body = `${c.state.name}: ${c.state.age}`);
