export default (path: string) =>
    path.length === 1 ? path : path.at(-1) === '/' ? path.slice(0, -1) : path;
