#!/usr/bin/env python3
"""NEGOTIATED DISTANCE — Plates XI, XII, XIII.

XI   the pair    — two origins, one admitted region
XII  the many    — a lattice of origins, each agreeing only with its neighbour
XIII the limit   — the region narrowing as the origins part, until nothing crosses
"""
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Circle, Rectangle, Polygon
from matplotlib.backends.backend_pdf import PdfPages
import matplotlib.font_manager as fm
from pathlib import Path

FDIR = Path("/Users/sujittacharoenpong/Library/Application Support/Claude/"
            "local-agent-mode-sessions/skills-plugin/875ef09b-38d5-4973-9717-4ef0cd15671d/"
            "3eaa10b8-e5cd-4994-a0d4-b368bbf3a0ff/skills/canvas-design/canvas-fonts")
DISPLAY = fm.FontProperties(fname=str(FDIR / "Italiana-Regular.ttf"))
LABEL   = fm.FontProperties(fname=str(FDIR / "Jura-Light.ttf"))
DATA    = fm.FontProperties(fname=str(FDIR / "GeistMono-Regular.ttf"))

PALETTES = {
    # the portfolio's own ground: aged bone, two graphites, oxide
    "bone": dict(PAPER="#E6E1D5", PLATE="#EAE5DA", INK_A="#22261F", INK_B="#4C5A54",
                 ACCENT="#A9451F", ACC_F="#A9451F", GREY="#8C8A7E", TEXT="#1E221C"),
    # Lighthouse Samui: Shore ground, Palm and Moss as the two ranges,
    # Clay held back for the boundary and the exceptions
    # Palm and Fern are one step apart — the two ranges separate only where
    # they cross. Moss carries the apparatus a step behind both.
    "lighthouse": dict(PAPER="#F0FAE1", PLATE="#E7F2D4", INK_A="#272E1B", INK_B="#4F5C3A",
                       ACCENT="#A85A2A", ACC_F="#C67139", GREY="#6B7A52", TEXT="#272E1B"),
}
PAPER = PLATE = INK_A = INK_B = ACCENT = ACC_F = GREY = TEXT = None


def set_palette(name):
    global PAPER, PLATE, INK_A, INK_B, ACCENT, ACC_F, GREY, TEXT
    p = PALETTES[name]
    PAPER, PLATE = p["PAPER"], p["PLATE"]
    INK_A, INK_B = p["INK_A"], p["INK_B"]
    ACCENT, ACC_F = p["ACCENT"], p["ACC_F"]
    GREY, TEXT = p["GREY"], p["TEXT"]


set_palette("bone")

W, H = 9.0, 13.5
CL, CR = 0.85, 8.15
PX0, PX1, PY0, PY1 = 0.85, 8.15, 4.20, 11.95
CXP = (PX0 + PX1) / 2
CYP = (PY0 + PY1) / 2
DR = (2.85 - 0.22) / 30          # the interval. every plate is measured in it.
ROM = {n: r for n, r in enumerate(
    ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X",
     "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX"])}

OUT = Path(__file__).parent
MM = 1 / 25.4                    # mm → inches


# ── sheets ─────────────────────────────────────────────────────────────
# The composition is 2:3; A2 is 1:root-2. They do not match, so the plate is
# not stretched onto the sheet — it is enlarged uniformly and centred, with
# an equal border on all four sides. K scales points (type, hairlines) by the
# same factor as the geometry, so an A2 sheet is a true enlargement.
def _sheet(trim_w_mm, trim_h_mm, bleed_mm=0.0, surround_mm=0.0, float_=False,
           optical=None):
    """optical: ratio of bottom margin to top. A block centred by measurement
    reads as sinking on the sheet; raising it so the bottom margin is the
    deeper one is what the eye accepts as centred."""
    k = min(trim_w_mm * MM / W, trim_h_mm * MM / H)
    # equal border: solve trim_w - W*k = trim_h - H*k
    k = (trim_w_mm - trim_h_mm) * MM / (W - H) if W != H else k
    art_w, art_h = W * k, H * k
    fig_w = trim_w_mm * MM + 2 * (bleed_mm + surround_mm) * MM
    fig_h = trim_h_mm * MM + 2 * (bleed_mm + surround_mm) * MM
    tot_v = trim_h_mm - art_h / MM                     # vertical margin, mm
    bot = tot_v * optical / (1 + optical) if optical else tot_v / 2
    y0 = ((fig_h - trim_h_mm * MM) / 2 + bot * MM) / fig_h
    s = dict(
        k=k, fig_w=fig_w, fig_h=fig_h,
        axes_rect=[(fig_w - art_w) / 2 / fig_w, y0, art_w / fig_w, art_h / fig_h],
        top_mm=tot_v - bot, bottom_mm=bot,
        trim=[(fig_w - trim_w_mm * MM) / 2 / fig_w,
              (fig_h - trim_h_mm * MM) / 2 / fig_h,
              trim_w_mm * MM / fig_w, trim_h_mm * MM / fig_h],
        bleed_mm=bleed_mm, surround_mm=surround_mm, fig=(fig_w, fig_h),
        float_=float_, border_mm=(trim_w_mm - art_w / MM) / 2,
    )
    return s


