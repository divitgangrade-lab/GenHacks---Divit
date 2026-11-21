"""Claim Check — score, foley and voice, all on timeline.json."""
import json, math, os
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt, lfilter

HERE = os.path.dirname(os.path.abspath(__file__))
SR = 48000
TL = json.load(open(os.path.join(HERE, 'timeline.json')))
SC = {s['id']: s for s in TL['scenes']}
DUR = TL['dur']
N = int(math.ceil((DUR + 1.0) * SR))


def buf():
    return np.zeros((N, 2), dtype=np.float32)


def add(out, sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N or len(sig) == 0:
        i = max(0, min(i, N - 1))
    n = min(len(sig), N - i)
    if n <= 0:
        return
    l = gain * (1.0 - max(0.0, pan) * 0.6)
    r = gain * (1.0 + min(0.0, pan) * 0.6)
    out[i:i + n, 0] += sig[:n] * l
    out[i:i + n, 1] += sig[:n] * r


def env(n, a=0.005, d=0.2, s=0.0, r=0.05):
    t = np.linspace(0, 1, n, endpoint=False)
    e = np.ones(n)
    ai = max(1, int(a * n)); di = max(1, int(d * n)); ri = max(1, int(r * n))
    e[:ai] = np.linspace(0, 1, ai)
    if di < n:
        e[ai:ai + di] = np.linspace(1, s if s else 0.25, min(di, n - ai))
        e[ai + di:] = np.linspace(e[min(n - 1, ai + di - 1)], 0, n - ai - di) if n - ai - di > 0 else e[ai + di:]
    if ri < n:
        e[-ri:] *= np.linspace(1, 0, ri)
    return e


def tone(freq, dur, kind='sine', detune=0.0, harm=0.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    if kind == 'sine':
        y = np.sin(2 * np.pi * freq * t)
    elif kind == 'tri':
        y = 2 * np.abs(2 * ((freq * t) % 1) - 1) - 1
    elif kind == 'square':
        y = np.sign(np.sin(2 * np.pi * freq * t))
    else:
        y = np.sin(2 * np.pi * freq * t) + 0.5 * np.sin(2 * np.pi * freq * 2.01 * t)
    if detune:
        y = y + 0.35 * np.sin(2 * np.pi * freq * (1 + detune) * t)
    if harm:
        y = y + harm * np.sin(2 * np.pi * freq * 4.0 * t)   # marimba-ish 4th partial
    return (y / (1 + 0.35 * bool(detune) + harm)).astype(np.float32)


def lowpass(x, k=0.18):
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += k * (x[i] - acc)
        y[i] = acc
    return y


def highpass(x, f=85):
    sos = butter(2, min(0.99, f / (SR / 2)), 'high', output='sos')
    return sosfilt(sos, x).astype(np.float32)


def peaking(x, f, gain_db, q=1.0):
    A = 10 ** (gain_db / 40.0)
    w = 2 * np.pi * f / SR
    al = np.sin(w) / (2 * q); cw = np.cos(w)
    return lfilter([1 + al * A, -2 * cw, 1 - al * A],
                   [1 + al / A, -2 * cw, 1 - al / A], x).astype(np.float32)


def comp(x, thr=0.22, ratio=4.5):
    a = np.abs(x)
    out = np.where(a > thr, thr + (a - thr) / ratio, a)
    return np.sign(x).astype(np.float32) * out.astype(np.float32)


def voice_chain(x):
    """The take, made to lean on its stressed words.

    Presence and consonant bite for emphasis, a little saturation so the voice
    reads loud before the limiter, and a parallel compressor under it for
    density. Nothing here changes a word.
    """
    x = highpass(x, 80)
    x = peaking(x, 2100, 2.4, 0.9)
    x = peaking(x, 4800, 1.8, 1.1)
    d = np.diff(x, prepend=x[0])
    x = x + 0.30 * highpass(d, 2200)          # stops and sibilants land
    x = (np.tanh(x * 1.7) / 1.7).astype(np.float32)
    x = (0.62 * x + 0.60 * comp(x)).astype(np.float32)
    win = int(0.04 * SR)                       # phrase-level contrast
    env = np.sqrt(np.convolve(x * x, np.ones(win) / win, mode='same') + 1e-12)
    ref = np.percentile(env, 70) + 1e-9
    x = x * np.clip((env / ref) ** 0.15, 0.80, 1.30)
    return (x / (np.max(np.abs(x)) + 1e-6) * 0.95).astype(np.float32)


# ── the score ───────────────────────────────────────────────────────────────
BPM = 92
BEAT = 60.0 / BPM
BAR = BEAT * 4
music = buf()

# sections: (start, end, density) — quiet at the edges, full through the evidence
INTRO = (0.0, 16.9, 0.35)
LAW = (16.9, 41.5, 0.75)
BODY = (41.5, 76.6, 1.0)
INSTALL = (76.6, 90.7, 0.45)
RECEIPT = (90.7, 106.9, 0.9)
END = (106.9, DUR, 0.5)
SECTIONS = [INTRO, LAW, BODY, INSTALL, RECEIPT, END]

ROOTS = [73.42, 58.27, 49.00, 55.00]      # D2, Bb1, G1, A1
CHORDS = [(0, 3, 7), (0, 4, 7), (0, 3, 7), (0, 4, 7)]   # minor, major, minor, major


def density_at(t):
    for a, b, d in SECTIONS:
        if a <= t < b:
            return d
    return 0.4


def silent(t):
    # two real silences: before the first stamp, and before the 23.1% reveal
    return (2.30 <= t < 2.68) or (93.30 <= t < 93.95)


score = buf()
bar = 0
while bar * BAR < DUR:
    t0 = bar * BAR
    d = density_at(t0 + 0.05)
    root = ROOTS[bar % 4]
    chord = CHORDS[bar % 4]

    # pad: two bars of a quiet triad
    if d > 0.3:
        n = int(BAR * 2 * SR)
        pad = np.zeros(n, dtype=np.float32)
        for iv in chord:
            pad += tone(root * 2 * 2 ** (iv / 12), BAR * 2, 'tri') * 0.5
        pad = lowpass(pad, 0.05)
        e = np.ones(n, dtype=np.float32)
        fade = int(0.35 * SR)
        e[:fade] = np.linspace(0, 1, fade); e[-fade:] = np.linspace(1, 0, fade)
        add(score, pad * e, t0, 0.16 if d < 0.8 else 0.20)

    # kick / snare / hats
    for b in range(4):
        tb = t0 + b * BEAT
        if d >= 0.45 and b in (0, 2):
            n = int(0.30 * SR)
            tt = np.arange(n) / SR
            kick = np.sin(2 * np.pi * (78 * np.exp(-tt * 9) + 44) * tt) * np.exp(-tt * 7)
            add(score, kick.astype(np.float32), tb, 0.55)
        if d >= 0.65 and b in (1, 3):
            n = int(0.18 * SR)
            tt = np.arange(n) / SR
            noise = np.random.default_rng(bar * 7 + b).normal(0, 1, n)
            snare = (noise * np.exp(-tt * 26) * 0.5 + np.sin(2 * np.pi * 190 * tt) * np.exp(-tt * 30) * 0.4)
            add(score, snare.astype(np.float32), tb, 0.28)
    if d >= 0.5:
        for k in range(8):
            th = t0 + k * BEAT / 2
            n = int(0.045 * SR)
            tt = np.arange(n) / SR
            noise = np.random.default_rng(int(th * 97) + k).normal(0, 1, n) * np.exp(-tt * 120)
            add(score, noise.astype(np.float32), th, 0.07 if k % 2 else 0.11, 0.25)

    # bass: eighths, root with an octave lift
    if d >= 0.55:
        for k in range(8):
            tb = t0 + k * BEAT / 2
            f = root if k % 4 != 3 else root * 2
            n = int(BEAT * 0.45 * SR)
            b = tone(f, BEAT * 0.45, 'square')
            add(score, b * env(n, 0.004, 0.5, 0.2, 0.1)[:n], tb, 0.13)

    bar += 1

# marimba motif: one figure per section, so the film has a tune, not a drone
MOTIF = [(0, 0), (0.75, 3), (1.5, 7), (2.25, 3), (3.0, 10), (3.75, 7)]
for si, (a, b, d) in enumerate(SECTIONS):
    t = a + BAR
    while t < b - 1.0:
        for off, semi in MOTIF:
            tb = t + off * BEAT
            if tb >= b - 0.5:
                continue
            base = ROOTS[si % 4] * 4
            n = int(0.9 * SR)
            note = tone(base * 2 ** (semi / 12), 0.9, 'sine', harm=0.35)
            add(score, note * env(n, 0.002, 0.35, 0.0, 0.4)[:n], tb, 0.055, -0.15 + (semi % 3) * 0.15)
        t += BAR * 2
music = score


# ── foley ───────────────────────────────────────────────────────────────────
fx = buf()


def stamp_hit(at, big=1.0):
    n = int(0.55 * SR)
    tt = np.arange(n) / SR
    boom = np.sin(2 * np.pi * (120 * np.exp(-tt * 7) + 38) * tt) * np.exp(-tt * 6)
    rng = np.random.default_rng(int(at * 1000))
    click = rng.normal(0, 1, n) * np.exp(-tt * 150) * 0.5
    crack = rng.normal(0, 1, n) * np.exp(-tt * 40) * 0.15
    add(fx, ((boom * 0.9 + click + crack) * 0.6).astype(np.float32), at, 0.85 * big, 0.0)


def paper(at, gain=0.18):
    n = int(0.26 * SR)
    tt = np.arange(n) / SR
    rng = np.random.default_rng(int(at * 37) + 5)
    noise = rng.normal(0, 1, n)
    sweep = np.convolve(noise, np.ones(24) / 24, mode='same')
    e = np.exp(-tt * 12) * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * tt))
    add(fx, (sweep * e).astype(np.float32), at, gain, 0.1)


