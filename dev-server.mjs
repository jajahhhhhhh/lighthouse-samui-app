#!/usr/bin/env node
// Static server + rebuild-on-save + live reload, in one process.
//
//   node dev-server.mjs [--port 4173] [--plates]
//
// The reload client is injected into HTML *as it is served*. It never touches
// the files on disk, so app/lighthouse-menu.html stays clean and publishable.

import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat, readFile } from 'node:fs/promises';
import { join, normalize, extname, sep } from 'node:path';
import { ROOT, tasks, build, watchTasks, log, C } from './build-tasks.mjs';

const argv = process.argv.slice(2);
const flag = n => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : null; };
const PORT = Number(flag('--port')) || 4173;
const list = tasks({ plates: argv.includes('--plates') });

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.md': 'text/markdown; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.pdf': 'application/pdf', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8',
};

const CLIENT = `<script>
(() => {
  const es = new EventSource('/__reload');
  es.onmessage = e => { if (e.data === 'reload') location.reload(); };
})();
</script>`;

const clients = new Set();

function notify() {
  // real newlines — an SSE event is terminated by a blank line
  for (const res of clients) res.write('data: reload\n\n');
  if (clients.size) log('reload', `${clients.size} tab${clients.size > 1 ? 's' : ''}`, C.CYN);
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname === '/__reload') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    });
    res.write('retry: 800\n\n');
    clients.add(res);
    const ping = setInterval(() => res.write(': ping\n\n'), 25000);
    req.on('close', () => { clearInterval(ping); clients.delete(res); });
    return;
  }

  // Contain every request inside ROOT — normalize resolves any ".." first.
  const rel = normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, '');
  if (rel.split(sep).includes('..')) { res.writeHead(403).end('Forbidden'); return; }
  let file = join(ROOT, rel);

  try {
    let info = await stat(file);
    if (info.isDirectory()) { file = join(file, 'index.html'); info = await stat(file); }
    const type = MIME[extname(file).toLowerCase()] || 'application/octet-stream';

    if (type.startsWith('text/html')) {
      let html = await readFile(file, 'utf8');
      html = html.includes('</body>')
        ? html.replace('</body>', CLIENT + '</body>')
        : html + CLIENT;
      res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' });
      res.end(html);
      return;
    }
    res.writeHead(200, { 'Content-Type': type, 'Content-Length': info.size,
                         'Cache-Control': 'no-store' });
    createReadStream(file).pipe(res);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('404');
  }
});

await Promise.all(list.map(build));
watchTasks(list, (_task, ok) => { if (ok) notify(); });

server.listen(PORT, '127.0.0.1', () => {
  log('serve', `http://localhost:${PORT}  ${C.DIM}live reload on${C.OFF}`, C.GRN);
  console.log(`${C.DIM}         app    /app/lighthouse-menu.html`);
  console.log(`         system /dist/screens/home.html`);
  console.log(`         ctrl-c to stop${C.OFF}`);
});
process.on('SIGINT', () => { console.log(); process.exit(0); });
