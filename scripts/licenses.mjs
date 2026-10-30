// C-26 license inventory of the dependencies that can ship in the artifact.
// license-checker's --production flag does not read npm v3 lockfile dev
// markers, so the production set comes from `npm ls --omit=dev` and is
// passed explicitly. Output: THIRD_PARTY_LICENSES.md. Fails on copyleft.
import { execFileSync } from 'node:child_process';

const FAIL_ON = 'GPL-2.0;GPL-3.0;AGPL-3.0;LGPL-3.0';
const tree = JSON.parse(execFileSync('npm', ['ls', '--omit=dev', '--all', '--json'], { encoding: 'utf8', maxBuffer: 64 << 20 }));
const ids = new Set();
(function walk(deps) {
  for (const [name, info] of Object.entries(deps ?? {})) {
    if (info.version) ids.add(`${name}@${info.version}`);
    walk(info.dependencies);
  }
})(tree.dependencies);

execFileSync('npx', ['license-checker-rseidelsohn', '--excludePrivatePackages', '--markdown',
  '--out', 'THIRD_PARTY_LICENSES.md', '--failOn', FAIL_ON, '--includePackages', [...ids].join(';')],
  { stdio: 'inherit' });
console.log(`License inventory: ${ids.size} shippable packages written to THIRD_PARTY_LICENSES.md`);