SHEETS = {
    "plate": _sheet(9 * 25.4, 13.5 * 25.4),          # the working sheet, 1:1
    "a2f":   _sheet(420, 594, float_=True, optical=1.25),   # floated, optically centred
    "a2":    _sheet(420, 594),                        # exact A2, ground to the edge
    "a2b":   _sheet(420, 594, bleed_mm=3, surround_mm=9),   # bleed + crop marks
}
SHEET = SHEETS["plate"]
K = 1.0


def use_sheet(name):
    global SHEET, K
    SHEET = SHEETS[name]
    K = SHEET["k"]


def LW(v):
    return v * K


# ── page apparatus ─────────────────────────────────────────────────────
def new_page():
    s = SHEET
    fig = plt.figure(figsize=(s["fig_w"], s["fig_h"]), dpi=300)
    bleed = s["bleed_mm"] > 0 or s["surround_mm"] > 0
    # float: the sheet stays unprinted paper and only the plate block is
    # inked, so the border is real paper rather than a printed white
    fig.patch.set_facecolor("#FFFFFF" if (bleed or s["float_"]) else PAPER)
    if bleed:
        bg = fig.add_axes([0, 0, 1, 1]); bg.set_xlim(0, 1); bg.set_ylim(0, 1)
        bg.axis("off"); bg.set_zorder(0)
        tx, ty, tw, th = s["trim"]
        bx = s["bleed_mm"] * MM / s["fig_w"]
        by = s["bleed_mm"] * MM / s["fig_h"]
        bg.add_patch(Rectangle((tx - bx, ty - by), tw + 2 * bx, th + 2 * by,
                               fc=PAPER, ec="none", zorder=0))
        near_x, far_x = 3 * MM / s["fig_w"], 9 * MM / s["fig_w"]
        near_y, far_y = 3 * MM / s["fig_h"], 9 * MM / s["fig_h"]
        for cx in (tx, tx + tw):
            for cy in (ty, ty + th):
                sx = -1 if cx == tx else 1
                sy = -1 if cy == ty else 1
                bg.plot([cx + sx * near_x, cx + sx * far_x], [cy, cy],
                        lw=0.35, color="#000000", zorder=1)
                bg.plot([cx, cx], [cy + sy * near_y, cy + sy * far_y],
                        lw=0.35, color="#000000", zorder=1)
    ax = fig.add_axes(s["axes_rect"])
    ax.set_xlim(0, W); ax.set_ylim(0, H)
    ax.set_aspect("equal"); ax.axis("off"); ax.set_zorder(1)
    ax.patch.set_visible(False)
    if not bleed:
        ax.add_patch(Rectangle((0, 0), W, H, fc=PAPER, ec="none", zorder=0))
    return fig, ax


def track(s, n=1):
    return (" " * n).join(s)


def t(ax, x, y, s, fp, size, color=None, ha="left", alpha=1.0, **kw):
    # resolved at call time — a default argument would freeze the palette
    # that happened to be active when this module was defined
    if "bbox" in kw and isinstance(kw["bbox"], dict) and "pad" in kw["bbox"]:
        kw = {**kw, "bbox": {**kw["bbox"], "pad": kw["bbox"]["pad"] * K}}
    return ax.text(x, y, s, fontproperties=fp, fontsize=size * K,
                   color=TEXT if color is None else color,
                   ha=ha, va="baseline", alpha=alpha, **kw)


