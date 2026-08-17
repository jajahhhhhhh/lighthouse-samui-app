// Lighthouse Samui — mobile app design-system bundle builder.
// Emits self-contained preview HTML into ./dist for upload via DesignSync.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const OUT = new URL('./dist/', import.meta.url).pathname;

const CSS = `
:root{
  --shore:#f0fae1; --mist:#e1eecc; --leaf:#ccdbb2; --sage:#aebf92;
  --moss:#6b7a52; --fern:#4f5c3a; --pine:#3d472b; --palm:#272e1b;
  --clay:#c67139; --clay-500:#d9834a; --clay-100:#fdf3ec; --clay-700:#a85a2a;
  --paper:#f9f4ed; --n500:#9a958c; --n700:#4a463f; --n800:#2e2b25;
  --r-sm:12px; --r-md:16px; --r-lg:28px; --r-pill:999px;
  --f-head:'Caprasimo',Georgia,'Times New Roman',serif;
  --f-body:'Figtree',-apple-system,BlinkMacSystemFont,system-ui,sans-serif;
  --shadow-lg:0 12px 32px rgba(39,46,27,.22);
}
*{box-sizing:border-box}
html,body{margin:0}
body{font-family:var(--f-body);background:#faf9f5;color:var(--palm);
  padding:20px;display:flex;justify-content:center;align-items:flex-start;
  -webkit-font-smoothing:antialiased}
.sheet{display:flex;gap:26px;flex-wrap:wrap;align-items:flex-start;justify-content:center}
.stack{display:flex;flex-direction:column;gap:14px}
.hd{font-family:var(--f-head);font-weight:400;line-height:1.05}
.cap{font:600 11px/1.35 var(--f-body);color:var(--n500);text-align:center;letter-spacing:.02em}
.sec{font:800 10px/1 var(--f-body);letter-spacing:2px;text-transform:uppercase;color:var(--moss)}
.panel{background:#fff;border:1px solid rgba(39,46,27,.1);border-radius:var(--r-lg);padding:22px 24px}

/* ── device frame ─────────────────────────────────────── */
.phone{width:390px;height:812px;flex:none;border-radius:46px;position:relative;
  overflow:hidden;display:flex;flex-direction:column;background:var(--shore);
  box-shadow:var(--shadow-lg),0 0 0 1px rgba(39,46,27,.14)}
.phone.dark{background:var(--palm)}
.island{position:absolute;top:11px;left:50%;transform:translateX(-50%);
  width:112px;height:33px;border-radius:22px;background:#000;z-index:40}
.sbar{height:54px;flex:none;display:flex;justify-content:space-between;align-items:flex-end;
  padding:0 28px 6px;font-size:14px;font-weight:700;letter-spacing:.2px;color:var(--palm)}
.sbar.on-dark{color:var(--mist)}
.sbar .r{display:flex;gap:6px;align-items:center}
.view{flex:1;min-height:0;display:flex;flex-direction:column}
.body{flex:1;min-height:0;overflow:hidden;padding:4px 20px 12px}
.hbar{height:24px;flex:none;display:flex;align-items:center;justify-content:center}
.hbar i{display:block;width:132px;height:5px;border-radius:3px;background:rgba(39,46,27,.26)}
.hbar.on-dark i{background:rgba(225,238,204,.5)}

/* ── tab bar ──────────────────────────────────────────── */
.tabs{flex:none;display:flex;justify-content:space-around;padding:9px 8px 2px;
  border-top:1.5px solid var(--leaf);background:var(--paper)}
.tab{position:relative;text-align:center;color:var(--n500);min-width:44px;padding:3px 6px}
.tab.on{color:var(--palm)}
.tab .ic{font-size:17px;line-height:1.2}
.tab .lb{font-size:9px;font-weight:700;margin-top:1px}
.tab .badge{position:absolute;top:-2px;right:0;background:var(--clay);color:var(--clay-100);
  border-radius:var(--r-pill);min-width:16px;height:16px;font-size:9px;font-weight:800;
  display:flex;align-items:center;justify-content:center}

/* ── atoms ────────────────────────────────────────────── */
.pill{display:inline-flex;align-items:center;gap:6px;border:1.5px solid var(--sage);
  border-radius:var(--r-pill);padding:8px 15px;font-size:12px;font-weight:600;color:var(--pine)}
.pill.on{background:var(--palm);border-color:var(--palm);color:var(--mist)}
.pill.leaf{background:var(--leaf);border-color:var(--leaf);color:var(--palm)}
.pill.clay{background:var(--clay);border-color:var(--clay);color:var(--clay-100);font-weight:700}
.pill.tag{padding:6px 14px;color:var(--pine)}
.btn{display:block;text-align:center;border-radius:var(--r-pill);padding:15px 20px;
  font-weight:700;font-size:14px}
.btn.primary{background:var(--clay);color:var(--clay-100)}
.btn.solid{background:var(--mist);color:var(--palm)}
.btn.ghost{border:1.5px solid var(--sage);color:var(--palm);font-weight:600}
.btn.ghost.on-dark{border-color:var(--fern);color:var(--leaf)}
.btn.sm{padding:9px 18px;font-size:12px;display:inline-block}
.card{background:var(--paper);border-radius:var(--r-lg);padding:18px 20px}
.card.dark{background:var(--palm);color:var(--mist)}
.kicker{font-size:10px;font-weight:800;letter-spacing:2px;color:var(--fern)}
.kicker.on-dark{color:var(--sage)}
.photo{background:repeating-linear-gradient(45deg,var(--mist),var(--mist) 6px,var(--shore) 6px,var(--shore) 12px);
  display:flex;align-items:center;justify-content:center;
  font:8px/1 ui-monospace,SFMono-Regular,monospace;color:var(--moss);letter-spacing:.5px}
.row{display:flex;gap:12px;align-items:center;background:var(--paper);
  border-radius:var(--r-md);padding:12px}
.plus{flex:none;width:34px;height:34px;border-radius:var(--r-pill);background:var(--palm);
  color:var(--mist);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px}
.step{width:28px;height:28px;border-radius:var(--r-pill);border:1.5px solid var(--sage);
  display:flex;align-items:center;justify-content:center;font-weight:800;color:var(--palm)}
.spec{display:flex;justify-content:space-between;align-items:center;
  border:1.5px solid var(--sage);border-radius:var(--r-pill);padding:11px 20px}
.legal{font-size:10.5px;color:var(--fern);text-align:center;margin-top:10px;line-height:1.5}
.g{display:flex;gap:8px;flex-wrap:wrap}
.mt6{margin-top:6px}.mt10{margin-top:10px}.mt14{margin-top:14px}.mt18{margin-top:18px}
.price{font-family:var(--f-head);color:var(--clay-700)}

/* ── logo mark ────────────────────────────────────────── */
.mark{display:inline-flex;flex-direction:column;align-items:center;--mk:1}
.mark i{display:block;background:currentColor}
.mark .lamp{width:calc(10px*var(--mk));height:calc(10px*var(--mk));border-radius:50%}
.mark .top{width:calc(26px*var(--mk));height:calc(14px*var(--mk));margin-top:calc(3px*var(--mk));
  border-radius:calc(5px*var(--mk)) calc(5px*var(--mk)) 0 0}
.mark .tower{width:calc(34px*var(--mk));height:calc(44px*var(--mk));
  clip-path:polygon(18% 0,82% 0,100% 100%,0 100%);border-radius:0 0 calc(6px*var(--mk)) calc(6px*var(--mk))}
.mark .base{width:calc(52px*var(--mk));height:calc(8px*var(--mk));margin-top:calc(3px*var(--mk));
  border-radius:calc(4px*var(--mk))}
`;

