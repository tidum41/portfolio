#!/usr/bin/env python3
"""Film checks: frozen stretches, hard cuts, loop seam, ledger numbers (OCR), 640px contact sheets.
Usage: check-film.py film.mp4 outdir"""
import sys, json, subprocess, re, os
import numpy as np
from PIL import Image
film, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
FPS = 30
# ---- ledger ground truth via node
L = json.loads(subprocess.run(["node", "-e", r'''
const vm=require("vm"),fs=require("fs");const ctx={window:{}};vm.createContext(ctx);
vm.runInContext(fs.readFileSync("assets/joola-b2b/ledger.js","utf8"),ctx);const L=ctx.window.JOOLA_LEDGER;
const c=L.credit||{};console.log(JSON.stringify({orderTotal:L.orderTotal,orderId:L.orderId,customerPo:L.customerPo,
rep:L.rep&&(L.rep.name||L.rep),buyer:L.retailer.buyer,perseusUnit:L.perseusUnit,perseusQty:L.perseusQty,
lines:L.orderLines.map(l=>({id:l.productId,qty:l.qty,amt:L.lineAmount(l)})),credit:c,
money:{order:L.money(L.orderTotal)}}))'''], capture_output=True, text=True, check=True).stdout)
# ---- frames
w, h = 480, 360  # 4:3 card film
raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", film, "-vf", f"scale={w}:{h},format=gray", "-f", "rawvideo", "-"], capture_output=True).stdout
F = np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(np.int16)
n = len(F)
d = [float(np.abs(F[i] - F[i - 1]).mean()) for i in range(1, n)]
TH = 0.05
runs, i = [], 0
while i < len(d):
    if d[i] < TH:
        j = i
        while j < len(d) and d[j] < TH: j += 1
        if j - i + 1 > 12: runs.append({"from_frame": i, "to_frame": j, "seconds": round((j - i + 1) / FPS, 2)})
        i = j
    else: i += 1
med = float(np.median(d))
# hard cut = isolated spike: much larger than both neighbours' average (sustained fast moves are not cuts)
def nb(k):
    v = [d[j] for j in (k - 2, k - 1, k + 1, k + 2) if 0 <= j < len(d)]
    return sum(v) / len(v)
ALLOWED_CUTS = json.load(open("scripts/film-expect.json")).get("_allowed_cuts", [])
cuts = [{"frame": k + 1, "diff": round(x, 2)} for k, x in enumerate(d) if x > 4 and x > 2.5 * nb(k)]
fast = [{"frame": k + 1, "diff": round(x, 2)} for k, x in enumerate(d) if x > 8]
seam = float(np.abs(F[-1] - F[0]).mean())
# ---- OCR at hold frames
def frame_png(f, path, scale=None):
    vf = f"select=eq(n\\,{f})" + (f",scale={scale}" if scale else "")
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", film, "-vf", vf, "-vframes", "1", path], check=True)
def ocr(path):
    Image.open(path).resize((3840, 2160), Image.LANCZOS).save(path)
    from PIL import ImageOps
    inv = path.replace(".png", "_inv.png"); ImageOps.invert(Image.open(path).convert("RGB")).save(inv)
    run = lambda p, m: subprocess.run(["tesseract", p, "-", "--psm", m], capture_output=True, text=True).stdout
    return run(path, "11") + "\n" + run(path, "6") + "\n" + run(inv, "11")
m = L["money"]["order"]
EXPECT = {k: v for k, v in json.load(open("scripts/film-expect.json")).items() if not k.startswith("_")}
ocr_res, all_text = [], ""
for f, want in EXPECT.items():
    p = f"/tmp/ocr_{f}.png"; frame_png(int(f), p)
    t = ocr(p); all_text += t
    norm = t.replace(" ", "")
    miss = [s for s in want if s.replace(" ", "") not in norm]
    if miss:  # fallback: OCR quadrant tiles (full-frame OCR drops small/white-on-blue text)
        im = Image.open(p); W, H = im.size
        for tx in range(2):
            for ty in range(2):
                tp = f"/tmp/ocr_{f}_{tx}{ty}.png"; im.crop((tx * W // 2, ty * H // 2, (tx + 1) * W // 2, (ty + 1) * H // 2)).save(tp)
                norm += subprocess.run(["tesseract", tp, "-", "--psm", "6"], capture_output=True, text=True).stdout.replace(" ", "")
        miss = [s for s in want if s.replace(" ", "") not in norm]
    ocr_res.append({"frame": int(f), "expected": want, "missing": miss})
# sweep every 15th frame for forbidden strings
sweep = ""
for f in range(0, n, 15):
    p = f"/tmp/sw_{f}.png"; frame_png(f, p); sweep += f"\n@@{f}\n" + ocr(p)
forbidden = {s: [] for s in ["·", "Sam Ortiz", "89,982", "Build a bulk order"]}
cur = 0
for line in sweep.splitlines():
    if line.startswith("@@"): cur = int(line[2:]); continue
    for s in forbidden:
        if s in line: forbidden[s].append(cur)
caps = sorted({(c, ) for c in re.findall(r"\b[A-Z]{5,}\b", sweep)} - {("JOOLA",)})
# ---- contact sheets at 640 px
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", film, "-vf",
    "drawtext=text='%{n}':fontsize=40:x=12:y=12:fontcolor=red:box=1:boxcolor=white@0.7,select=not(mod(n\\,6)),scale=640:-1,tile=4x4:padding=4:color=gray",
    "-vsync", "0", f"{out}/contact-640-%02d.png"], check=True)
res = {"frames": n, "seconds": round(n / FPS, 2), "median_step": round(med, 4), "max_step": round(max(d), 2),
       "max_step_frame": int(np.argmax(d)) + 1, "frozen_runs_over_0.4s": runs, "hard_cuts": cuts, "allowed_cuts": ALLOWED_CUTS, "unexpected_cuts": [c for c in cuts if not any(abs(c["frame"] - a) <= 1 for a in ALLOWED_CUTS)], "very_fast_frames_over_8": fast,
       "loop_seam_diff": round(seam, 3), "loop_seam_vs_median_step": round(seam / max(med, 1e-6), 2),
       "ledger": L, "ocr_checks": ocr_res, "ocr_forbidden_hits": forbidden, "ocr_allcaps_words": [c[0] for c in caps],
       "pass": {"no_freeze": not runs, "no_cuts": not [c for c in cuts if not any(abs(c["frame"] - a) <= 1 for a in ALLOWED_CUTS)], "seam_ok": seam < max(3 * med, 0.6),
                "numbers_ok": all(not r["missing"] for r in ocr_res), "no_forbidden": not any(forbidden.values())}}
json.dump(res, open(f"{out}/checks.json", "w"), indent=1)
print(json.dumps({k: res[k] for k in ["frames", "median_step", "max_step", "max_step_frame", "frozen_runs_over_0.4s", "hard_cuts", "unexpected_cuts", "loop_seam_diff", "pass", "ocr_allcaps_words"]}, indent=0))
print([r for r in ocr_res if r["missing"]])
print({k: v for k, v in forbidden.items() if v})