def fit(fig, ax, x, y, s, fp, target, hi, lo=6.0, **kw):
    """Largest size that still breathes inside `target`. Measured, not guessed."""
    r = fig.canvas.get_renderer()
    best = lo
    for _ in range(24):
        mid = (hi + lo) / 2
        probe = t(ax, x, y, s, fp, mid, alpha=0, **kw)
        bb = probe.get_window_extent(renderer=r)
        inv = ax.transData.inverted()
        # measured in DATA units, so the fit is identical at every sheet size
        w = inv.transform((bb.x1, bb.y0))[0] - inv.transform((bb.x0, bb.y0))[0]
        probe.remove()
        if w <= target:
            best, lo = mid, mid
        else:
            hi = mid
    return t(ax, x, y, s, fp, best, **kw)


def rule(ax, x0, x1, y, lw=0.5, color=None):
    ax.plot([x0, x1], [y, y], lw=LW(lw), color=GREY if color is None else color,
            solid_capstyle="butt", zorder=5)


def plate_ground(ax):
    ax.add_patch(Rectangle((PX0, PY0), PX1 - PX0, PY1 - PY0,
                           fc=PLATE, ec="none", zorder=1))
    clip = Rectangle((PX0, PY0), PX1 - PX0, PY1 - PY0, fc="none", ec="none")
    ax.add_patch(clip)
    return clip


def plate_edges(ax):
    for v in np.arange(PX0 + 0.25, PX1 - 0.24, 0.25):
        lg = abs((v - PX0) % 1.0) < 1e-6
        ax.plot([v, v], [PY0, PY0 - (0.085 if lg else 0.042)],
                lw=LW(0.45), color=GREY, zorder=5)
    for v in np.arange(PY0 + 0.25, PY1 - 0.24, 0.25):
        lg = abs((v - PY0) % 1.0) < 1e-6
        ax.plot([PX0, PX0 - (0.085 if lg else 0.042)], [v, v],
                lw=LW(0.45), color=GREY, zorder=5)
    ax.add_patch(Rectangle((PX0, PY0), PX1 - PX0, PY1 - PY0,
                           fc="none", ec=GREY, lw=LW(0.5), zorder=6))
    for sx, sy in ((PX0, PY0), (PX1, PY0), (PX0, PY1), (PX1, PY1)):
        ox = -0.17 if sx == PX0 else 0.17
        oy = -0.17 if sy == PY0 else 0.17
        ax.plot([sx + ox - 0.055, sx + ox + 0.055], [sy + oy, sy + oy],
                lw=LW(0.5), color=GREY, zorder=5)
        ax.plot([sx + ox, sx + ox], [sy + oy - 0.055, sy + oy + 0.055],
                lw=LW(0.5), color=GREY, zorder=5)


def vesica(cx, cy, d, R, n=400):
    """Boundary of the region two ranges hold in common."""
    th = np.arctan2(np.sqrt(max(R**2 - d**2, 0)), d)
    a1 = np.linspace(-th, th, n)
    a2 = np.linspace(np.pi - th, np.pi + th, n)
    return np.vstack([
        np.column_stack([cx - d + R * np.cos(a1), cy + R * np.sin(a1)]),
        np.column_stack([cx + d + R * np.cos(a2), cy + R * np.sin(a2)]),
    ])


def family(ax, cx, cy, radii, color, lw, alpha, z, clip_to):
    for r in radii:
        c = Circle((cx, cy), r, fill=False, lw=LW(lw), ec=color, alpha=alpha, zorder=z)
        ax.add_patch(c)
        c.set_clip_path(clip_to)


