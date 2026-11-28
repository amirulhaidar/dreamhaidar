import fs from 'node:fs';
import path from 'node:path';
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
// Validate fragment targets and duplicate IDs in both pages.
for (const file of ['index.html', 'layanan.html']) {
 const text = fs.readFileSync(file, 'utf8');
 const ids = [...text.matchAll(/\bid=["']([^"']+)["']/gi)].map(match => match[1]);
 if (new Set(ids).size !== ids.length) errors.push(file + ': duplicate element IDs');
 for (const match of text.matchAll(/\bhref=["']([^"']+)["']/gi)) {
  const value = match[1];
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(value) || !value.includes('#')) continue;
  const [name, fragment] = value.split('#');
  if (!fragment) continue;
  const destination = name ? path.resolve(path.dirname(file), name.split('?')[0]) : file;
  if (!fs.existsSync(destination)) continue;
  const targetIds = [...fs.readFileSync(destination, 'utf8').matchAll(/\bid=["']([^"']+)["']/gi)].map(item => item[1]);
  if (!targetIds.includes(decodeURIComponent(fragment))) errors.push(file + ': missing anchor ' + value);
 }
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('PASS: ' + checked + ' local HTML/CSS references exist and are non-empty.');
