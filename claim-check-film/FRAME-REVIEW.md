# Frame-by-frame review and repair

**Method.** Two frames per exhibit — an early beat and the settled end state — pulled from the 1080p master: 26 frames, reviewed as three contact sheets, plus four full-size frames (product, anatomy, decoy, install) where the type is dense enough that a 640 px thumbnail hides defects. Nothing was reviewed from memory; every claim below is from a frame.

**Scope rule.** A change is made only for a defect, never for taste. Where a frame is merely *quiet* (empty paper), that is the style and it stays.

## Findings, exhibit by exhibit

| # | Exhibit | What was wrong | Action |
|---|---|---|---|
| 01 | Hook | None. The cursor, the stamp and the citation read correctly; the empty lower half is the pause before the stamp. | no change |
| 02 | Title | The dot field had a hard rectangular edge (already fixed in the previous pass, confirmed here). The `CASE FILE` stamp sits on the dot field but stays legible. | no change |
| 03 | The law | The decorative dot band in the lower right ended in a visible rectangle of dots. The three ticks are correct. | band feathered |
| 04 | Three exhibits | None. Cards, numbers, chips and stamps are aligned; the stamps sit inside their cards. | no change |
| 05 | The page | (a) The red findings rectangle started 56 px inside the column and cut through “4 banned claims…”; (b) its bottom edge grazed the “55 words scanned…” footer; (c) the synthetic-copy labels sat on top of the dot band. | rectangle re-framed, labels lifted, band feathered |
| 06 | Anatomy | The red leader was a long diagonal that began inside the quote card and ended on the “02” numeral — it read as a scratch across the composition, not as apparatus. | leader deleted |
| 07 | Six rules | Card 3 used straight quotes (`"Green"`) where the rest of the film sets curly ones. The bottom dot band had a hard edge. | quotes corrected, band feathered |
| 08 | The decoy | The red `BANNED` stamp landed on “without thinking”, covering the end of the sentence it was stamping. | stamp moved outside the card and down beside the citation line, clear of the sentence |
| 09 | Install | The dragged `CHECK THIS PAGE` chip crossed the italic line “The panel opens on the page,” for ~1.5 s. | lines moved below the flight path |
| 10 | Privacy | None. The strike-through overshoots each chip by 8 px, which reads as a pencil mark, not a bug. | no change |
| 11 | Receipts | Dot band edge only. | band feathered |
| 12 | Limits | None. | no change |
| 13 | End | None. | no change |

**Verified on the finished masters:** 1:57.10, 3840×2160 and 1920×1080, 30 fps, `yuv420p` BT.709, 0 decode errors on both, −14.0 LUFS, 0 black frames; re-checked frames at product, anatomy, decoy, install, rules and receipts.

Continuity: no change touches timing, motion, colour or exposure — every fix is static geometry inside one exhibit, so nothing can drift or flicker across cuts.

## /debate — what was worth doing

| # | Proposal | For | Against | Verdict |
|---|---|---|---|---|
| C1 | Re-frame the product rectangle | It bisects a sentence; a frame that cuts text reads as a rendering bug in a film that claims to be precise | Moving it left could cover the page's own column header | **keep** — frame the header too (`by = y+42`), inset left edge to the column divider |
| C2 | Feather the dot bands | Six exhibits show a rectangle of dots with a machined edge | The bands are meant to hug the page edge; feathering all four sides would detach them and float a blob | **keep, revised** — fade only edges that meet paper, never edges that meet the frame |
| C3 | Move the decoy stamp outside the card | It covers the sentence; the first stamp is already outside, so the pair becomes consistent | A stamp outside the card could read as marking the page rather than the line | **keep** — the citation label inside the card still binds it to the sentence |
| C4 | Move the install italics below the drag path | The chip crosses the text, which looks like a layering mistake | Lower text crowds the “No account.” block | **keep** — 706/748 leaves a 42 px gap to 800 |
| C5 | Delete the anatomy leader | It looks like a scratch and points at a numeral, not at a fact | Loses a piece of apparatus that ties quote to rule | **keep** — the numbered callouts already carry that relation |
| C6 | Curly quotes in the rule set | Typographic consistency in a print-styled film | Touches a card people read once | **keep** — one-character fix, zero risk |
| C7 | Nudge the title's `CASE FILE` stamp off the dot field | Less busy | It is legible and the overlap is deliberate layering | **reject** — churn, no measurable gain |
| C8 | Fill the hook's empty lower half | Composition | That emptiness is the beat before the stamp; filling it removes the pause | **reject** — changes intent |
| C9 | Add a provenance label under the anatomy card | Fills empty paper | It states a fact the film never establishes on screen | **reject** — would invent evidence |

