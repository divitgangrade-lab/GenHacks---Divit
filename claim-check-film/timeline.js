// One timeline for picture, voice, captions and the score.
// Scene length = head + the measured voice line + tail + any extra hold.
export const VDUR = {
  v01: 8.139, v02: 5.449, v03: 12.036, v04: 10.065, v05: 8.297, v06: 8.214,
  v07: 4.571, v08: 5.375, v09: 4.426, v10: 5.83, v11: 7.413, v12: 5.217, v13: 4.684,
};

const HEAD = 0.55, TAIL = 0.85;

const RAW = [
  { id: 'hook', v: 'v01', vAt: 0.50, extra: 0.45,
    cap: 'This sentence is on a product page. In the EU, it is now banned — unless the seller can prove the claim.', capKey: 'banned' },
  { id: 'title', v: 'v02', vAt: 0.60, extra: 0.20,
    cap: 'Claim Check marks the claims that are now illegal, on the page you are shopping on.', capKey: 'illegal' },
  { id: 'law', v: 'v03', vAt: 0.55, extra: 0.35,
    cap: 'Directive 2024/825 applies from 27 September 2026. It covers stock already on the shelves.', capKey: '27 September 2026' },
  { id: 'three', v: 'v04', vAt: 0.55, extra: 0.40,
    cap: 'Eco-friendly. Climate neutral. Biodegradable. Without proof, the words are the problem.', capKey: 'Biodegradable' },
  { id: 'product', v: 'v05', vAt: 0.55, extra: 0.35,
    cap: 'It reads the visible text of the page: four banned claims here, two that need evidence.', capKey: 'four banned claims' },
  { id: 'anatomy', v: 'v06', vAt: 0.55, extra: 0.35,
    cap: 'Each finding quotes the sentence, marks the phrase, and names the article.', capKey: 'marks the phrase' },
  { id: 'rules', v: 'v07', vAt: 0.55, extra: 1.35,
    cap: 'Six rules. Four banned practices, and two that need evidence.', capKey: 'Six rules' },
  { id: 'decoy', v: 'v08', vAt: 0.55, extra: 0.80,
    cap: 'It stays quiet when the words are ordinary. Green tea is not a green claim.', capKey: 'Green tea' },
  { id: 'install', v: 'v09', vAt: 0.55, extra: 0.55,
    cap: 'One bookmark, any product page. No account, no extension.', capKey: 'One bookmark' },
  { id: 'privacy', v: 'v10', vAt: 0.55, extra: 0.45,
    cap: 'The page text never leaves the browser. That is what makes it safe on a checkout page.', capKey: 'never leaves the browser' },
  { id: 'receipts', v: 'v11', vAt: 0.55, extra: 0.45,
    cap: 'Thirteen saved pages. Three findings, all reviewed. A pilot, not a survey.', capKey: 'Three findings' },
  { id: 'limits', v: 'v12', vAt: 0.55, extra: 0.55,
    cap: 'It cannot see images, it does not judge the product, and it reads English only.', capKey: 'images' },
  { id: 'end', v: 'v13', vAt: 0.65, extra: 2.90,
    cap: 'The directive already names the words. Claim Check shows you where they are.', capKey: 'where they are' },
];

// Neptune-style running clock: every scene starts where the last voice line, its
// tail and its hold end. Nothing is hand-typed twice.
let t = 0;
export const SCENES = RAW.map((s) => {
  const dur = HEAD + VDUR[s.v] + TAIL + s.extra;
  const out = { ...s, t, dur, voiceAt: t + s.vAt, voiceEnd: t + s.vAt + VDUR[s.v] };
  t += dur;
  return out;
});

export const DUR = +t.toFixed(3);

// Scene boundaries drive the dot wipe and the score's section changes.
export const CUTS = SCENES.slice(1).map((s) => s.t);

// Stamps: the film's hit points. The score and the foley read these.
export const HITS = {
  hook: 2.65, three: [2.10, 3.35, 4.60], decoy: [1.90, 6.10], end: 2.20,
};
