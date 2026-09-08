import { readFile } from 'node:fs/promises';
import { build } from 'esbuild';
import { patchServerSource } from './server-source-policy.mjs';

// Keep production behavior identical to local development: stations are
// infrastructure and do not grant a free vehicle. Fleet units are purchased
// through station upgrades.
const serverSource=await readFile('server/index.ts','utf8');
const patchedServer=patchServerSource(serverSource);

await build({
  stdin:{
    contents:patchedServer,
    resolveDir:'server',
    sourcefile:'server/index.ts',
    loader:'ts',
  },
  outfile:'dist/server/index.js',
  bundle:true,
  platform:'node',
  target:'node24',
  format:'esm',
  packages:'external',
  sourcemap:true,
});