const SBR = `<svg width="52" height="12" viewBox="0 0 52 12" fill="none" aria-hidden="true">
<rect x="0" y="7" width="3" height="5" rx=".7" fill="currentColor"/><rect x="4.6" y="5" width="3" height="7" rx=".7" fill="currentColor"/>
<rect x="9.2" y="2.6" width="3" height="9.4" rx=".7" fill="currentColor"/><rect x="13.8" y="0" width="3" height="12" rx=".7" fill="currentColor"/>
<path d="M27 4.1c2.2 0 4.2.9 5.6 2.3l1.1-1.1A9.6 9.6 0 0 0 27 2.4a9.6 9.6 0 0 0-6.7 2.9l1.1 1.1A7.9 7.9 0 0 1 27 4.1Z" fill="currentColor"/>
<path d="M27 7.5c1.3 0 2.5.5 3.4 1.4l1.1-1.1A6.3 6.3 0 0 0 27 5.9c-1.7 0-3.2.7-4.5 1.9l1.1 1.1c.9-.9 2.1-1.4 3.4-1.4Z" fill="currentColor"/>
<circle cx="27" cy="10.6" r="1.4" fill="currentColor"/>
<rect x="38.5" y="0.5" width="10.5" height="11" rx="3" stroke="currentColor" stroke-opacity=".4" fill="none"/>
<rect x="40" y="2" width="7.5" height="8" rx="1.8" fill="currentColor"/>
<path d="M50.4 4.2v3.6c.7-.3 1.2-1.1 1.2-1.8s-.5-1.5-1.2-1.8Z" fill="currentColor" fill-opacity=".45"/></svg>`;

const mark = (scale, cls = '') =>
  `<span class="mark ${cls}" style="--mk:${scale}"><i class="lamp"></i><i class="top"></i><i class="tower"></i><i class="base"></i></span>`;

const TAB_DEFS = [['⌂', 'Home'], ['☰', 'Menu'], ['◎', 'Bag'], ['✦', 'Learn'], ['◍', 'Profile']];
const tabs = (active, badge = 0) => `<nav class="tabs">${TAB_DEFS.map(([ic, lb]) =>
  `<div class="tab${lb === active ? ' on' : ''}"><div class="ic">${ic}</div><div class="lb">${lb}</div>${
    lb === 'Bag' && badge ? `<div class="badge">${badge}</div>` : ''}</div>`).join('')}</nav>`;

const phone = ({ dark = false, time = '9:41', inner, tab = null, badge = 0 }) => `
<div class="phone${dark ? ' dark' : ''}"><div class="island"></div>
  <div class="sbar${dark ? ' on-dark' : ''}"><span>${time}</span><span class="r">${SBR}</span></div>
  <div class="view">${inner}</div>
  ${tab ? tabs(tab, badge) : ''}
  <div class="hbar${dark ? ' on-dark' : ''}"><i></i></div>
</div>`;

const labelled = (caption, html) => `<div class="stack"><div>${html}</div><div class="cap">${caption}</div></div>`;

