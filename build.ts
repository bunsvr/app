/// <reference types='bun-types' />
import { existsSync, rmSync } from 'fs';

const root = import.meta.dir;

const libDir = root + '/lib';
if (existsSync(libDir))
    rmSync(libDir, { recursive: true });

Bun.build({
    format: 'esm',
    target: 'bun',
    outdir: libDir,
    minify: true,
    entrypoints: [
        './src/index.ts', './src/send.ts',
        './src/parser.ts', './src/stream.ts',
        './src/options.ts'
    ]
}).then(console.log);

// Build type declarations
Bun.spawn(['bun', 'x', 'tsc', '--outdir', libDir], {
    stdout: 'inherit'
});
