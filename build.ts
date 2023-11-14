/// <reference types='bun-types' />
import { existsSync, rmSync } from 'fs';

// Generating types
const dir = './types';
if (existsSync(dir))
    rmSync(dir, { recursive: true });

Bun.build({
    format: 'esm',
    target: 'bun',
    outdir: './lib',
    minify: true,
    entrypoints: [
        './src/index.ts', './src/send.ts',
        './src/parser.ts', './src/stream.ts',
        './src/options.ts'
    ]
});

// Build type declarations
Bun.spawn(['bun', 'x', 'tsc', '--outdir', dir], { stdout: 'inherit' });
