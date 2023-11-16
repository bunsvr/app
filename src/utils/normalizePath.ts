export default (path: string) =>
    path.at(-1) === '/' ? path.slice(0, -1) : path;
