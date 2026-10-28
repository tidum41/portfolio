#!/usr/bin/env python3
"""Motion checklist for the /dialogue demos (design/TASTE.md "Motion").
usage: check-dialogue-motion.py <video.mp4> [...]  -> one JSON line per video; exit 1 on any failure.
Metric: mean absolute luma difference between consecutive frames, 320x180, at the video's 30 fps.
A frame is "still" when no pixel changes by 12 or more (one typed character or a playhead tick counts as change).
Checks: length 4-9 s; no frame diff over 20; no mid-video hold over 2.0 s; a final hold of 1.0-1.9 s
(the last still run, which on crossfaded loops ends where the 400 ms fade begins); first and last frames match."""
import json, subprocess, sys
import numpy as np

def frames(path):
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", path, "-vf", "scale=320:180", "-pix_fmt", "gray", "-f", "rawvideo", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, 180, 320).astype(np.float32)

fails = 0
for p in sys.argv[1:]:
    F = frames(p); n = len(F); fps = 30; dur = n / fps
    D = np.abs(np.diff(F, axis=0)); d = D.mean(axis=(1, 2)); peak = D.max(axis=(1, 2))
    runs, start = [], None  # (start, end) of still runs, in frame-diff indices
    for i, x in enumerate(list(peak) + [255]):
        if x < 12 and start is None: start = i
        elif x >= 12 and start is not None: runs.append((start, i)); start = None
    tail = [r for r in runs if r[1] >= len(d) - int(0.6 * fps)]  # crossfade tail is at most 0.5 s
    final = tail[0] if tail else (runs[-1] if runs else (0, 0))
    mid = [(b - a) / fps for (a, b) in runs if (a, b) != final and b < len(d) - int(0.6 * fps) and a > 0]
    jump = d
    loop = float(np.abs(F[0] - F[-1]).mean())
    fh = (final[1] - final[0]) / fps
    r = {"video": p.split("/")[-1], "seconds": round(dur, 2), "max_frame_diff": round(float(jump.max()), 2),
         "longest_mid_hold_s": round(max(mid) if mid else 0, 2), "final_hold_s": round(fh, 2), "first_last_diff": round(loop, 2)}
    r["checks"] = {"length_4_9s": 4 <= dur <= 9, "no_jump_over_20": float(jump.max()) <= 20, "mid_holds_le_2s": (max(mid) if mid else 0) <= 2.0,
                   "final_hold_1_to_1_9s": 1.0 <= fh <= 1.9, "loop_matches": loop < 3}
    r["pass"] = all(r["checks"].values()); fails += not r["pass"]
    print(json.dumps(r))
sys.exit(1 if fails else 0)
