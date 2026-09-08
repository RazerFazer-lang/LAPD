import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

// AMP setup: install dependencies and create the production Node.js bundle.
const root = fileURLToPath(new URL('../', import.meta.url));
const pkg = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));

if (Number(process.versions.node.split('.')[0]) !== 24)
  throw Error('AMP muss Node.js 24 verwenden.');

function run(command, args) {
  return new Promise((done, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'development', CI: 'true' },
      shell: false,
    });
    child.on('error', reject);
    child.on('exit', (code) =>
      code === 0 ? done() : reject(Error(`AMP-Setup fehlgeschlagen (${code}).`)),
    );
  });
}

// npm is bundled with Node 24, so AMP does not need a global package manager.
await run('npm', ['install']);
await run('npm', ['run', 'build']);

console.log(`${pkg.name}: AMP-Setup erfolgreich. Startdatei: dist/server/index.js`);