## /critique — objections, and what changed

- **“Your rectangle will now cover the column header.”** True at first draft. Moved the top edge above the header (`y+42`) and re-checked on a still: the header sits inside the frame, unclipped.
- **“Feathering every band will make them float off the page edge.”** Right, and that would be worse than the hard edge. Rewrote the band renderer so a side that touches the frame keeps its hard edge; only sides facing paper fade. Verified on the law, product, anatomy, rules and receipts frames.
- **“The decoy stamp outside the card now crowds ‘thinking.’”** Caught on the post-fix still — the stamp's border came within 12 px of the final period. Nudged 40 px right; re-checked.
- **“Your rectangle's bottom edge now crosses the footer.”** Also caught on the still. Shortened the height by 12 px so it lands in the gutter above “55 words scanned…”.
- **“Moving the install text down leaves the lower left heavy.”** Accepted: the alternative (shortening the drag, or moving the text right) damages the drag metaphor, which is the exhibit's whole point. The text now sits at 706/748, directly under the flight path, and reads as a caption to it.
- **“Deleting the leader removes the only line connecting the quote to the rule.”** Accepted loss. The three numbered rows are a list about the card above them, and the voice says the connection; a bad line is worse than no line.
- **“Over-processing risk: the dot bands now fade, the title field fades — does the film lose its printed edges?”** No: every band that touches a frame edge still runs to that edge at full density. Only the interior boundaries dissolved, which is what a real halftone does when it runs out of ink.

## /grill-me — hard questions, answered

**Q. Are you sure the red rectangle is a defect and not the product's own highlight?** The rectangle is drawn over a screenshot of our checker; inside that screenshot the column has its own padding and its own red rule. A second red rectangle cutting a headline is our drawing, not the product's, and no designer draws a frame through a sentence. Defect.

**Q. Is the decoy stamp's position a style choice?** No — it lands on the word “thinking”, which is content. Stamps may overlap the *card* for energy; they may not delete words.

**Q. What if the audience is watching at 360p in a Devpost embed and none of this is visible?** Then the fixes cost nothing and the 1080p copy carries them anyway; the rectangle and the stamp are visible even at 360p, because they move *over text*.

**Q. What could go wrong with the band feathering?** It could make the paper look dirty or foggy where bands meet margins. Mitigated by feathering over 64 px and by lowering per-dot alpha with the fade; checked on five frames, and the bands still read as ink at the frame edges.

**Q. Are you assuming the film is watched start-to-finish?** No. Each exhibit is built to be read cold, which is why the fixes target legibility inside a single frame rather than transitions. This is also why I did not add anything that only pays off in sequence.

**Q. Could the install text move break the reading order (bar → chip → panel → text)?** The text now sits *under* the chip's path, so the eye goes bar, chip, then the caption beneath it, then the panel on the right. That is a better order than before, when the chip flew through the caption.

**Q. Is anything here changing the film's argument?** No. No claim, number, citation or caption was touched. Every change is position or typography inside an existing frame.

**Q. What are you not fixing, and why?** The product screenshot's own small type (it is evidence at evidence scale, and enlarging it would break the page's proportion), the empty paper in the hook and the end card (deliberate), and the privacy strike-through overshoot (reads as hand-drawn).

## Applied

Seven code changes in `film.js`, all geometry or typography; timings, narration, score and captions untouched:

1. `halftone()` fades on any side that meets paper, holds a hard edge on any side that meets the frame.
2. Product: findings rectangle → `x+412`, `w 528`, `y+42`, `h 636`.
3. Product: synthetic-copy labels → 736 / 760.
4. Decoy: `BANNED` stamp → `x + w2 + 170`, `y2 + 150` (outside the card, below the sentence, beside the citation).
5. Install: italic lines → 706 / 748.
6. Anatomy: leader removed.
7. Rules: `“Green”` set with typographic quotes.
