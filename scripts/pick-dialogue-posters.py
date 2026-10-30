#!/usr/bin/env python3
"""Poster = the settled frame with the most on-screen content (a held, open state), not the loop's resting start.
It is what reduced-motion readers and first paint see. usage: pick-dialogue-posters.py <dir-with-mp4s>
Writes <name>.jpg next to each mp4 and poster-times.json."""
import glob, json, os, subprocess, sys
import numpy as np
d = sys.argv[1]; times = {}
# Held-frame search can't see a brief state: Variant A's answer (question, count, bar) shows at 4.7 s before the follow scroll.
OVERRIDE = {}  # P15: the annotation-free held search finds the picker answer on its own
for p in sorted(glob.glob(os.path.join(d, "*.mp4"))):
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", p, "-vf", "scale=320:-2", "-pix_fmt", "gray", "-f", "rawvideo", "-"], capture_output=True, check=True).stdout
    w = 320; h = len(raw) // w
    probe = subprocess.run(["ffprobe", "-v", "error", "-count_frames", "-select_streams", "v", "-show_entries", "stream=nb_read_frames,height,width", "-of", "csv=p=0", p], capture_output=True, text=True).stdout.strip().split(",")
    W, H, n = int(probe[0]), int(probe[1]), int(probe[2]); hh = round(320 * H / W / 2) * 2
    F = np.frombuffer(raw, np.uint8)[: n * 320 * hh].reshape(n, hh, 320).astype(np.float32)
    D = np.abs(np.diff(F, axis=0)).max(axis=(1, 2))
    # P15: a poster never shows an annotation. Annotations live only in the right gutter (stages.ts: x from 475 of 647),
    # so a frame qualifies only when the whole gutter is flat well.
    g = F[:, :, int(320 * 475 / 647):]
    clean = np.abs(g - np.median(g, axis=0)).max(axis=(1, 2)) < 14  # the median gutter is the empty well plus the panel shadow
    best, score = n - 1, -1
    # Every poster shows an answer state; Variant A's picker stays visible above the input after send.
    hi = n - 6
    for i in range(6, hi):
        if D[i - 6 : i + 6].max() < 12 and clean[i - 6 : i + 6].all():  # held for 0.4 s around it
            s = float(np.abs(np.diff(F[i], axis=1)).mean())  # edge density: more text and rows on screen
            if s > score: best, score = i, s
    if not clean[min(int(OVERRIDE.get(os.path.basename(p)[:-4].removesuffix("-dark"), best / 30) * 30), n - 1)]:
        raise SystemExit(f"poster for {p} would show an annotation")
    t = OVERRIDE.get(os.path.basename(p)[:-4].removesuffix("-dark"), best / 30); times[os.path.basename(p)[:-4]] = round(t, 3)
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-ss", f"{t:.3f}", "-i", p, "-frames:v", "1", "-q:v", "2", p[:-4] + ".jpg"], check=True)
# Light/dark parity: each -dark video is padded or trimmed to its light twin's frame count and takes its poster time.
for name in [k for k in times if k.endswith("-dark")]:
    light = name[:-5]; lp = os.path.join(d, light + ".mp4"); dp = os.path.join(d, name + ".mp4")
    if light not in times: continue
    cnt = lambda f: int(subprocess.run(["ffprobe", "-v", "error", "-count_frames", "-select_streams", "v", "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", f], capture_output=True, text=True).stdout.strip())
    nl, nd = cnt(lp), cnt(dp)
    if nl != nd:
        tmp = dp[:-4] + ".tmp.mp4"
        vf = f"tpad=stop_mode=clone:stop={max(nl - nd, 0) + 2}"
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", dp, "-vf", vf, "-frames:v", str(nl), "-r", "30", "-c:v", "libx264", "-crf", "20", "-pix_fmt", "yuv420p", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-movflags", "+faststart", "-an", tmp], check=True)
        os.replace(tmp, dp)
    t = times[light]; times[name] = t
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-ss", f"{t:.3f}", "-i", dp, "-frames:v", "1", "-q:v", "2", dp[:-4] + ".jpg"], check=True)
json.dump(times, open(os.path.join(d, "poster-times.json"), "w"), indent=1)
print(json.dumps(times))
