import { readFile } from 'node:fs/promises';
import { build } from 'esbuild';
import { patchServerSource } from './server-source-policy.mjs';

const serverSource=await readFile('server/runtime.ts','utf8');
const patchedServer=patchServerSource(serverSource);
await build({stdin:{contents:patchedServer,resolveDir:'server',sourcefile:'server/runtime.ts',loader:'ts'},outfile:'dist/server/index.js',bundle:true,platform:'node',target:'node24',format:'esm',packages:'external',sourcemap:true});
