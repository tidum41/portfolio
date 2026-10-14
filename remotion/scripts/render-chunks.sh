#!/bin/bash
# Render JoolaB2B.
# Default is a fast draft: scale 0.375 (720x540), then ffmpeg to 676x508.
# Pass --final for the one delivery render at 1920x1440.
#
# usage:
#   scripts/render-chunks.sh out.mp4 DURATION [COMPOSITION_ID] [--draft|--final]
#   CONC=4 scripts/render-chunks.sh out.mp4 365 --final
set -u
OUT=$1; N=$2; shift 2
COMP=JoolaB2B
MODE=draft
for arg in "$@"; do
  case "$arg" in
    --draft) MODE=draft ;;
    --final) MODE=final ;;
    *) COMP=$arg ;;
  esac
done
CHROME=/usr/bin/google-chrome
CORES=$(nproc)
if [ "$MODE" = draft ]; then
  # 0.35 makes height 1440*0.35 = 503.99999999999994, which Remotion rejects.
  # --width/--height resizes the composition and crops this film: the stage is
  # hardcoded at 1440x1080. 0.375 is exact in binary (720x540). 507 is odd, so
  # the review file is 676x508.
  RAW="$(mktemp -u /tmp/joola-draft-XXXX.mp4)"
  npx remotion render "$COMP" "$RAW" \
    --frames="0-$((N - 1))" \
    --scale=0.375 \
    --image-format=jpeg \
    --jpeg-quality=60 \
    --crf=28 \
    --x264-preset=veryfast \
    --concurrency="${CONC:-$CORES}" \
    --browser-executable="$CHROME" \
    --log=error \
    --timeout=120000
  ffmpeg -loglevel error -y -i "$RAW" -vf scale=676:508:flags=lanczos -c:v libx264 -pix_fmt yuv420p -crf 28 -preset veryfast "$OUT"
  rm -f "$RAW"
  ffprobe -v error -count_frames -show_entries stream=width,height,nb_read_frames -of csv "$OUT"
  exit $?
fi
# Full quality stays chunked so a 1920 render does not blow memory.
CONC=${CONC:-2}; T=$(mktemp -d); STEP=42
: > "$T/list.txt"
for ((a=0; a<N; a+=STEP)); do b=$((a+STEP-1)); ((b>=N)) && b=$((N-1))
  for t in 1 2 3 4; do npx remotion render $COMP "$T/c$a.mp4" --frames=$a-$b --browser-executable="$CHROME" --log=error --concurrency=$CONC --timeout=120000 >/dev/null 2>&1 && break; echo "retry $a-$b"; done
  echo "file '$T/c$a.mp4'" >> "$T/list.txt"
done
ffmpeg -loglevel error -y -f concat -safe 0 -i "$T/list.txt" -c copy "$OUT"
ffprobe -v error -count_frames -show_entries stream=nb_read_frames -of csv "$OUT"
