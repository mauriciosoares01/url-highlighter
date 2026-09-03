import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const browser = process.argv[2];
if (browser !== 'chrome' && browser !== 'firefox') {
  console.error(`Uso: node scripts/build.mjs <chrome|firefox>. Recebido: "${browser}"`);
  process.exit(1);
}

const outDir = path.join(rootDir, 'dist', browser);

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

await build({
  entryPoints: {
    background: path.join(rootDir, 'src/background/service-worker.ts'),
    'content-script': path.join(rootDir, 'src/content/content-script.ts'),
    popup: path.join(rootDir, 'src/popup/popup.ts'),
    options: path.join(rootDir, 'src/options/options.ts'),
  },
  outdir: outDir,
  format: 'iife',
  bundle: true,
  target: 'es2020',
});

for (const file of ['popup.html', 'popup.css']) {
  cpSync(path.join(rootDir, 'src/popup', file), path.join(outDir, file));
}
for (const file of ['options.html', 'options.css']) {
  cpSync(path.join(rootDir, 'src/options', file), path.join(outDir, file));
}
cpSync(path.join(rootDir, 'icons'), path.join(outDir, 'icons'), { recursive: true });

const template = JSON.parse(readFileSync(path.join(rootDir, 'manifest.template.json'), 'utf8'));

const overrides =
  browser === 'chrome'
    ? { background: { service_worker: 'background.js' } }
    : {
        background: { scripts: ['background.js'] },
        browser_specific_settings: { gecko: { id: 'url-highlighter@beehus.com.br' } },
      };

const manifest = { ...template, ...overrides };

writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

console.log(`[url-highlighter] build ${browser} concluído em ${outDir}`);