const page = (title, body) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} · Lighthouse Samui</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caprasimo&family=Figtree:wght@400;500;600;700;800&display=swap">
<style>${CSS}</style></head>
<body><main class="sheet">${body}</main></body></html>
`;

const files = {};
const add = (path, title, body) => { files[path] = page(title, body); };

/* ─────────────────────────── FOUNDATIONS ─────────────────────────── */

const SWATCHES = [
  ['Shore', '#f0fae1', 'App background', '#272e1b'],
  ['Mist', '#e1eecc', 'Type on palm', '#272e1b'],
  ['Leaf', '#ccdbb2', 'Secondary fill', '#272e1b'],
  ['Sage', '#aebf92', 'Outlines', '#272e1b'],
  ['Moss', '#6b7a52', 'Muted label', '#f0fae1'],
  ['Fern', '#4f5c3a', 'Body on shore', '#f0fae1'],
  ['Pine', '#3d472b', 'Strong body', '#f0fae1'],
  ['Palm', '#272e1b', 'Surfaces, hero', '#e1eecc'],
  ['Clay', '#c67139', 'Primary action', '#fdf3ec'],
  ['Clay 500', '#d9834a', 'Action, on dark', '#272e1b'],
  ['Clay 700', '#a85a2a', 'Prices', '#fdf3ec'],
  ['Paper', '#f9f4ed', 'Cards, tab bar', '#272e1b'],
];

add('foundations/colors.html', 'Color tokens', `
<div class="panel" style="width:640px">
  <div class="sec">Foundations</div>
  <h1 class="hd" style="font-size:30px;margin-top:8px">Color tokens</h1>
  <p style="font-size:12.5px;line-height:1.6;color:var(--n700);margin:8px 0 18px;max-width:460px">
    Deep palm green carries the surfaces, outlined sage pills carry the data, and clay terracotta is
    reserved for the one primary action per screen.</p>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">
    ${SWATCHES.map(([n, hex, use, fg]) => `<div style="background:${hex};color:${fg};border-radius:var(--r-md);
      padding:14px 12px;height:96px;display:flex;flex-direction:column;justify-content:space-between;
      ${hex === '#f9f4ed' || hex === '#f0fae1' ? 'box-shadow:inset 0 0 0 1px rgba(39,46,27,.12);' : ''}">
      <div style="font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase">${n}</div>
      <div><div style="font-size:10.5px;font-weight:600;opacity:.75">${use}</div>
      <div style="font:600 10px ui-monospace,monospace;opacity:.6;margin-top:2px">${hex}</div></div></div>`).join('')}
  </div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:16px">
    ${[['Radius sm', '12px'], ['Radius md', '16px'], ['Radius lg', '28px'],
       ['Radius pill', '999px'], ['Shadow lg', '0 12/32 · 22%'], ['Outline', '1.5px Sage']]
      .map(([k, v]) => `<div class="spec" style="padding:10px 16px;gap:10px">
        <span style="font-size:11px;font-weight:700;white-space:nowrap">${k}</span>
        <span style="font:600 10px ui-monospace,monospace;color:var(--moss);white-space:nowrap">${v}</span></div>`).join('')}
  </div>
</div>`);

add('foundations/typography.html', 'Typography', `
<div class="panel" style="width:640px">
  <div class="sec">Foundations</div>
  <h1 class="hd" style="font-size:30px;margin-top:8px">Typography</h1>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-top:20px">
    <div>
      <div class="sec" style="color:var(--clay-700)">Caprasimo — display</div>
      <div class="hd" style="font-size:40px;margin-top:12px">lighthouse</div>
      <div class="hd" style="font-size:28px;margin-top:12px">Screen title · 28</div>
      <div class="hd" style="font-size:20px;margin-top:10px">Card title · 20</div>
      <div class="hd" style="font-size:17px;margin-top:10px">฿380 · price · 17</div>
      <p style="font-size:11.5px;line-height:1.6;color:var(--n700);margin-top:14px">
        Wordmark, screen titles, prices and big numbers only. Never body copy.</p>
    </div>
    <div>
      <div class="sec" style="color:var(--clay-700)">Figtree — interface</div>
      <div style="font-size:15px;font-weight:700;margin-top:12px">Row title · 15 / 700</div>
      <div style="font-size:13.5px;font-weight:600;margin-top:10px;color:var(--pine)">Body strong · 13.5 / 600</div>
      <div style="font-size:13px;margin-top:8px;color:var(--n700);line-height:1.65">
        Body copy · 13 / 400. A CBD-rich, gentler character with a floral aroma — the one our team most
        often suggests for those newer to cannabis.</div>
      <div style="font-size:11px;color:var(--fern);margin-top:10px">Caption · 11 / 400</div>
      <div class="kicker" style="margin-top:10px">KICKER · 10 / 800 · 2PX TRACK</div>
      <div class="legal" style="text-align:left;margin-top:10px">Legal · 10.5 / 400 — Adults 20+ · ID required</div>
    </div>
  </div>
</div>`);

add('foundations/logo.html', 'Logo & mark', `
<div class="panel" style="width:640px">
  <div class="sec">Foundations</div>
  <h1 class="hd" style="font-size:30px;margin-top:8px">Logo &amp; mark</h1>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:20px">
    <div style="background:var(--palm);border-radius:var(--r-lg);padding:34px;text-align:center;color:var(--mist)">
      ${mark(1.6)}
      <div class="hd" style="font-size:38px;margin-top:16px">lighthouse</div>
      <div style="font-size:9.5px;letter-spacing:5px;font-weight:800;color:var(--sage);margin-top:8px">
        CANNABIS SHOP · BAR · CAFÉ</div>
    </div>
    <div style="background:var(--leaf);border-radius:var(--r-lg);padding:34px;text-align:center;color:var(--palm)">
      ${mark(1.6)}
      <div class="hd" style="font-size:38px;margin-top:16px">lighthouse</div>
      <div style="font-size:9.5px;letter-spacing:5px;font-weight:800;color:var(--fern);margin-top:8px">
        เกาะสมุย · KOH SAMUI</div>
    </div>
  </div>
  <div style="display:flex;gap:14px;margin-top:14px;align-items:center">
    <div style="width:96px;height:96px;border-radius:22px;background:var(--palm);color:var(--mist);
      display:flex;align-items:center;justify-content:center;flex:none">${mark(1)}</div>
    <div style="width:96px;height:96px;border-radius:22px;background:var(--clay);color:var(--clay-100);
      display:flex;align-items:center;justify-content:center;flex:none">${mark(1)}</div>
    <div style="width:96px;height:96px;border-radius:50%;background:var(--shore);color:var(--palm);
      display:flex;align-items:center;justify-content:center;flex:none;box-shadow:inset 0 0 0 1px rgba(39,46,27,.14)">${mark(1)}</div>
    <p style="font-size:11.5px;line-height:1.6;color:var(--n700);margin:0">
      App icon, alternate clay icon, and the round in-app badge used on the age gate.
      Clear space around the mark is one tower-width on every side; never re-colour the
      mark outside Palm, Mist, Shore or Clay&nbsp;100.</p>
  </div>
