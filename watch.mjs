#!/usr/bin/env node
// Rebuilds on save.
//
//   node watch.mjs            app + design system
//   node watch.mjs --plates   also re-render the canvas plates (slower)
//   node watch.mjs --once     build everything once and exit
//
// For rebuild + browser reload in one command, use dev-server.mjs instead.

import { tasks, build, watchTasks, C } from './build-tasks.mjs';

const args = new Set(process.argv.slice(2));
const list = tasks({ plates: args.has('--plates') || args.has('--all') });

// Await the first pass — otherwise --once would exit and kill its own children.
const first = await Promise.all(list.map(build));
if (args.has('--once')) process.exit(first.every(Boolean) ? 0 : 1);

watchTasks(list);
console.log(`${C.DIM}         ctrl-c to stop${C.OFF}`);
process.on('SIGINT', () => { console.log(); process.exit(0); });
