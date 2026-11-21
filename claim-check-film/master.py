"""Concat the picture parts and master the film: two-pass loudnorm to -14 LUFS.

    python master.py [--dir out --out claim-check.mp4 --crf 22 --level 5.1]

The picture is re-encoded once, to the format every player accepts:
H.264 High, yuv420p, limited range, BT.709, faststart. The renderer draws in
full-range sRGB, so the range is converted rather than relabelled.
"""
import argparse, json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
FF = os.environ.get('FFMPEG', 'ffmpeg')

ap = argparse.ArgumentParser()
ap.add_argument('--dir', default='out')
ap.add_argument('--out', default='claim-check.mp4')
ap.add_argument('--crf', default='22')
ap.add_argument('--level', default='5.1')
ap.add_argument('--preset', default='medium')
a = ap.parse_args()

SRC = os.path.join(HERE, a.dir)
FILM = os.path.join(HERE, a.out)
MIX = os.path.join(HERE, 'out', 'mix.wav')
CONCAT = os.path.join(SRC, 'video.mp4')

parts = [os.path.join(SRC, f'part{i}.mp4') for i in (1, 2, 3)]
for p in parts:
    if not os.path.exists(p) or os.path.getsize(p) < 1000:
        sys.exit(f'missing render part: {p}')

with open(os.path.join(SRC, 'parts.txt'), 'w') as f:
    for p in parts:
        f.write(f"file '{p}'\n")

subprocess.run([FF, '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0',
                '-i', os.path.join(SRC, 'parts.txt'), '-c', 'copy', CONCAT], check=True)

# pass 1: measure the mix
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

subprocess.run([FF, '-y', '-loglevel', 'error', '-i', CONCAT, '-i', MIX,
                '-map', '0:v', '-map', '1:a',
                '-vf', 'scale=in_range=full:out_range=tv:flags=lanczos,format=yuv420p',
                '-c:v', 'libx264', '-preset', a.preset, '-crf', a.crf,
                '-profile:v', 'high', '-level', a.level,
                '-pix_fmt', 'yuv420p',
                '-color_range', 'tv', '-colorspace', 'bt709',
                '-color_primaries', 'bt709', '-color_trc', 'bt709',
                '-x264-params', 'keyint=60:min-keyint=30',
                '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-af', af,
                '-movflags', '+faststart', '-shortest', FILM], check=True)
print('film', round(os.path.getsize(FILM) / 1e6, 1), 'MB ->', FILM)