</div>`);

/* ─────────────────────────── COMPONENTS ─────────────────────────── */

add('components/buttons.html', 'Buttons & CTAs', `
<div class="panel" style="width:560px">
  <div class="sec">Components</div>
  <h1 class="hd" style="font-size:26px;margin-top:8px">Buttons &amp; CTAs</h1>
  <p style="font-size:12px;line-height:1.6;color:var(--n700);margin:8px 0 18px">
    One clay primary per screen. Everything else is solid mist (on palm) or an outlined ghost.</p>
  <div class="stack">
    <div><div class="sec" style="margin-bottom:6px">Primary — clay</div>
      <div class="btn primary">Add to bag — ฿380 / g</div></div>
    <div><div class="sec" style="margin-bottom:6px">Solid — on palm surfaces</div>
      <div style="background:var(--palm);border-radius:var(--r-lg);padding:16px">
        <div class="btn solid">Yes, I'm 20 or older</div>
        <div class="btn ghost on-dark" style="margin-top:10px">Not yet</div></div></div>
    <div><div class="sec" style="margin-bottom:6px">Ghost — outlined</div>
      <div class="btn ghost">New to cannabis? Start here →</div></div>
    <div><div class="sec" style="margin-bottom:6px">Inline &amp; icon</div>
      <div class="g" style="align-items:center">
        <span class="btn sm" style="background:var(--clay-500);color:var(--palm)">Order for pickup →</span>
        <span class="btn sm solid" style="background:var(--leaf)">Visit →</span>
        <span class="plus">+</span><span class="step">−</span><span class="step">+</span></div></div>
  </div>
</div>`);

add('components/pills.html', 'Pills & filter chips', `
<div class="panel" style="width:560px">
  <div class="sec">Components</div>
  <h1 class="hd" style="font-size:26px;margin-top:8px">Pills &amp; filter chips</h1>
  <div class="stack" style="margin-top:16px">
    <div><div class="sec" style="margin-bottom:8px">Category — menu sections</div>
      <div class="g"><span class="pill on">Flower</span><span class="pill">Bar</span>
        <span class="pill">Tea</span><span class="pill">Devices</span></div></div>
    <div><div class="sec" style="margin-bottom:8px">Filter — cultivar character</div>
      <div class="g"><span class="pill on">All</span><span class="pill">Daytime</span>
        <span class="pill">Evening</span><span class="pill">Balanced</span><span class="pill">CBD</span></div></div>
    <div><div class="sec" style="margin-bottom:8px">Tag — read-only attributes</div>
      <div class="g"><span class="pill tag">Balanced</span><span class="pill tag">Steady</span>
        <span class="pill tag">Pine</span></div></div>
    <div><div class="sec" style="margin-bottom:8px">Emphasis</div>
      <div class="g"><span class="pill leaf">Cocktails ฿199 · Chinese tea →</span>
        <span class="pill clay">Adults 20+</span></div></div>
    <div><div class="sec" style="margin-bottom:8px">Spec row — outlined pill with value</div>
      <div class="spec"><span style="font-size:13px;font-weight:600">Free pre-roll</span>
        <span style="font-size:13px;font-weight:700;color:var(--fern)">500 pts</span></div></div>
  </div>
</div>`);

add('components/cards.html', 'Cards', `
<div class="panel" style="width:560px">
  <div class="sec">Components</div>
  <h1 class="hd" style="font-size:26px;margin-top:8px">Cards</h1>
  <div class="stack" style="margin-top:16px">
    <div class="card dark">
      <div class="kicker on-dark">HOUSE CULTIVAR</div>
      <div class="hd" style="font-size:30px;margin-top:6px">Lighthouse OG</div>
      <div style="font-size:12.5px;margin-top:6px;color:var(--leaf)">Balanced · Steady · Pine</div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px">
        <div class="hd" style="font-size:20px">฿380 / g</div>
        <span class="btn sm" style="background:var(--clay-500);color:var(--palm)">Order for pickup →</span></div>
    </div>
    <div class="card" style="display:flex;justify-content:space-between;align-items:center">
      <div><div style="font-weight:700;font-size:14px">Lighthouse · Chaweng</div>
        <div style="font-size:12px;color:var(--fern);margin-top:2px">● Open now · 10:00 – 02:00 · Coffee · Bar · Consoles</div></div>
      <div style="font-size:13px;color:var(--fern);font-weight:700">Visit →</div>
    </div>
    <div class="card">
      <div class="kicker">GUIDE 02</div>
      <div class="hd" style="font-size:20px;margin-top:6px">Daytime vs evening</div>
      <div style="font-size:12.5px;line-height:1.6;margin-top:6px;color:var(--n800)">
        How we group our cultivars by character — bright and sociable, settling and restful,
        or balanced in between.</div>
    </div>
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:baseline">
        <div class="hd" style="font-size:18px">Da Hong Pao</div>
        <div style="font-size:13px;font-weight:700;color:var(--clay-700)">฿150 · 700 ml</div></div>
      <div style="font-size:12px;color:var(--n800);margin-top:6px"><b style="color:var(--fern)">Taste:</b> Roasted, floral, spicy</div>
      <div style="font-size:12px;color:var(--n800);margin-top:2px"><b style="color:var(--fern)">Effect:</b> Uplifting, warming, grounding</div>
    </div>
  </div>
