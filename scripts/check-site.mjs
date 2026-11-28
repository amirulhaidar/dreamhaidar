import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const errors = [];
let checked = 0;
function check(value, file) {
  if (!value || /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(value)) return;
  const clean = decodeURIComponent(value.split(/[?#]/)[0]);
  if (!clean) return;
  const target = path.resolve(path.dirname(file), clean);
  checked++;
  if (!fs.existsSync(target) || !fs.statSync(target).isFile() || fs.statSync(target).size === 0) errors.push(file + ': missing or empty ' + value);
}
for (const file of ['index.html', 'layanan.html']) {
  const text = fs.readFileSync(file, 'utf8');
  for (const match of text.matchAll(/(?:src|href|poster)\s*=\s*["']([^"']+)["']/gi)) check(match[1], file);
}
for (const name of fs.readdirSync('css').filter(name => name.endsWith('.css'))) {
  const file = path.join('css', name);
  for (const match of fs.readFileSync(file, 'utf8').matchAll(/url\(\s*["']?([^\s"')]+)["']?\s*\)/gi)) check(match[1], file);
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('PASS: ' + checked + ' local HTML/CSS references exist and are non-empty.');
