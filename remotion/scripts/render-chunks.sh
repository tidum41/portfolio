#!/bin/bash
# Low-memory render: chunks of ~42 frames, concurrency 1, retry, then lossless concat.
# usage: scripts/render-chunks.sh out.mp4 DURATION
set -u
OUT=$1; N=$2; T=$(mktemp -d); STEP=42
: > $T/list.txt
for ((a=0; a<N; a+=STEP)); do b=$((a+STEP-1)); ((b>=N)) && b=$((N-1))
  for t in 1 2 3 4; do npx remotion render JoolaB2B $T/c$a.mp4 --frames=$a-$b --browser-executable=/usr/bin/google-chrome --log=error --concurrency=1 --timeout=120000 >/dev/null 2>&1 && break; echo "retry $a-$b"; done
  echo "file '$T/c$a.mp4'" >> $T/list.txt
done
ffmpeg -loglevel error -y -f concat -safe 0 -i $T/list.txt -c copy "$OUT"
ffprobe -v error -count_frames -show_entries stream=nb_read_frames -of csv "$OUT"