</div>`);

add('components/rows.html', 'List rows', `
<div class="panel" style="width:560px">
  <div class="sec">Components</div>
  <h1 class="hd" style="font-size:26px;margin-top:8px">List rows</h1>
  <div class="stack" style="margin-top:16px">
    <div><div class="sec" style="margin-bottom:8px">Cultivar row — tap to open, + to add</div>
      <div class="row"><div class="photo" style="width:60px;height:60px;border-radius:12px;flex:none">photo</div>
        <div style="flex:1;min-width:0"><div style="font-weight:700;font-size:15px">Calm Waters</div>
          <div style="font-size:11px;color:var(--fern);margin-top:2px">CBD-rich · Floral · Gentle · Clear</div>
          <div style="font-size:13px;font-weight:700;color:var(--clay-700);margin-top:4px">฿320 / g</div></div>
        <div class="plus">+</div></div></div>
    <div><div class="sec" style="margin-bottom:8px">Bag row — quantity stepper</div>
      <div class="row" style="padding:14px 16px">
        <div style="flex:1"><div style="font-weight:700;font-size:14px">Lighthouse OG</div>
          <div style="font-size:11px;color:var(--fern)">฿380 / g</div></div>
        <div style="display:flex;align-items:center;gap:12px">
          <div class="step">−</div><div style="font-weight:700;width:28px;text-align:center">2 g</div>
          <div class="step">+</div></div></div></div>
    <div><div class="sec" style="margin-bottom:8px">Bar / device row — name + price</div>
      <div class="spec"><span style="font-size:13px;font-weight:600">Mojito Madness</span>
        <span class="hd" style="font-size:17px">฿199</span></div>
      <div class="row" style="margin-top:8px"><div class="photo" style="width:52px;height:52px;border-radius:12px;flex:none">photo</div>
        <div style="flex:1;font-weight:700;font-size:14px">Straight-tube glass bong</div>
        <div class="hd" style="font-size:17px">฿1799</div></div></div>
    <div><div class="sec" style="margin-bottom:8px">Settings row</div>
      <div class="row" style="justify-content:space-between;padding:14px 18px">
        <span style="font-size:13px;font-weight:600">Store info &amp; hours</span><span>→</span></div></div>
  </div>
</div>`);

add('components/tab-bar.html', 'Tab bar', `
<div class="panel" style="width:520px">
  <div class="sec">Components</div>
  <h1 class="hd" style="font-size:26px;margin-top:8px">Tab bar</h1>
  <p style="font-size:12px;line-height:1.6;color:var(--n700);margin:8px 0 16px">
    Five destinations, always visible after the age gate. The bag carries a clay badge with the
    total gram count; Menu stays active while a strain detail is open.</p>
  <div class="stack">
    <div style="border-radius:var(--r-md);overflow:hidden;border:1px solid rgba(39,46,27,.1)">${tabs('Home')}</div>
    <div style="border-radius:var(--r-md);overflow:hidden;border:1px solid rgba(39,46,27,.1)">${tabs('Menu', 3)}</div>
    <div style="border-radius:var(--r-md);overflow:hidden;border:1px solid rgba(39,46,27,.1)">${tabs('Profile')}</div>
  </div>
