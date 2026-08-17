// Assembles the Lighthouse menu app.
//
// Two outputs from one source:
//   lighthouse-menu.html  a complete standalone document — what GitHub Pages
//                         serves and what you hand to anyone. Needs its own
//                         doctype and viewport meta, or phones lay the page out
//                         at 980px and render the app as a shrunken card.
//   artifact-body.html    the same content as a fragment, for hosts that supply
//                         their own <head> (Claude artifacts).
//
// fonts.css holds Caprasimo, Figtree and Noto Sans Thai as base64 woff2. They
// are committed rather than fetched: the artifact CSP blocks font CDNs, so a
// linked Google Fonts URL would silently fall back to a system serif and lose
// the wordmark — and a build that reaches the network isn't reproducible.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

const fonts = readFileSync(join(here, 'fonts.css'), 'utf8');
const src = readFileSync(join(here, 'app.src.html'), 'utf8');
const fragment = src.replace('/* @FONTS@ */', fonts);

// split at <main>: everything before it belongs in <head>, the rest in <body>
const cut = fragment.indexOf('<main');
if (cut < 0) throw new Error('app.src.html: expected a <main> element');
const head = fragment.slice(0, cut).trimEnd();
const body = fragment.slice(cut).trimEnd();

const DESC = 'Menu and in-store pickup for Lighthouse Samui — cannabis shop, '
  + 'bar and café in Chaweng, Ko Samui. Adults 20+.';

// viewport-fit=cover is what makes env(safe-area-inset-*) resolve to real
// values on notched phones; without it the tab bar sits under the home bar.
const doc = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="${DESC}">
<meta name="theme-color" content="#272E1B">
<meta name="color-scheme" content="light">
<meta name="format-detection" content="telephone=no">
${head}
</head>
<body>
${body}
</body>
</html>
`;

writeFileSync(join(here, 'lighthouse-menu.html'), doc);
writeFileSync(join(here, 'artifact-body.html'), fragment);
console.log('lighthouse-menu.html', (doc.length / 1024).toFixed(0), 'KB  (standalone)');
console.log('artifact-body.html  ', (fragment.length / 1024).toFixed(0), 'KB  (fragment)');