def chrome(fig, ax, plate_no, title, fig_cap, tab_cap, cols, hero, foot):
    """Everything every plate in the portfolio shares. The binding."""
    t(ax, CL, 12.78, track("STUDIES IN NEGOTIATED DISTANCE"), LABEL, 6.2, GREY)
    t(ax, CR, 12.78, track(f"PLATE {plate_no}"), LABEL, 6.2, GREY, ha="right")
    rule(ax, CL, CR, 12.58)
    fit(fig, ax, CXP, 12.24, track(title, 2), LABEL, 3.55, 12.0, ha="center")

    t(ax, CL, 3.90, track(fig_cap[0]), DATA, 4.6, GREY)
    t(ax, CR, 3.90, track(fig_cap[1]), DATA, 4.6, GREY, ha="right")
    t(ax, CL, 2.50, track(tab_cap[0]), DATA, 4.6, GREY)
    t(ax, CR, 2.50, track(tab_cap[1]), DATA, 4.6, ACCENT, ha="right")

    rule(ax, CL, CR, 2.30)
    for i, (head, body, glyph) in enumerate(cols):
        x = CL + i * 2.4333
        g, gy = 0.085, 2.045
        if glyph == "full":
            ax.add_patch(Rectangle((x, gy), g, g, fc=TEXT, ec="none", zorder=6))
        elif glyph == "hollow":
            ax.add_patch(Rectangle((x, gy), g, g, fc="none", ec=TEXT, lw=LW(0.6), zorder=6))
        else:
            ax.add_patch(Rectangle((x, gy), g, g, fc="none", ec=TEXT, lw=LW(0.6), zorder=6))
            ax.add_patch(Rectangle((x, gy), g / 2, g, fc=TEXT, ec="none", zorder=6))
        t(ax, x + 0.20, 2.055, track(head), LABEL, 6.0, TEXT)
        for j, line in enumerate(body):
            t(ax, x + 0.20, 1.855 - j * 0.145, line, DATA, 4.6, GREY)

    fit(fig, ax, CXP, 1.22, track(hero, 2), DISPLAY, 6.05, 30.0, ha="center")
    t(ax, CL, 0.74, track(foot[0]), DATA, 4.4, GREY)
    t(ax, CR, 0.74, track(foot[1]), DATA, 4.4, GREY, ha="right")


# ── PLATE XI — the pair ────────────────────────────────────────────────
def plate_xi():
    set_palette("lighthouse")
    fig, ax = new_page()
    clip = plate_ground(ax)
    D, RV, N = 1.55, 0.22 + 30 * DR, 74
    radii = [0.22 + k * DR for k in range(N)]
    ves = vesica(CXP, CYP, D, RV)
    vclip = Polygon(ves, closed=True, fc="none", ec="none")
    ax.add_patch(vclip)

    family(ax, CXP - D, CYP, radii, INK_A, 0.22, 0.80, 2, clip)
    family(ax, CXP + D, CYP, radii, INK_B, 0.22, 0.80, 2, clip)
    family(ax, CXP - D, CYP, radii, INK_A, 0.38, 1.00, 3, vclip)
    family(ax, CXP + D, CYP, radii, INK_B, 0.38, 1.00, 3, vclip)

    ax.plot([CXP, CXP], [PY0, PY1], lw=LW(0.45), color=GREY, alpha=0.55, zorder=4)
    ax.plot([PX0, PX1], [CYP, CYP], lw=LW(0.45), color=GREY, alpha=0.40, zorder=4)
    ax.add_patch(Polygon(ves, closed=True, fc="none", ec=ACCENT, lw=LW(0.6), zorder=6))

    for x, lab in ((CXP - D, "A"), (CXP + D, "B")):
        ax.plot([x - 0.11, x + 0.11], [CYP, CYP], lw=LW(0.7), color=TEXT, zorder=7)
        ax.plot([x, x], [CYP - 0.11, CYP + 0.11], lw=LW(0.7), color=TEXT, zorder=7)
        ax.add_patch(Circle((x, CYP), 0.05, fc=PLATE, ec=TEXT, lw=LW(0.7), zorder=7))
        t(ax, x, CYP - 0.40, lab, DATA, 5.5, TEXT, ha="center", zorder=8,
          bbox=dict(fc=PLATE, ec="none", pad=1.6))
    ax.add_patch(Circle((CXP, CYP), 0.028, fc=ACC_F, ec="none", zorder=8))
    plate_edges(ax)

    # TAB. I — the log. sent above the line, returned below.
    N_L, AXIS = 64, 3.25
    step = (CR - CL) / N_L
    rng = np.random.default_rng(11_25)
    unreturned = {17, 38, 59}
    ax.plot([CL, CR], [AXIS, AXIS], lw=LW(0.5), color=GREY, zorder=5)
    for i in range(N_L):
        x = CL + (i + 0.5) * step
        up, dn = 0.13 + 0.21 * rng.random(), 0.08 + 0.17 * rng.random()
        if i in unreturned:
            ax.plot([x, x], [AXIS, AXIS + up], lw=LW(1.5), color=ACC_F,
                    zorder=6, solid_capstyle="butt")
        else:
            ax.plot([x, x], [AXIS, AXIS + up], lw=LW(1.5), color=INK_A, alpha=0.88,
                    zorder=6, solid_capstyle="butt")
            ax.plot([x, x], [AXIS, AXIS - dn], lw=LW(1.5), color=INK_B, alpha=0.88,
                    zorder=6, solid_capstyle="butt")
        if i % 8 == 0:
            t(ax, x, 2.76, f"{i:02d}", DATA, 4.2, GREY, ha="center")

    chrome(fig, ax, "XI", "THE ADMITTED REGION",
           ("FIG. I — INTERFERENCE OF TWO RANGES ABOUT A COMMON SEAM",
            "LXXIV ARCS PER ORIGIN"),
           ("TAB. I — LOG OF EXCHANGE, LXIV PAIRS", "III UNRETURNED"),
           [("I · INSTRUMENT", ["invoked. alters state.",
                                "returns what it changed."], "full"),
            ("II · SOURCE", ["read. alters nothing.",
                             "returns what it holds."], "hollow"),
            ("III · FORM", ["offered. awaits a hand.",
                            "returns nothing alone."], "half")],
           "ONLY THE AGREED CROSSES",
           ("ORIGIN A — ORIGIN B · SEPARATION 2d", "MMXXIV · XI · XXV"))
    return fig


