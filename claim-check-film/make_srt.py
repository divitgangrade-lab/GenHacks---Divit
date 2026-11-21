"""Write subtitles_en.srt from timeline.json — the same cues the captions use."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
tl = json.load(open(os.path.join(HERE, 'timeline.json')))


def ts(s):
    h = int(s // 3600); m = int(s % 3600 // 60); sec = int(s % 60)
    ms = int(round((s - int(s)) * 1000))
    return f"{h:02d}:{m:02d}:{sec:02d},{ms:03d}"


out = []
for i, sc in enumerate(tl['scenes'], 1):
    t0 = sc['voiceAt'] - 0.05
    t1 = max(sc['voiceEnd'] + 0.4, t0 + 1.8)
    out.append(f"{i}\n{ts(t0)} --> {ts(t1)}\n{sc['cap']}\n")

path = os.path.join(HERE, 'subtitles_en.srt')
open(path, 'w', encoding='utf-8').write("\n".join(out))
print('subtitles_en.srt', len(out), 'cues')
