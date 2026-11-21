#!/bin/sh
# Claim Check — one command builds the film.
#   LIB=/path/to/lemo-opuscar sh build.sh [4K WxH] [fps]   # also writes a 1080p copy
# Needs Node 20+, ffmpeg 7+ on PATH, and the library's core + voice tiers installed.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-$HOME/lemo-opuscar}
SIZE=${1:-3840x2160}
FPS=${2:-30}
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the lemo-opuscar folder"; exit 1; }
command -v ffmpeg >/dev/null || { echo "ffmpeg 7+ is needed on PATH"; exit 1; }
cd "$HERE"
mkdir -p out

# the timeline is the single source of truth: export it once for the sound
node -e "import('./timeline.js').then(m=>require('fs').writeFileSync('timeline.json', JSON.stringify({scenes:m.SCENES,dur:m.DUR,cuts:m.CUTS},null,1)))"

# sound first: it is cheap, and a broken mix should not wait on a 4K render
"$LIB/.venv/bin/python" mix.py

# picture, in three parts per size: each part is a checkpoint on a slow machine
DUR=$(node --input-type=module -e "import('./timeline.js').then(m=>console.log(m.DUR.toFixed(2)))")
mkdir -p "$HERE/out/1080"
for d in out out/1080; do
  s=$SIZE; [ "$d" = "out/1080" ] && s=1920x1080
  node "$LIB/core/render/video.mjs" "$HERE" --fps "$FPS" --workers 2 --size "$s" --q "t0=0&t1=40"          --out "$HERE/$d/part1.mp4"
  node "$LIB/core/render/video.mjs" "$HERE" --fps "$FPS" --workers 2 --size "$s" --q "t0=40&t1=80"         --out "$HERE/$d/part2.mp4"
  node "$LIB/core/render/video.mjs" "$HERE" --fps "$FPS" --workers 2 --size "$s" --q "t0=80&t1=$DUR"       --out "$HERE/$d/part3.mp4"
done

# master both: two-pass loudnorm to -14 LUFS / -1.2 dBTP, yuv420p BT.709, faststart
"$LIB/.venv/bin/python" master.py --dir out      --out claim-check.mp4       --crf 22 --level 5.1
"$LIB/.venv/bin/python" master.py --dir out/1080 --out claim-check-1080p.mp4 --crf 20 --level 4.1

# the poster: the film's signature frame
node "$LIB/core/render/still.mjs" "$HERE" 3.4 --size "$SIZE" --out "$HERE/out/poster" >/dev/null
cp "$HERE/out/poster/t_3.4.jpg" "$HERE/poster.jpg"

# the burned-in captions, also as a sidecar (players prefer it over the picture)
"$LIB/.venv/bin/python" make_srt.py
echo "done: $HERE/claim-check.mp4 and $HERE/claim-check-1080p.mp4"
