/// <reference types='bun-types' />

export default (bench: any, t = 100) => {
    for (var i = 0; i < t; ++i)
        bench('noop', () => { });
}
