import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));

function run(command, args) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production', CI: 'true' },
      shell: false,
    });
    child.on('error', reject);
    child.on('exit', (code) => code === 0 ? resolvePromise() : reject(new Error(`${command} fehlgeschlagen (${code}).`)));
  });
}

// AMP keeps the downloaded Git working tree between restarts. Pull main before
// rebuilding so the public server cannot remain on an old UI/build.
await run('git', ['pull', '--ff-only', 'origin', 'main']);
await run('npm', ['install']);
await run('npm', ['run', 'build']);
console.log('AMP Update erfolgreich: main synchronisiert und Produktions-Build erstellt.');
