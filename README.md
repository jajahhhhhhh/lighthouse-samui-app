# Lighthouse Samui

Customer menu app for **Lighthouse Samui** — a cannabis shop, bar and café in
Chaweng, Ko Samui — together with the design system it's built from and the
scripts that render both.

**Live:** <https://jajahhhhhhh.github.io/lighthouse-samui-app/> ·
design system at [`/design/`](https://jajahhhhhhh.github.io/lighthouse-samui-app/design/screens/home.html)

The app is a single self-contained HTML page. No framework, no bundler, no
`package.json`, no dependencies. It runs from a `file://` path, from any static
host, or embedded anywhere a single file can go.

```bash
node dev-server.mjs      # build, serve on :4173, rebuild + reload on save
```

Then open <http://localhost:4173/app/lighthouse-menu.html>.

---

## What's here

| Path | |
|---|---|
| `app/app.src.html` | The app — markup, styles and logic in one source file |
| `app/fonts.css` | Caprasimo, Figtree and Noto Sans Thai as base64 woff2 |
| `app/build-app.mjs` | Inlines the fonts → `app/lighthouse-menu.html` |
| `build.mjs` | Renders the design-system preview cards → `dist/` |
| `canvas/book.py` | Renders the *Negotiated Distance* plates (matplotlib) |
| `dev-server.mjs` | Static server + rebuild on save + live reload |
| `watch.mjs` | The same rebuild loop as a CLI, for one-shot and pipeline use |
| `build-tasks.mjs` | Shared task list and build runner |

Everything under `dist/`, `app/lighthouse-menu.html` and the rendered plates is
generated and gitignored. Rebuild it all with:

```bash
node watch.mjs --once --plates
```

## The app

Eight screens, in English and ไทย, switchable from the age gate or the profile
and remembered between visits:

- **Age gate** — 20+ confirmation, required before anything else is reachable
- **Home** — loyalty balance, house cultivar, character filters, venue card
- **Menu** — flower, bar, tea and devices, with filters by character
- **Strain detail** — aroma tags, description, one primary action
- **Bag** — quantity steppers, running total, pickup order with a counter code
- **Learn** — short guides written by the shop team
- **Profile** — Lighthouse Club balance and rewards
- **Locator** — hours, Maps and phone links

It is a **pickup reservation, not a checkout**. There is no payment path
anywhere in the app: totals read *pay in-store*, and every route to product
carries `Adults 20+ · ID required`.

## Design system

`build.mjs` emits 20 standalone preview cards under `dist/` — foundations
(colour, type, logo), components (buttons, pills, cards, rows, tab bar) and all
eight screens, plus the QR table poster. Each card is a self-contained page with
a CSS device frame and no JavaScript, so they render anywhere and can be pushed
straight to a design-system tool.

Palette and type are shared with the app: Shore ground, Palm surfaces, Fern and
Moss for text, Clay reserved for the single primary action on any screen.
Caprasimo for display, Figtree for interface, Noto Sans Thai for Thai.

## Why the fonts are committed

`app/fonts.css` carries the three faces as base64 woff2 (88 KB) instead of
linking a font CDN. Two reasons:

1. The app is published to environments whose CSP blocks external font hosts. A
   linked stylesheet fails *silently* — the page still renders, but in a system
   serif, and the wordmark is gone.
2. Figtree has no Thai coverage. Noto Sans Thai is what keeps ไทย from rendering
   as tofu.

Committing them also means the build never touches the network, so a fresh
clone builds byte-identically offline.

## Dev loop

`dev-server.mjs` serves the project, watches the sources, rebuilds on save and
pushes a reload to every open tab over server-sent events.

The reload client is injected into HTML **as it is served** and is never written
to disk, so `app/lighthouse-menu.html` stays clean and publishable. Options:

```bash
node dev-server.mjs --port 8080   # serve elsewhere
node dev-server.mjs --plates      # also re-render the canvas plates on save
node watch.mjs --once             # build everything and exit
```

It is a full page reload, not hot module replacement — state resets on rebuild.

## Deploying

The app is one file with no runtime dependencies, so deployment is a copy:

```bash
node watch.mjs --once
# then serve app/lighthouse-menu.html from any static host
```

## Licence

The project is [MIT licensed](LICENSE).

The three typefaces embedded in `app/fonts.css` are **not** — Caprasimo,
Figtree and Noto Sans Thai are each under the SIL Open Font License 1.1, whose
terms and copyright notices are reproduced in
[`app/FONTS-LICENSE.txt`](app/FONTS-LICENSE.txt). The OFL permits embedding and
redistribution; it also requires that notice to travel with the fonts, which is
why it ships in the repo. If you reuse this code, keep that file with it.

## Notes

- Product photography is a placeholder pattern throughout; no images ship here.
- The loyalty account is a fixture for demonstrating the screen. There is no
  authentication and no backend.
