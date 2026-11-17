#!/usr/bin/env node
import { build } from 'esbuild';
import { writeFileSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const outdir = resolve(root, 'dist-standalone');
const outfile = resolve(outdir, 'codekeep.mjs');
const binfile = resolve(outdir, 'codekeep');

await build({
  entryPoints: [resolve(root, 'packages/cli/src/index.tsx')],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile,
  minify: true,
  alias: { 'react-devtools-core': resolve(root, 'scripts/shims/react-devtools-core.mjs') },
  jsx: 'automatic',
  loader: { '.tsx': 'tsx', '.ts': 'ts' },
  conditions: ['import', 'node'],
  mainFields: ['module', 'main'],
  banner: {
    js: 'import{createRequire as __createRequire}from"node:module";const require=__createRequire(import.meta.url);',
  },
});

let code = readFileSync(outfile, 'utf8');
code = code.replace(/^#!.*\n/, '');
writeFileSync(outfile, '#!/usr/bin/env node\n' + code);

console.log('Standalone build complete: dist-standalone/codekeep.mjs');

if (process.argv.includes('--bun')) {
  execFileSync('bun', ['build', '--compile', '--production', outfile, '--outfile', binfile], {
    stdio: 'inherit',
  });
}
