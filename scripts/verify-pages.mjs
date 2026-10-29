import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = path.resolve(process.argv[2] || '.');
const base = 'https://alexbrandoow.github.io/void/';
const references = [];
const add = (source, value) => {
  if (!value || !/^\/?(?:\.\.?\/)?(?:assets|css|js)\//.test(value)) return;
  references.push({ source, value });
};

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const match of html.matchAll(/\b(?:src|href|poster|data-image|content)="([^"]+)"/g)) {
  add('index.html', match[1]);
}
for (const file of fs.readdirSync(path.join(root, 'css')).filter(name => name.endsWith('.css'))) {
  const css = fs.readFileSync(path.join(root, 'css', file), 'utf8');
  for (const match of css.matchAll(/url\(\s*['"]?([^'"\)]+)['"]?\s*\)/g)) add(`css/${file}`, match[1].trim());
}
const config = fs.readFileSync(path.join(root, 'js/config.js'), 'utf8');
for (const match of config.matchAll(/(?:product|street):\s*['"]([^'"]+\.mp4)['"]/g)) add('js/config.js', match[1]);

const tracked = new Set(execFileSync('git', ['ls-files', '-z'], { cwd: root }).toString('utf8').split('\0'));
const errors = [];
for (const { source, value } of references) {
  const resolved = new URL(value, source === 'js/config.js' ? base : new URL(source, base));
  if (resolved.origin !== new URL(base).origin || !resolved.pathname.startsWith('/void/')) {
    errors.push(`${source}: URL fora de /void/: ${value}`);
    continue;
  }
  const relative = decodeURIComponent(resolved.pathname.slice('/void/'.length));
  const file = path.resolve(root, relative);
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile() || fs.statSync(file).size === 0) {
    errors.push(`${source}: arquivo ausente ou vazio: ${value}`);
  } else if (!tracked.has(relative.replaceAll('\\', '/'))) {
    errors.push(`${source}: arquivo fora do Git: ${value}`);
  }
}

for (const name of ['video 1.mp4', 'video 2.mp4']) {
  const relative = `assets/videos/${name}`;
  const file = path.join(root, relative);
  if (!fs.existsSync(file) || !tracked.has(relative)) {
    errors.push(`Vídeo não publicado pelo Git: ${relative}`);
    continue;
  }
  const data = fs.readFileSync(file);
  for (const atom of ['ftyp', 'moov', 'mdat', 'avc1', 'mp4a']) {
    if (!data.includes(Buffer.from(atom))) errors.push(`${relative}: estrutura MP4 sem ${atom}`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`${references.length} referências locais válidas para /void/; dois MP4s rastreados, com marcadores avc1/mp4a.`);
}
