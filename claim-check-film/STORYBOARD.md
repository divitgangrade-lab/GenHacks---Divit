# Storyboard — every exhibit, second by second

Timings are the film's own (`timeline.json`), not intentions. 30 fps, 3480 frames, 115.995 s.

| # | In–out | Frame does | On screen | Sound |
|---|---|---|---|---|
| 01 | 0.00–9.80 | Hook. Paper, then the claim types itself out at 15 characters a second; at 2.65 a stamp slams across the top right, flash and shake; the citation draws under it at 3.2 | `Biodegradable formula.` · `ANNEX I, POINT 4a · DIRECTIVE (EU) 2024/825` | 26 typewriter ticks; music cuts to silence at 2.30; stamp boom at 2.65; paper at the cut |
| 02 | 9.80–16.88 | Title. Letters drop in one by one, 0.035 s apart; subtitle and the two italic lines follow; a blue `CASE FILE` stamp lands at 12.2 | `CLAIM CHECK` · `the sentence · the rule · the article` | pad + marimba figure; stamp |
| 03 | 16.88–30.28 | The law. Date block, red rule, then three ticks arriving at 18.5, 20.8, 23.3; each with a check stroke and two lines of text | `27 SEP 2026` · `generic green claims / stock already on shelves / no proof, no claim` | bass and hats enter; tick per row; paper at the cut |
| 04 | 30.28–41.48 | Three exhibits. Cards rise 26 px in sequence; each gets a red BANNED stamp at 32.4, 33.6, 34.9 | `eco-friendly` · `climate neutral` · `biodegradable`, each with its Annex I point | three stamp hits, panned left to right |
| 05 | 41.48–51.69 | The page as evidence. Screenshot of the demo page in a paper frame, 1.05 push over the shot; a red rectangle draws around the findings column from 43.0; counts appear at 48.5 | `The page, read in the browser.` · `4 banned / 2 need evidence` · `THE DEMO PAGE · SYNTHETIC COPY WRITTEN FOR THIS FILM` | room tone; paper; soft click on the rectangle |
| 06 | 51.69–61.54 | Anatomy. One finding, re-typeset at reading size; the phrase is marked at 52.6; three numbered callouts at 53.5, 54.9, 56.3; leader line drawn 54.9–55.6; the evidence block at 58.1 | `the sentence / the rule / the article` · `WHAT WOULD SATISFY IT` | leader tick; paper; music thins for the voice |
| 07 | 61.54–68.69 | Six rules. Six cards, 0.16 s apart, each with a BANNED or NEEDS EVIDENCE chip and its citation | `Six rules, each one cited.` | full kit; card snaps on each entry |
| 08 | 68.69–76.58 | The decoy. The ordinary line, then a blue `NOT A CLAIM` stamp at 70.6; the second line marks `green` at 73.8 and takes a red BANNED at 74.8 | `Green tea is not a green claim.` | two stamps, the second harder; silence before it |
| 09 | 76.58–82.83 | Install. The button is dragged from the page to a bookmarks bar (77.4–79.0), lands, and the panel appears beside it; the three promises arrive at 79.8 | `Drag it once.` · `No account. No extension.` | drag whoosh, slide, landing click |
| 10 | 82.83–90.66 | Privacy. A sealed envelope, then three chips — no upload, no account, no analytics — each struck through 0.4 s after it lands | `Nothing does.` · `Sealed in the tab.` | paper; three pencil strikes |
| 11 | 90.66–99.56 | Receipts. 13, 3, 23.1%, 0 arrive in sequence; thirteen squares fill, three red, one tick per square; the limit line at the end | `Thirteen pages.` · `A pilot, not a survey.` | tick per square; full kit |
| 12 | 99.56–106.96 | Limits. Three rows on hairlines, each with what the tool cannot do; the legal disclaimer last | `Images / The product / Language` · `AND IT IS NOT LEGAL ADVICE` | pad only; no percussion |
| 13 | 106.96–116.00 | End. The line lands, then the two URLs, the FILED stamp at 108.8, and the small print | `A check, not a rewrite.` · demo + repo URLs | cadence, final stamp, tail |

## Per-frame rules applied

- One idea per exhibit, no page headers; the heading is part of the layout.
- Nothing flies, bounces or scale-pops except the stamps (a physical slam) and the per-character headline drop.
- Every cut is a dot wipe on a 0.26 s half-window; the hard cut is kept for the stamps, as the style's contrast tool.
- Caption holds ≥ 1.8 s and never shorter than the spoken line + 0.6 s; the caption is the spoken line, one line, one gold keyword.
- Nothing on screen is less than 26 px at 1080p (52 px at 4K), so it survives a phone embed.
- Text that must be read sits still for at least (letters ÷ 15 + 1.5) s.

## What was cut from the first draft

- A "50-component showroom" beat: it diluted the argument and belongs on the Devpost page, not in the demo film.
- A fourth law tick ("enforcement varies by member state"): true, but the frame already carried three facts and the voice did not mention it.
- A closing "made with React Bits" credit line: the showroom is not in this film, so the credit would mislead.