# ── PLATE XII — the many ───────────────────────────────────────────────
def plate_xii():
    set_palette("lighthouse")
    fig, ax = new_page()
    clip = plate_ground(ax)
    S = 1.62                       # spacing between neighbouring origins
    D2 = DR / 2                    # half the interval of PL. XI
    NA = 21
    R = NA * D2                    # 0.9205 — wide enough to meet a neighbour,
    radii = [(k + 1) * D2 for k in range(NA)]   # narrow enough that no three meet
    rowh = S * np.sqrt(3) / 2      # (circumradius 0.9353 — a void of 0.015)

    pts = []
    j = -2
    while PY0 + 0.30 + j * rowh < PY1 + 1.0:
        y = PY0 + 0.30 + j * rowh
        off = (j % 2) * S / 2
        i = -2
        while PX0 + 0.22 + i * S + off < PX1 + 1.0:
            pts.append((PX0 + 0.22 + i * S + off, y))
            i += 1
        j += 1
    pts = np.array(pts)
    inside = [(x, y) for x, y in pts if PX0 - 0.02 < x < PX1 + 0.02
              and PY0 - 0.02 < y < PY1 + 0.02]
    inside.sort(key=lambda p: (round(p[1], 3), p[0]))

    for n, (x, y) in enumerate(pts):
        warm = (round(x / (S / 2)) + round(y / rowh)) % 2 == 0
        family(ax, x, y, radii, INK_A if warm else INK_B, 0.22, 0.78, 3, clip)

    # the unit cell: one origin and the six agreements it holds, in oxide
    cell = min(inside, key=lambda p: (p[0] - CXP) ** 2 + (p[1] - CYP) ** 2)
    nbrs = [p for p in pts if 1e-6 < np.hypot(p[0] - cell[0], p[1] - cell[1]) < S * 1.05]
    for nb in sorted(nbrs, key=lambda p: np.arctan2(p[1] - cell[1], p[0] - cell[0])):
        mx, my = (cell[0] + nb[0]) / 2, (cell[1] + nb[1]) / 2
        ang = np.degrees(np.arctan2(nb[1] - cell[1], nb[0] - cell[0]))
        v = vesica(0, 0, S / 2, R)
        rot = np.radians(ang)
        M = np.array([[np.cos(rot), -np.sin(rot)], [np.sin(rot), np.cos(rot)]])
        v = v @ M.T + np.array([mx, my])
        vc = Polygon(v, closed=True, fc="none", ec="none")
        ax.add_patch(vc)
        family(ax, cell[0], cell[1], radii, INK_A, 0.34, 1.0, 4, vc)
        family(ax, nb[0], nb[1], radii, INK_B, 0.34, 1.0, 4, vc)
        p = Polygon(v, closed=True, fc="none", ec=ACCENT, lw=LW(0.5), zorder=7)
        ax.add_patch(p); p.set_clip_path(clip)

    ax.plot([cell[0] - 0.11, cell[0] + 0.11], [cell[1], cell[1]],
            lw=LW(0.7), color=TEXT, zorder=8)
    ax.plot([cell[0], cell[0]], [cell[1] - 0.11, cell[1] + 0.11],
            lw=LW(0.7), color=TEXT, zorder=8)
    ax.add_patch(Circle(cell, 0.05, fc=PLATE, ec=TEXT, lw=LW(0.7), zorder=8))
    plate_edges(ax)

    # TAB. II — census. how many agreements each origin actually holds.
    counts = [sum(1 for q in inside if 1e-6 < np.hypot(p[0] - q[0], p[1] - q[1]) < S * 1.05)
              for p in inside]
    cmin = min(counts)
    n_least = counts.count(cmin)
    AXIS, step = 2.95, (CR - CL) / len(counts)
    ax.plot([CL, CR], [AXIS, AXIS], lw=LW(0.5), color=GREY, zorder=5)
    for i, c in enumerate(counts):
        x = CL + (i + 0.5) * step
        col, al = (INK_A, 0.88) if c == 6 else (INK_B, 0.72)
        if c == cmin:
            col, al = ACC_F, 1.0
        ax.plot([x, x], [AXIS, AXIS + 0.115 * c], lw=LW(1.6), color=col, alpha=al,
                zorder=6, solid_capstyle="butt")
        if i % 8 == 0:
            t(ax, x, 2.76, f"{i:02d}", DATA, 4.2, GREY, ha="center")
    for lv in (3, 6):
        ax.plot([CL, CR], [AXIS + 0.115 * lv, AXIS + 0.115 * lv],
                lw=LW(0.35), color=GREY, alpha=0.45, zorder=4)

    chrome(fig, ax, "XII", "A FIELD OF ORIGINS",
           ("FIG. II — LATTICE AT SEPARATION s, INTERVAL ONE HALF OF PL. XI",
            f"{len(inside)} ORIGINS · s 1.62"),
           ("TAB. II — CENSUS OF AGREEMENTS HELD, PER ORIGIN",
            f"{ROM[n_least]} HOLDING {ROM[cmin]}"),
           [("I · ADJACENCY", ["a region for each pair.",
                               "never one for three."], "full"),
            ("II · ISOLATION", ["no origin sees another's.",
                                "regions do not merge."], "hollow"),
            ("III · CELL", ["one origin, six agreements.",
                            "drawn here in oxide."], "half")],
           "EACH TO ITS NEIGHBOUR, NONE TO ALL",
           ("UNIT CELL AT THE CENTRE · SIX ADMITTED", "R 0.9205 · TRIPLE VOID 0.015"))
    return fig


