// Shared build definitions. Used by watch.mjs (CLI) and dev-server.mjs (serve).
import { watch } from 'node:fs';
import { spawn } from 'node:child_process';
import { dirname, basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = dirname(fileURLToPath(import.meta.url));

const DIM = '\x1b[2m', RED = '\x1b[31m', GRN = '\x1b[32m', CYN = '\x1b[36m', OFF = '\x1b[0m';
const clock = () => new Date().toTimeString().slice(0, 8);
export const log = (name, msg, color = '') =>
  console.log(`${DIM}${clock()}${OFF}  ${name.padEnd(7)} ${color}${msg}${OFF}`);
export const C = { DIM, RED, GRN, CYN, OFF };

export function tasks({ plates = false } = {}) {
  return [
    { name: 'app',    src: 'app/app.src.html', cmd: ['node', 'app/build-app.mjs'],
      out: 'app/lighthouse-menu.html' },
    { name: 'system', src: 'build.mjs',        cmd: ['node', 'build.mjs'],
      out: 'dist/' },
    ...(plates ? [{ name: 'plates', src: 'canvas/book.py',
      cmd: ['python3', 'canvas/book.py'], out: 'canvas/' }] : []),
  ];
}

// One build at a time per task; a save during a build queues exactly one rerun.
const state = new Map();
const slot = name => {
  if (!state.has(name)) state.set(name, { running: false, dirty: false, timer: null });
  return state.get(name);
};

export function build(task) {
  const st = slot(task.name);
  if (st.running) { st.dirty = true; return Promise.resolve(false); }
  st.running = true;
  const started = Date.now();
  return new Promise(resolve => {
    const child = spawn(task.cmd[0], task.cmd.slice(1), { cwd: ROOT });
    let err = '';
    child.stderr.on('data', d => { err += d; });
    child.stdout.on('data', () => {});      // build scripts are chatty; the timing is the news
    child.on('error', e => { err += e.message; });
    child.on('close', code => {
      st.running = false;
      const ok = code === 0;
      if (ok) {
        log(task.name, `→ ${task.out}  ${Date.now() - started}ms`, GRN);
      } else {
        log(task.name, `failed (exit ${code})`, RED);
        for (const line of err.trim().split('\n').slice(-6)) {
          console.log(`         ${DIM}${line}${OFF}`);
        }
      }
      if (st.dirty) { st.dirty = false; build(task).then(r => resolve(r)); }
      else resolve(ok);
    });
  });
}

// Watch the directory, not the file: editors save atomically (write a temp file,
// then rename over the original), which invalidates a file-level watch after the
// very first save.
export function watchTasks(list, onBuilt = () => {}) {
  for (const task of list) {
    const dir = join(ROOT, dirname(task.src));
    const target = basename(task.src);
    watch(dir, (_evt, file) => {
      if (file !== target) return;
      const st = slot(task.name);
      clearTimeout(st.timer);                // one save can fire several events
      st.timer = setTimeout(() => build(task).then(ok => onBuilt(task, ok)), 120);
    });
    log(task.name, `watching ${task.src}`, DIM);
  }
}
