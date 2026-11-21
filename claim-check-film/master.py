"""Concat the picture parts and master the film: two-pass loudnorm to -14 LUFS."""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')
FF = os.environ.get('FFMPEG', 'ffmpeg')
VIDEO = os.path.join(OUT, 'video.mp4')
MIX = os.path.join(OUT, 'mix.wav')
FILM = os.path.join(HERE, 'claim-check.mp4')

parts = [os.path.join(OUT, f'part{i}.mp4') for i in (1, 2, 3)]
for p in parts:
    if not os.path.exists(p) or os.path.getsize(p) < 1000:
        sys.exit(f'missing render part: {p}')

with open(os.path.join(OUT, 'parts.txt'), 'w') as f:
    for p in parts:
        f.write(f"file '{p}'\n")

subprocess.run([FF, '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0',
                '-i', os.path.join(OUT, 'parts.txt'), '-c', 'copy', VIDEO], check=True)

# pass 1: measure
p = subprocess.run([FF, '-hide_banner', '-nostats', '-i', MIX, '-af',
                    'loudnorm=I=-14:TP=-1.2:LRA=11:print_format=json', '-f', 'null', '-'],
                   capture_output=True, text=True)
m = re.search(r'\{[^{}]*"input_i"[^{}]*\}', p.stderr, re.S)
if not m:
    sys.exit('loudnorm measurement failed:\n' + p.stderr[-2000:])
meas = json.loads(m.group(0))
print('measured', {k: meas[k] for k in ('input_i', 'input_tp', 'input_lra', 'target_offset')})

af = ('loudnorm=I=-14:TP=-1.2:LRA=11:'
      f"measured_I={meas['input_i']}:measured_LRA={meas['input_lra']}:"
      f"measured_TP={meas['input_tp']}:measured_thresh={meas['input_thresh']}:"
      f"offset={meas['target_offset']}:linear=true")

subprocess.run([FF, '-y', '-loglevel', 'error', '-i', VIDEO, '-i', MIX,
                '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
                '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-af', af,
                '-movflags', '+faststart', '-shortest', FILM], check=True)
print('film', round(os.path.getsize(FILM) / 1e6, 1), 'MB ->', FILM)
