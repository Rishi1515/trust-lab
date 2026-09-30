// Confirms the production build references assets under the GitHub Pages base path.
import { existsSync, readFileSync, readdirSync } from 'node:fs';

const base = process.env.BASE_PATH ?? '/trustlab/';
const html = readFileSync('dist/index.html', 'utf8');
const problems = [];

const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((m) => m[1]);
const local = refs.filter((r) => !/^(https?:)?\/\//.test(r) && !r.startsWith('#') && !r.startsWith('data:'));
if (local.length === 0) problems.push('dist/index.html references no local assets.');
for (const ref of local) {
  if (!ref.startsWith(base)) problems.push(`Asset "${ref}" does not start with base path ${base}.`);
  const onDisk = `dist/${ref.slice(base.length)}`;
  if (ref.startsWith(base) && !existsSync(onDisk)) problems.push(`Asset "${ref}" is missing from dist/.`);
}
const sprites = existsSync('dist/sprites') ? readdirSync('dist/sprites') : [];
for (const f of ['cal-idle.png', 'cal-audit-strike.png', 'cal-collapse.png', 'risk-skull.png', 'torch.png', 'torch2.png']) {
  if (!sprites.includes(f)) problems.push(`Sprite ${f} missing from dist/sprites/.`);
}

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`Build OK: ${local.length} asset references under ${base}; ${sprites.length} sprite files.`);