def whoosh(at, gain=0.13):
    n = int(0.42 * SR)
    tt = np.arange(n) / SR
    rng = np.random.default_rng(int(at * 71) + 3)
    noise = rng.normal(0, 1, n)
    y = np.convolve(noise, np.ones(60) / 60, mode='same')
    e = np.sin(np.pi * np.clip(tt / 0.42, 0, 1)) ** 2
    add(fx, (y * e).astype(np.float32), at - 0.2, gain)


def tick(at, gain=0.05):
    n = int(0.02 * SR)
    tt = np.arange(n) / SR
    add(fx, (np.sin(2 * np.pi * 2100 * tt) * np.exp(-tt * 260)).astype(np.float32), at, gain, 0.2)


# cuts: paper slide + a soft whoosh into the wipe
for c in TL['cuts']:
    paper(c - 0.24)
    whoosh(c)

# stamps
stamp_hit(SC['hook']['t'] + 2.65, 1.15)
for off in (2.10, 3.35, 4.60):
    stamp_hit(SC['three']['t'] + off, 0.75)
for off in (1.90, 6.10):
    stamp_hit(SC['decoy']['t'] + off, 0.7)
stamp_hit(SC['end']['t'] + 1.85, 1.0)

# typewriter through the hook
txt = 'Biodegradable formula.'
for i in range(len(txt)):
    tick(SC['hook']['t'] + 0.05 + i * 0.072, 0.045 if txt[i] != ' ' else 0.02)

