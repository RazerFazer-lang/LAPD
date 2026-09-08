import { readFile } from 'node:fs/promises';
import { build } from 'esbuild';

// Stations are infrastructure, not free vehicles. The first fleet unit is purchased
// later through the station's FLEET / APPARATUS upgrades. Keep the server source
// readable while making the production bundle enforce that rule.
const serverSource=await readFile('server/index.ts','utf8');
const patchedServer=serverSource.replace(
  'state.finance.upgrades+=cost;addVehicle(c,service,safePosition);',
  'state.finance.upgrades+=cost;',
);
if(patchedServer===serverSource)throw new Error('Production build guard: starter vehicle call not found. Refusing to build an unexpected server.');

await build({
  stdin:{
    contents:patchedServer,
    resolveDir:'.',
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
