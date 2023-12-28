/// <reference types='bun-types' />
import { existsSync, rmSync } from 'fs';
import pkg from './package.json';

const root = import.meta.dir;

const libDir = root + '/lib';
if (existsSync(libDir))
    rmSync(libDir, { recursive: true });

// Bundle all with Bun
Bun.build({
    format: 'esm',
    target: 'bun',
    outdir: libDir,
    minify: true,
    entrypoints: [
        './src/index.ts', './src/send.ts',
        './src/parser.ts', './src/stream.ts',
    ],
    external: Object.keys(pkg.dependencies)
}).then(console.log);

// Build type declarations
Bun.spawn(['bun', 'x', 'tsc', '--outdir', libDir], {
    stdout: 'inherit',
    stderr: 'inherit'
});
