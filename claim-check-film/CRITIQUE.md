# Critique of the rendered film

Reviewed on frames pulled from the master (`claim-check.mp4`), at 39.9, 40.1, 44, 47, 56, 57, 66, 74, 79.8, 81, 89, 95, 98, 112 s, plus the join points at 40 s and 80 s.

## What works

- **The argument is visible without sound.** Each exhibit can be read cold: sentence, rule, article. A judge who watches muted still gets the product.
- **The paper holds up at 4K.** The halftone screen, the fold and the vignette read as print rather than as a filter, and the type has enough weight to survive a phone-sized embed.
- **The caption bar earns its place.** One line, one gold keyword, no second language competing with the picture.
- **The joins are invisible.** 40.0 and 80.0 are mid-shot and the concat is clean; no black frame, no repeat, no colour shift.

## What was wrong, and what changed

| Severity | Problem | Fix |
|---|---|---|
| High | The decoy's `NOT A CLAIM` stamp landed on top of "green beans", so the sentence could not be read | card narrowed, line set at 34 px, stamp moved clear of the card to the right |
| High | The caption bar covered the product exhibit's legal label ("synthetic copy") | label moved into the right-hand column, where it is now part of the layout |
| High | The product exhibit's red rectangle swallowed the panel's own "4 banned claims…" line | rectangle shortened to start below it; the count is restated in the column instead |
| Medium | Anatomy frame was top-heavy: card and callouts clustered in the upper half, a third of the frame empty | quote card enlarged, callouts dropped 30 px, the "what would satisfy it" block given its own rule and room |
| Medium | The leader line crossed the quoted sentence | it now leaves the card at its lower edge and rises to the rule |
| Medium | The install frame had a dead half: the panel floated with nothing explaining it | two italic lines added — "The panel opens on the page, with every finding in it." |
| Low | Scene 4's three cards briefly showed one stamp at the frame edge | stamp centres moved inward by 10 px |

## Scores (design heuristics, 0–4, for a 2-minute demo film)

| Heuristic | Score | Note |
|---|---|---|
| Visibility of state | 4 | Every finding says what it is, where it comes from, and what would satisfy it |
| Match to the real world | 3 | Case-file metaphor is deliberate; a viewer who has never seen a dossier still reads stamps and exhibits |
| User control | n/a | It is a film, not an interface |
| Consistency | 4 | One palette, three faces, one stamp grammar, one caption form |
| Error prevention | 4 | The law is stated with its exception; the demo is labelled synthetic; the sample's limits are on screen |
| Recognition over recall | 3 | The citation repeats in the HUD only as a case number; the Annex point is on the finding itself |
| Flexibility | n/a | — |
| Aesthetic and minimalist design | 4 | One idea per exhibit, no decoration that is not apparatus |
| Error recovery | n/a | — |
| Help and documentation | 3 | The end card carries both URLs; the "what it will not do" beat does the work a help page would |
| **Total** | **25/28** (n/a excluded) | Strong for a demo film; the weakest area is the metaphor's accessibility, which is a deliberate trade |

## The three things I would still change with another day

1. **The install frame is the least legible.** The panel is a 240 px-wide screenshot inside a 4K frame; its small print is deliberately evidence-sized, but a first-time viewer learns the panel's contents from the two lines beside it rather than from the panel. A second capture at a larger type size, or a re-typeset excerpt, would fix it.
2. **The anatomy frame's empty left margin.** The quote card could be wider (a 1,100 px card with the sentence on three lines) so the exhibit fills its third of the frame.
3. **No sound design on the title letters.** The per-character drop is silent; a soft paper tick per glyph would tie it to the print grammar.

## Second pass — playback, delivery and legibility

Five things came back from the first delivery; all five are now in the master.

| Reported | Cause | Fix |
|---|---|---|
| "This video's format can't play here" | the first master was full-range `yuvj420p` at 4K, a combination some players refuse | both masters are re-encoded once from the frame sequence: H.264 High, `yuv420p`, limited range, BT.709, `faststart`, AAC-LC. The 4K also re-encoded a second time after the first attempt decoded with errors; the shipped file decodes with zero errors |
| The audio is flat | the take was `bm_george` at 0.95 — a neutral read | re-recorded as `bm_fable` at 0.80, then processed for emphasis: 80 Hz high-pass, presence at 2.1 kHz and 4.8 kHz, a differentiated-signal bite on the consonants, soft saturation, a parallel compressor under it, and phrase-level contrast so stressed words sit above the rest. No word is changed |
| The dot field at 0:11 has a hard rectangle | the field was clipped to its bounding box | it is now drawn per dot with an elliptical falloff, so dots shrink and fade into the paper at every edge and the shape has no corners |
| The checkmarks at 0:19–0:24 looked wrong | two hand-placed strokes with square caps and the wrong proportions | redrawn as a proper tick — short arm, long arm, round caps and joins, drawn on over 0.55 s |
| The install panel is unreadable | the whole 1146×2982 capture squeezed into 240 px | an excerpt of the capture (top 1560 px) at 452 px wide, roughly 40% of the original, with a bottom fade so it reads as a scroll rather than a crop, labelled `EXCERPT · THE LIST CONTINUES` |

The length moved from 116.0 s to 117.1 s because the new take is 1.1 s longer; every scene start, the SRT and the board were regenerated from the measured durations rather than retyped.

### Still not checked
- I still cannot hear the mix. The emphasis chain was checked numerically (integrated loudness −14.0 LUFS after mastering, true peak −1.2 dBTP, no clipping) and by inspection of the filter chain, not by ear.

## Not checked

- I did not watch the film in real time, and I cannot hear it. The mix was checked numerically (integrated loudness −13.9 LUFS, no clipping, voice above music) and the frame timing by contact sheet, not by ear.
- No subtitle sync review against the final audio beyond the durations the TTS reported.
