// Assembles the Lighthouse menu app into one self-contained page.
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
const body = readFileSync(join(here, 'app.src.html'), 'utf8');
const out = body.replace('/* @FONTS@ */', fonts);
writeFileSync(join(here, 'lighthouse-menu.html'), out);
console.log('lighthouse-menu.html', (out.length / 1024).toFixed(0), 'KB');