# ── PLATE XIII — the limit ─────────────────────────────────────────────
def plate_xiii():
    set_palette("lighthouse")
    fig, ax = new_page()
    plate_ground(ax)
    NC, NR, GX = 3, 4, 0.24
    pw = (PX1 - PX0 - (NC - 1) * GX) / NC
    rh = (PY1 - PY0) / NR
    ph = rh - 0.40
    D3 = 0.062
    R3 = 10 * D3
    radii = [(k + 1) * D3 for k in range(15)]
    ds = np.linspace(0.08, 0.86, 12)
    k_cross = int(np.argmax(ds >= R3))   # the one study where agreement fails

    for k, d in enumerate(ds):
        col, row = k % NC, k // NC
        x0 = PX0 + col * (pw + GX)
        y0 = PY1 - (row + 1) * rh + 0.34
        cx, cy = x0 + pw / 2, y0 + ph / 2
        pc = Rectangle((x0, y0), pw, ph, fc="none", ec="none")
        ax.add_patch(pc)
        family(ax, cx - d, cy, radii, INK_A, 0.20, 0.78, 3, pc)
        family(ax, cx + d, cy, radii, INK_B, 0.20, 0.78, 3, pc)
        if d < R3:
            v = vesica(cx, cy, d, R3)
            vc = Polygon(v, closed=True, fc="none", ec="none")
            ax.add_patch(vc)
            family(ax, cx - d, cy, radii, INK_A, 0.34, 1.0, 4, vc)
            family(ax, cx + d, cy, radii, INK_B, 0.34, 1.0, 4, vc)
            p = Polygon(v, closed=True, fc="none", ec=ACCENT, lw=LW(0.45), zorder=6)
            ax.add_patch(p); p.set_clip_path(pc)
        for sx in (cx - d, cx + d):
            ax.add_patch(Circle((sx, cy), 0.022, fc=TEXT, ec="none", zorder=7))
        ax.add_patch(Rectangle((x0, y0), pw, ph, fc="none", ec=GREY,
                               lw=LW(0.4), zorder=6))
        t(ax, x0 + 0.045, y0 - 0.155, f"{k + 1:02d}", DATA, 4.6, TEXT)
        t(ax, x0 + pw - 0.045, y0 - 0.155, f"d {d:.2f}", DATA, 4.4,
          ACCENT if k == k_cross else GREY, ha="right")
    plate_edges(ax)

    # TAB. III — the only line in this portfolio that is not part of a circle.
    AXIS, TOP = 2.95, 3.66
    dd = np.linspace(0, 0.90, 600)
    a = np.where(dd < R3,
                 2 * R3**2 * np.arccos(np.clip(dd / R3, -1, 1))
                 - 2 * dd * np.sqrt(np.clip(R3**2 - dd**2, 0, None)), 0.0)
    a = a / a[0]
    ax.plot([CL, CR], [AXIS, AXIS], lw=LW(0.5), color=GREY, zorder=5)
    ax.plot(CL + dd / 0.90 * (CR - CL), AXIS + a * (TOP - AXIS),
            lw=LW(0.85), color=INK_A, zorder=6, solid_capstyle="round")
    xl = CL + R3 / 0.90 * (CR - CL)
    ax.plot([xl, xl], [AXIS, TOP], lw=LW(0.5), color=ACCENT, zorder=6)
    t(ax, xl + 0.07, TOP - 0.10, track("LIMIT"), DATA, 4.4, ACCENT)
    for k, d in enumerate(ds):
        x = CL + d / 0.90 * (CR - CL)
        ax.plot([x, x], [AXIS, AXIS - 0.055], lw=LW(0.45), color=GREY, zorder=5)
        if k % 2 == 0:
            t(ax, x, 2.76, f"{k + 1:02d}", DATA, 4.2, GREY, ha="center")

    chrome(fig, ax, "XIII", "ON THE LIMIT OF AGREEMENT",
           ("FIG. III — TWELVE STUDIES, THE ORIGINS PARTING BY EQUAL STEP",
            "R 0.62 · CONSTANT"),
           ("TAB. III — AREA ADMITTED AGAINST SEPARATION",
            "IV WITHOUT REGION"),
           [("I · APPROACH", ["near origins.",
                              "the region at its widest."], "full"),
            ("II · WITHDRAWAL", ["parting by equal step.",
                                 "the region narrows."], "hollow"),
            ("III · SILENCE", ["past the limit.",
                               "nothing left to admit."], "half")],
           "BEYOND THIS, NOTHING IS SHARED",
           ("STUDIES 01 — 12 · STEP 0.071", "TERMINUS AT d = R"))
    return fig


pages = [("xi", plate_xi), ("xii", plate_xii), ("xiii", plate_xiii)]


def render(sheet, pdf_name, pngs=False):
    use_sheet(sheet)
    s = SHEETS[sheet]
    with PdfPages(OUT / pdf_name) as pdf:
        for name, fn in pages:
            f = fn()
            face = "#FFFFFF" if (s["bleed_mm"] or s["surround_mm"]) else PAPER
            pdf.savefig(f, facecolor=face)
            if pngs:
                f.savefig(OUT / f"negotiated-distance-{name}.png",
                          facecolor=face, dpi=300)
            plt.close(f)
    print(f"{pdf_name}  {s['fig_w'] * 25.4:.1f} x {s['fig_h'] * 25.4:.1f} mm"
          f"  · artwork x{s['k']:.4f}"
          f"  · margins  top {s['top_mm']:.1f}  side {s['border_mm']:.1f}"
          f"  bottom {s['bottom_mm']:.1f} mm")


render("plate", "negotiated-distance.pdf", pngs=True)
render("a2f", "negotiated-distance-A2.pdf")
# alternates, on demand: render("a2", ...) ground to the sheet edge,
# render("a2b", ...) the same with 3 mm bleed and crop marks
