#!/usr/bin/env python3
"""Motion checklist for the /dialogue demos (design/TASTE.md "Motion").
usage: check-dialogue-motion.py <video.mp4> [...]  -> one JSON line per video; exit 1 on any failure.
Metric: mean absolute luma difference between consecutive frames, 320x180, at the video's 30 fps.
A frame is "still" when no pixel changes by 12 or more (one typed character or a playhead tick counts as change).
Checks: length 4-9 s; no frame diff over 20 (phone takes normalised to the desktop card share, see below); no mid-video hold over 2.0 s; a final hold of 1.0-1.9 s
(the last held state: the longest still run that ends in the final 1.3 s, which on add-only loops ends where the
0.7 s scroll-out seam begins, and on crossfaded loops where the 400 ms fade begins); first and last frames match;
no overflow (P16 round 3): in every held frame, the strip 2-8 css px above the card's bottom edge is flat card colour,
so no row, quote or player sits clipped across the edge. Phone takes (-m) are the card, so their edge is the frame's."""
import json, subprocess, sys
import numpy as np

def full(path):
    w, h = map(int, subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", path], capture_output=True, text=True, check=True).stdout.strip().split(","))
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", path, "-pix_fmt", "gray", "-f", "rawvideo", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, h, w)

def overflow(G, idx, phone):
    """Held frames (indices) where something crosses the card's bottom edge. Recordings are 2x, so 2-8 css px (inside the
    panel padding) is 3-16 px."""
    bad = []
    for i in idx:
        g = G[i].astype(np.int16); h, w = g.shape
        if phone: bottom, x0, x1 = h - 1, 60, w - 60
        else:
            # The card's bottom edge is the last sharp step in the centre column (the soft drop shadow below it is not).
            well = int(g[3, 3]); c = g[:, w // 2]; col = np.where(np.abs(np.diff(c)) > 30)[0]
            if not len(col): continue
            bottom = int(col.max()); row = np.where(np.abs(g[bottom - 20] - well) > 4)[0]
            x0, x1 = int(row.min()) + 60, int(row.max()) - 60  # clear of the rounded corners
        strip = g[bottom - 16: bottom - 3, x0:x1]
        if int(strip.max()) - int(strip.min()) > 14: bad.append(i)
    return bad

def frames(path):
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", path, "-vf", "scale=320:180", "-pix_fmt", "gray", "-f", "rawvideo", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, 180, 320).astype(np.float32)

fails = 0
for p in sys.argv[1:]:
    F = frames(p); n = len(F); fps = 30; dur = n / fps
    D = np.abs(np.diff(F, axis=0)); d = D.mean(axis=(1, 2)); peak = D.max(axis=(1, 2))
    # P16 round 3: a desktop take is about 62% card (423 px panel in a 535 px stage, squared) and 38% still gutter, which
    # dilutes its mean. A phone take (-m) is all card, so its diff is scaled by the same 0.62 to score equal motion equally.
    if "-m" in p.split("/")[-1]: d = d * (423 / 535) ** 2
    runs, start = [], None  # (start, end) of still runs, in frame-diff indices
    for i, x in enumerate(list(peak) + [255]):
        if x < 12 and start is None: start = i
        elif x >= 12 and start is not None: runs.append((start, i)); start = None
    W = int(1.3 * fps)  # P16: a loop seam (scroll-out or crossfade) lasts at most 1.3 s after the last held state
    tail = [r for r in runs if r[1] >= len(d) - W]
    final = max(tail, key=lambda r: r[1] - r[0]) if tail else (runs[-1] if runs else (0, 0))
    mid = [(b - a) / fps for (a, b) in runs if (a, b) != final and b < len(d) - W and a > 0]
    jump = d
    loop = float(np.abs(F[0] - F[-1]).mean())
    fh = (final[1] - final[0]) / fps
    G = full(p); held = [(a + b) // 2 + 1 for (a, b) in runs if (b - a) >= 6]
    ov = overflow(G, held, "-m" in p.split("/")[-1])
    r = {"video": p.split("/")[-1], "seconds": round(dur, 2), "max_frame_diff": round(float(jump.max()), 2),
         "longest_mid_hold_s": round(max(mid) if mid else 0, 2), "final_hold_s": round(fh, 2), "first_last_diff": round(loop, 2), "overflow_frames": ov}
    r["checks"] = {"length_4_9s": 4 <= dur <= 9, "no_jump_over_20": float(jump.max()) <= 20, "mid_holds_le_2s": (max(mid) if mid else 0) <= 2.0,
                   "final_hold_1_to_1_9s": 1.0 <= fh <= 1.9, "loop_matches": loop < 3, "no_overflow": not ov}
    r["pass"] = all(r["checks"].values()); fails += not r["pass"]
    print(json.dumps(r))
sys.exit(1 if fails else 0)
