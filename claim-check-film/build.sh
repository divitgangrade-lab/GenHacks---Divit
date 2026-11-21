#!/bin/sh
# Claim Check — one command builds the film.
#   LIB=/path/to/lemo-opuscar sh build.sh [WxH] [fps]
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

# picture, in three parts: each part is a checkpoint on a slow machine
node "$LIB/core/render/video.mjs" "$HERE" --fps "$FPS" --workers 2 --size "$SIZE" --q 't0=0&t1=40'   --out "$HERE/out/part1.mp4"
node "$LIB/core/render/video.mjs" "$HERE" --fps "$FPS" --workers 2 --size "$SIZE" --q 't0=40&t1=80'  --out "$HERE/out/part2.mp4"
node "$LIB/core/render/video.mjs" "$HERE" --fps "$FPS" --workers 2 --size "$SIZE" --q 't0=80&t1=116' --out "$HERE/out/part3.mp4"

printf "file '%s'\n" "$HERE/out/part1.mp4" "$HERE/out/part2.mp4" "$HERE/out/part3.mp4" > "$HERE/out/parts.txt"
ffmpeg -y -loglevel error -f concat -safe 0 -i "$HERE/out/parts.txt" -c copy "$HERE/out/video.mp4"

# master: two-pass loudnorm to -14 LUFS / -1.2 dBTP, AAC 256k
JSON=$(ffmpeg -hide_banner -nostats -i "$HERE/out/mix.wav" -af loudnorm=I=-14:TP=-1.2:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
M_I=$(echo "$JSON" | sed -n 's/.*"input_i" : "\(.*\)",/\1/p')
M_LRA=$(echo "$JSON" | sed -n 's/.*"input_lra" : "\(.*\)",/\1/p')
M_TP=$(echo "$JSON" | sed -n 's/.*"input_tp" : "\(.*\)",/\1/p')
M_TH=$(echo "$JSON" | sed -n 's/.*"input_thresh" : "\(.*\)",/\1/p')
M_OFF=$(echo "$JSON" | sed -n 's/.*"target_offset" : "\(.*\)",/\1/p')
ffmpeg -y -loglevel error -i "$HERE/out/video.mp4" -i "$HERE/out/mix.wav" \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -ar 48000 \
  -af "loudnorm=I=-14:TP=-1.2:LRA=11:measured_I=$M_I:measured_LRA=$M_LRA:measured_TP=$M_TP:measured_thresh=$M_TH:offset=$M_OFF:linear=true" \
  -movflags +faststart -shortest "$HERE/claim-check.mp4"

# the poster: the film's signature frame
node "$LIB/core/render/still.mjs" "$HERE" 3.4 --size "$SIZE" --out "$HERE/out/poster" >/dev/null
cp "$HERE/out/poster/t_3.4.jpg" "$HERE/poster.jpg"

# the burned-in captions, also as a sidecar (players prefer it over the picture)
"$LIB/.venv/bin/python" make_srt.py
echo "done: $HERE/claim-check.mp4"