# counters in the receipts: a tick per page square
for i in range(13):
    tick(SC['receipts']['t'] + 2.6 + i * 0.07, 0.035)


# ── voice ───────────────────────────────────────────────────────────────────
voice = buf()
vd = json.load(open(os.path.join(HERE, 'voice', 'wav', 'dur.json')))
for s in TL['scenes']:
    p = os.path.join(HERE, 'voice', 'wav', s['v'] + '.wav')
    x, sr = sf.read(p, dtype='float32')
    if x.ndim > 1:
        x = x.mean(axis=1)
    if sr != SR:
        idx = np.linspace(0, len(x) - 1, int(len(x) * SR / sr))
        x = np.interp(idx, np.arange(len(x)), x).astype(np.float32)
    x = voice_chain(x)
    add(voice, x, s['voiceAt'], 1.15)


# ── a modest room for the voice so it sits in the same space ────────────────
def reverb(x, taps=((0.037, 0.16), (0.071, 0.11), (0.113, 0.075))):
    y = x.copy()
    for dly, g in taps:
        k = int(dly * SR)
        y[k:] += x[:-k] * g
    return y


voice = reverb(voice)


# ── master ──────────────────────────────────────────────────────────────────
music = music * (1.0 - 0.55 * (voice[:, :1] > 0.02))     # duck under speech
mix = voice * 1.0 + music * 0.85 + fx * 0.9
peak = np.max(np.abs(mix)) + 1e-9
mix = mix / peak * 0.89
mix = np.tanh(mix * 1.05) * 0.94

sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix[:int(DUR * SR)], SR, subtype='PCM_24')
print('mix.wav', round(DUR, 2), 's', 'peak', round(float(np.max(np.abs(mix))), 3))