</div>`);

/* ─────────────────────────── SCREENS ─────────────────────────── */

add('screens/age-gate.html', 'Age gate', labelled('Age gate — first launch, EN / ไทย', phone({
  dark: true,
  inner: `<div class="body" style="display:flex;flex-direction:column;justify-content:center;text-align:center;padding:0 30px">
    <div style="width:96px;height:96px;border-radius:50%;background:var(--mist);color:var(--palm);
      margin:0 auto;display:flex;align-items:center;justify-content:center">${mark(.9)}</div>
    <div class="hd" style="font-size:32px;color:var(--mist);margin-top:20px">Welcome to<br>lighthouse</div>
    <div style="font-size:9.5px;letter-spacing:4px;color:var(--sage);font-weight:800;margin-top:10px">
      CANNABIS SHOP · BAR · CAFÉ · SAMUI</div>
    <div style="font-size:13.5px;color:var(--leaf);margin-top:22px;line-height:1.6">
      This app is for adults 20 and older.<br>Are you 20+?</div>
    <div class="btn solid" style="margin-top:22px">Yes, I'm 20 or older</div>
    <div class="btn ghost on-dark" style="margin-top:10px">Not yet</div>
    <div class="g" style="justify-content:center;margin-top:18px">
      <span class="pill" style="border-color:var(--fern);background:var(--mist);color:var(--palm);font-weight:700">EN</span>
      <span class="pill" style="border-color:var(--fern);color:var(--sage);font-weight:700">ไทย</span></div>
    <div style="font-size:10.5px;color:var(--moss);margin-top:20px;line-height:1.6">
      Guidance &amp; consultation in-store · Chaweng, Ko Samui</div>
  </div>`,
})));

add('screens/home.html', 'Home', labelled('Home — loyalty, house cultivar, filters, venue', phone({
  tab: 'Home',
  inner: `<div class="body">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div><div class="kicker">SAWASDEE ☀</div>
        <div class="hd" style="font-size:28px;margin-top:2px">lighthouse</div></div>
      <div style="width:40px;height:40px;border-radius:50%;background:var(--n700);color:var(--clay-100);
        display:flex;align-items:center;justify-content:center;font-weight:700">A</div></div>
    <div class="spec mt14"><span style="font-size:13px;font-weight:600">✦ 320 pts · Gold member</span>
      <span style="font-size:12px;font-weight:700;color:var(--fern)">Rewards →</span></div>
    <div class="card dark mt14">
      <div class="kicker on-dark">HOUSE CULTIVAR</div>
      <div class="hd" style="font-size:30px;margin-top:6px">Lighthouse OG</div>
      <div style="font-size:12.5px;margin-top:6px;color:var(--leaf)">Balanced · Steady · Pine</div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px">
        <div class="hd" style="font-size:20px">฿380 / g</div>
        <span class="btn sm" style="background:var(--clay-500);color:var(--palm)">Order for pickup →</span></div></div>
    <div class="g mt14"><span class="pill on">All</span><span class="pill">Daytime</span>
      <span class="pill">Evening</span><span class="pill">Balanced</span><span class="pill">CBD</span></div>
    <div class="card mt14" style="display:flex;justify-content:space-between;align-items:center">
      <div><div style="font-weight:700;font-size:14px">Lighthouse · Chaweng</div>
        <div style="font-size:11.5px;color:var(--fern);margin-top:2px">● Open now · 10:00 – 02:00 · Coffee · Bar · Consoles</div></div>
      <div style="font-size:13px;color:var(--fern);font-weight:700;white-space:nowrap">Visit →</div></div>
    <div class="pill leaf mt10" style="width:100%;justify-content:center;padding:13px 20px;font-weight:700;font-size:13px">
      Cocktails ฿199 · Chinese tea · Devices →</div>
    <div class="btn ghost mt10" style="padding:13px 20px;font-size:13px">New to cannabis? Start here →</div>
  </div>`,
})));

const STRAINS = [
  ['Lighthouse OG', 'Balanced · House', 'Balanced · Steady · Pine', 380],
  ['Golden Light', 'Daytime', 'Citrus · Uplifting · Light', 350],
  ['Mango Tide', 'Daytime', 'Fruity · Bright · Fresh', 350],
  ['Night Harbour', 'Evening', 'Earthy · Settling · Rich', 380],
  ['Storm Shelter', 'Evening · Full', 'Full-bodied · Kush · Deep', 420],
];

add('screens/menu-flower.html', 'Menu — Flower', labelled('Menu · Flower — categories, filters, cultivars', phone({
  tab: 'Menu',
  inner: `<div class="body">
    <div class="hd" style="font-size:28px">Menu</div>
    <div class="g mt14"><span class="pill on">Flower</span><span class="pill">Bar</span>
      <span class="pill">Tea</span><span class="pill">Devices</span></div>
    <div class="g mt10"><span class="pill on">All</span><span class="pill">Daytime</span>
      <span class="pill">Evening</span><span class="pill">Balanced</span><span class="pill">CBD</span></div>
    <div class="stack mt14" style="gap:10px">
      ${STRAINS.map(([n, t, tags, p]) => `<div class="row">
        <div class="photo" style="width:60px;height:60px;border-radius:12px;flex:none">photo</div>
        <div style="flex:1;min-width:0"><div style="font-weight:700;font-size:15px">${n}</div>
          <div style="font-size:11px;color:var(--fern);margin-top:2px">${t} · ${tags}</div>
          <div style="font-size:13px;font-weight:700;color:var(--clay-700);margin-top:4px">฿${p} / g</div></div>
        <div class="plus">+</div></div>`).join('')}
    </div>
  </div>`,
})));

const barGroup = (title, rows) => `<div class="mt14">
  <div class="hd" style="font-size:19px">${title}</div>
  <div class="stack mt10" style="gap:8px">
    ${rows.map(([n, p]) => `<div class="spec"><span style="font-size:13px;font-weight:600">${n}</span>
      <span class="hd" style="font-size:17px">฿${p}</span></div>`).join('')}</div></div>`;

add('screens/menu-bar.html', 'Menu — Bar', labelled('Menu · Bar — cocktails and beer (shots follow below the fold)', phone({
  tab: 'Menu',
  inner: `<div class="body">
    <div class="hd" style="font-size:28px">Menu</div>
    <div class="g mt14"><span class="pill">Flower</span><span class="pill on">Bar</span>
      <span class="pill">Tea</span><span class="pill">Devices</span></div>
    <div style="font-size:11.5px;color:var(--fern);font-weight:600;margin-top:12px">
      Served at the bar · Happy hour daily</div>
    ${barGroup('Signature cocktails', [['Mojito Madness', 199], ['Find Me in the Dark', 199],
      ['Green Dream', 199], ['Berry Bliss Martini', 199], ['Lift &amp; Laughs', 199]])}
    ${barGroup('Beer', [['Singha', 95], ['Leo', 95], ['Chang', 95], ['Corona', 115]])}
  </div>`,
})));

add('screens/menu-tea.html', 'Menu — Tea', labelled('Menu · Tea — Chinese tea, 700 ml pots', phone({
  tab: 'Menu',
  inner: `<div class="body">
    <div class="hd" style="font-size:28px">Menu</div>
    <div class="g mt14"><span class="pill">Flower</span><span class="pill">Bar</span>
      <span class="pill on">Tea</span><span class="pill">Devices</span></div>
    <div style="font-size:11.5px;color:var(--fern);font-weight:600;margin-top:12px">
      Chinese tea · 700 ml pots</div>
    <div class="stack mt10" style="gap:10px">
      ${[["Shu Pu'er", 'Earthy, nutty, deep', 'Relaxes body and mind'],
         ["Sheng Pu'er", 'Herbal, tangy, mineral', 'Energizing, sharpens focus'],
         ['Da Hong Pao', 'Roasted, floral, spicy', 'Uplifting, warming, grounding'],
         ['Tie Guan Yin', 'Creamy, floral, fresh', 'Refreshing, mood-lifting']]
        .map(([n, taste, effect]) => `<div class="card" style="padding:16px 18px">
          <div style="display:flex;justify-content:space-between;align-items:baseline">
            <div class="hd" style="font-size:18px">${n}</div>
            <div style="font-size:13px;font-weight:700;color:var(--clay-700)">฿150 · 700 ml</div></div>
          <div style="font-size:12px;color:var(--n800);margin-top:6px"><b style="color:var(--fern)">Taste:</b> ${taste}</div>
          <div style="font-size:12px;color:var(--n800);margin-top:2px"><b style="color:var(--fern)">Effect:</b> ${effect}</div>
        </div>`).join('')}
    </div>
  </div>`,
})));

add('screens/menu-devices.html', 'Menu — Devices', labelled('Menu · Devices — glass and grinders', phone({
  tab: 'Menu',
  inner: `<div class="body">
    <div class="hd" style="font-size:28px">Menu</div>
    <div class="g mt14"><span class="pill">Flower</span><span class="pill">Bar</span>
      <span class="pill">Tea</span><span class="pill on">Devices</span></div>
    <div class="stack mt14" style="gap:10px">
      ${[['Straight-tube glass bong', 1799], ['Glow percolator bong', 1499], ['Mini dab rig + banger', 999],
         ['Silicone unicorn pipe', 750], ['Rainbow herb grinder', 499], ['Classic herb grinder', 399]]
        .map(([n, p]) => `<div class="row">
          <div class="photo" style="width:52px;height:52px;border-radius:12px;flex:none">photo</div>
          <div style="flex:1;font-weight:700;font-size:14px">${n}</div>
          <div class="hd" style="font-size:17px">฿${p}</div></div>`).join('')}
    </div>
  </div>`,
})));

add('screens/strain-detail.html', 'Strain detail', labelled('Strain detail — the one clay action', phone({
  tab: 'Menu',
  inner: `<div class="body">
    <div style="font-size:13px;font-weight:700;color:var(--fern)">← Cultivars</div>
    <div class="photo mt14" style="height:170px;border-radius:var(--r-lg);font-size:10px">strain photo</div>
    <div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:16px">
      <div class="hd" style="font-size:30px">Lighthouse OG</div>
      <div class="hd" style="font-size:20px;color:var(--clay-700)">฿380 / g</div></div>
    <div style="font-size:12px;font-weight:700;letter-spacing:1px;color:var(--fern);margin-top:4px">
      BALANCED · HOUSE · BALANCED PROFILE</div>
    <div class="g mt10"><span class="pill tag">Balanced</span><span class="pill tag">Steady</span>
      <span class="pill tag">Pine</span></div>
    <div style="font-size:13.5px;line-height:1.65;color:var(--n800);margin-top:14px">
      Our signature house cultivar. Balanced and reliable — the character we named the beacon after.
      Pine-forward with soft herbal notes.</div>
    <div class="btn primary mt18">Add to bag — ฿380 / g</div>
    <div class="legal">In-store pickup only · Adults 20+ · ID required</div>
  </div>`,
})));

add('screens/bag.html', 'Bag', `${labelled('Bag — pickup order, pay in-store', phone({
  tab: 'Bag', badge: 3,
  inner: `<div class="body">
    <div class="hd" style="font-size:28px">Pickup bag</div>
    <div class="stack mt14" style="gap:10px">
      ${[['Lighthouse OG', '฿380 / g', '2 g'], ['Calm Waters', '฿320 / g', '1 g']]
        .map(([n, p, q]) => `<div class="row" style="padding:14px 16px">
          <div style="flex:1"><div style="font-weight:700;font-size:14px">${n}</div>
            <div style="font-size:11px;color:var(--fern)">${p}</div></div>
          <div style="display:flex;align-items:center;gap:12px">
            <div class="step">−</div><div style="font-weight:700;width:28px;text-align:center">${q}</div>
            <div class="step">+</div></div></div>`).join('')}
    </div>
    <div class="spec mt14" style="padding:14px 22px">
      <span style="font-size:13px;font-weight:600">Total (pay in-store):</span>
      <span class="hd" style="font-size:22px">฿1080</span></div>
    <div class="btn primary mt14">Place pickup order</div>
    <div class="legal">Pickup at Lighthouse, Chaweng · Adults 20+ · ID required</div>
  </div>`,
}))}
${labelled('Bag — order placed, show at the counter', phone({
  tab: 'Bag',
  inner: `<div class="body">
    <div class="hd" style="font-size:28px">Pickup bag</div>
    <div class="card dark mt14" style="padding:28px 22px;text-align:center">
      <div style="width:52px;height:52px;border-radius:50%;background:var(--leaf);color:var(--palm);
        display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:800;margin:0 auto">✓</div>
      <div class="hd" style="font-size:24px;margin-top:14px">Order in!</div>
      <div style="font-size:13px;margin-top:8px;color:var(--leaf)">Show this at the counter with your ID.</div>
      <div style="display:inline-block;border:1.5px solid var(--sage);border-radius:var(--r-pill);
        padding:10px 22px;font-weight:700;font-size:16px;letter-spacing:2px;margin-top:14px">LH-2049</div>
      <div style="font-size:12px;color:var(--sage);margin-top:12px">Start a new bag</div></div>
    <div class="legal">Held for 2 hours · Adults 20+ · ID required</div>
  </div>`,
}))}`);

add('screens/learn.html', 'Learn', labelled('Learn — guidance, no hype', phone({
  tab: 'Learn',
  inner: `<div class="body">
    <div class="hd" style="font-size:28px">Learn</div>
    <div style="font-size:13px;color:var(--fern);margin-top:6px;line-height:1.6">
      Short guides from our team — no hype, just guidance.</div>
    <div class="stack mt14" style="gap:10px">
      <div class="card dark" style="padding:20px">
        <div class="kicker on-dark">START HERE</div>
        <div class="hd" style="font-size:20px;margin-top:6px">New to cannabis?</div>
        <div style="font-size:12.5px;line-height:1.6;margin-top:6px;color:var(--leaf)">
          Start low, go slow. What to expect on a first visit, and why our team asks the questions they ask.</div></div>
      <div class="card" style="padding:20px">
        <div class="kicker">GUIDE 02</div>
        <div class="hd" style="font-size:20px;margin-top:6px">Daytime vs evening</div>
        <div style="font-size:12.5px;line-height:1.6;margin-top:6px;color:var(--n800)">
          How we group our cultivars by character — bright and sociable, settling and restful, or balanced in between.</div></div>
      <div class="card" style="padding:20px">
        <div class="kicker">GUIDE 03</div>
        <div class="hd" style="font-size:20px;margin-top:6px">Reading a label</div>
        <div style="font-size:12.5px;line-height:1.6;margin-top:6px;color:var(--n800)">
          THC-forward, CBD-rich, terpenes — what the words on our shelf cards actually mean for how it feels.</div></div>
      <div class="btn ghost" style="padding:13px 20px;font-size:13px">Prefer to talk? Visit us →</div>
    </div>
  </div>`,
})));

add('screens/profile.html', 'Profile & loyalty', labelled('Profile — Lighthouse Club, rewards, language', phone({
  tab: 'Profile',
  inner: `<div class="body">
    <div style="display:flex;align-items:center;gap:14px">
      <div style="width:52px;height:52px;border-radius:50%;background:var(--clay);color:var(--clay-100);
        display:flex;align-items:center;justify-content:center;font-weight:800;font-size:20px">A</div>
      <div><div class="hd" style="font-size:22px">Alex Rivera</div>
        <div style="font-size:12px;color:var(--fern)">Member since Jan 2026</div></div></div>
    <div class="card dark mt14" style="padding:22px">
      <div class="kicker on-dark">LIGHTHOUSE CLUB · GOLD</div>
      <div class="hd" style="font-size:40px;margin-top:6px">320 <span style="font-size:16px">pts</span></div>
      <div style="height:8px;border-radius:var(--r-pill);background:var(--pine);margin-top:14px;overflow:hidden">
        <div style="height:100%;width:64%;border-radius:var(--r-pill);background:var(--leaf)"></div></div>
      <div style="font-size:12px;margin-top:8px;color:var(--leaf)">180 pts to your next reward</div></div>
    <div class="stack mt14" style="gap:8px">
      ${[['Free pre-roll', '500 pts'], ['10% off a visit', '750 pts'], ['House tote + lighter', '1000 pts']]
        .map(([n, p]) => `<div class="spec" style="padding:12px 20px">
          <span style="font-size:13px;font-weight:600">${n}</span>
          <span style="font-size:13px;font-weight:700;color:var(--fern)">${p}</span></div>`).join('')}
    </div>
    <div class="stack mt14" style="gap:8px">
      ${[['Store info &amp; hours', '→'], ['Order history', '→'], ['Language', '<b>EN</b> · ไทย']]
        .map(([n, v]) => `<div class="row" style="justify-content:space-between;padding:14px 18px">
          <span style="font-size:13px;font-weight:600">${n}</span><span style="font-size:13px">${v}</span></div>`).join('')}
    </div>
  </div>`,
})));

add('screens/locator.html', 'Store locator', labelled('Store locator — find us, maps, call', phone({
  tab: 'Home',
  inner: `<div class="body">
    <div style="font-size:13px;font-weight:700;color:var(--fern)">← Back</div>
    <div class="hd" style="font-size:28px;margin-top:10px">Find us</div>
    <div class="photo mt14" style="height:150px;border-radius:var(--r-lg);font-size:10px">map — Chaweng, Ko Samui</div>
    <div class="card mt14">
      <div style="font-weight:700;font-size:15px">Lighthouse Samui</div>
      <div style="font-size:12.5px;color:var(--n800);margin-top:4px;line-height:1.6">
        Chaweng, Ko Samui · Surat Thani<br>Cannabis shop · Coffee · Bar · Game consoles</div>
      <div style="font-size:12.5px;color:var(--fern);font-weight:700;margin-top:8px">● Open now · Daily 10:00 – 02:00</div></div>
    <div style="display:flex;gap:10px;margin-top:12px">
      <div class="btn primary" style="flex:1;padding:13px;font-size:13px">Open in Maps</div>
      <div class="btn ghost" style="flex:1;padding:13px;font-size:13px">Call 098 886 2998</div></div>
    <div class="legal">Adults 20+ · Consultation and guidance in-store</div>
  </div>`,
})));

/* ─────────────────────────── BRAND ─────────────────────────── */

add('brand/qr-poster.html', 'QR table poster', `
<div class="stack">
  <div style="width:540px;height:675px;background:var(--palm);border-radius:var(--r-md);
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    padding:44px 40px;text-align:center;color:var(--mist);box-shadow:var(--shadow-lg)">
    <div style="color:var(--leaf)">${mark(.9)}</div>
    <div class="hd" style="font-size:46px;margin-top:14px;color:var(--shore)">lighthouse</div>
    <div style="font-size:9px;letter-spacing:4px;font-weight:800;color:var(--sage);margin-top:8px">
      CANNABIS SHOP · BAR · CAFÉ — ร้านกัญชา · บาร์ · คาเฟ่ · เกาะสมุย</div>
    <div class="hd" style="font-size:26px;margin-top:26px;color:var(--shore)">Scan for our menu</div>
    <div style="font-size:17px;font-weight:700;color:var(--clay-500);margin-top:4px">สแกนเพื่อดูเมนู</div>
    <div style="width:236px;height:236px;background:#fff;border-radius:24px;margin-top:22px;
      display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;
      border:3px dashed rgba(39,46,27,.28);color:var(--moss)">
      <div style="font-size:34px;line-height:1">▣</div>
      <div style="font:700 11px var(--f-body);letter-spacing:.5px">DROP QR PNG HERE</div>
      <div style="font:600 9.5px ui-monospace,monospace;max-width:180px;line-height:1.4">
        menu.lighthousekohsamui.com</div></div>
    <div style="font-size:15px;font-weight:800;margin-top:18px;color:var(--shore)">menu.lighthousekohsamui.com</div>
    <div class="g" style="justify-content:center;margin-top:16px">
      <span class="pill clay">Adults 20+ · ผู้ใหญ่ 20+</span>
      <span class="pill" style="border-color:var(--fern);color:var(--leaf)">Informational · ข้อมูลเท่านั้น</span></div>
  </div>
  <div class="cap">4:5 table card — placeholder QR box; drop in the generated QR PNG before print</div>
</div>`);

/* ─────────────────────────── EMIT ─────────────────────────── */

let n = 0;
for (const [path, html] of Object.entries(files)) {
  const full = join(OUT, path);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, html, 'utf8');
  n++;
}
console.log(`wrote ${n} files to ${OUT}`);
console.log(Object.keys(files).join('\n'));
