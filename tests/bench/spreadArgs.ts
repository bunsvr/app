import { run, bench, group } from 'mitata';
import noop from './noop';

noop(bench);

group('Spread fn', () => {
    Bun.gc(true);

    // @ts-ignore
    const fn4 = (a: any) => new Response(a, null);
    const fn3 = (a: any) => new Response(a);
    const fn2 = (a: any, b?: any) => new Response(a, b);
    const fn1 = (...args: any[]) => new Response(...args);

    bench('Spread 1', () => fn1('Hi'));
    bench('No spread 1', () => fn2('Hi'));

    bench('Spread 2', () => fn1('Hi', {}));
    bench('No spread 2', () => fn2('Hi', {}));

    bench('Direct 1', () => fn3('Hi'));
    bench('Direct 2', () => fn4('Hi'));
});

run();
