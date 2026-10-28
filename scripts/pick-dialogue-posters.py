#!/usr/bin/env python3
"""Poster = the settled frame with the most on-screen content (a held, open state), not the loop's resting start.
It is what reduced-motion readers and first paint see. usage: pick-dialogue-posters.py <dir-with-mp4s>
Writes <name>.jpg next to each mp4 and poster-times.json."""
import glob, json, os, subprocess, sys
import numpy as np
d = sys.argv[1]; times = {}
for p in sorted(glob.glob(os.path.join(d, "*.mp4"))):
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", p, "-vf", "scale=320:-2", "-pix_fmt", "gray", "-f", "rawvideo", "-"], capture_output=True, check=True).stdout
    w = 320; h = len(raw) // w
    probe = subprocess.run(["ffprobe", "-v", "error", "-count_frames", "-select_streams", "v", "-show_entries", "stream=nb_read_frames,height,width", "-of", "csv=p=0", p], capture_output=True, text=True).stdout.strip().split(",")
    W, H, n = int(probe[0]), int(probe[1]), int(probe[2]); hh = round(320 * H / W / 2) * 2
    F = np.frombuffer(raw, np.uint8)[: n * 320 * hh].reshape(n, hh, 320).astype(np.float32)
    D = np.abs(np.diff(F, axis=0)).max(axis=(1, 2))
    best, score = n - 1, -1
    for i in range(6, n - 6):
        if D[i - 6 : i + 6].max() < 12:  # held for 0.4 s around it
            s = float(np.abs(np.diff(F[i], axis=1)).mean())  # edge density: more text and rows on screen
            if s > score: best, score = i, s
    t = best / 30; times[os.path.basename(p)[:-4]] = round(t, 3)
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-ss", f"{t:.3f}", "-i", p, "-frames:v", "1", "-q:v", "2", p[:-4] + ".jpg"], check=True)
json.dump(times, open(os.path.join(d, "poster-times.json"), "w"), indent=1)
print(json.dumps(times))
