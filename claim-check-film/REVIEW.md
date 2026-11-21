# Review of the first storyboard — three readings, then what changed

The plan in `STORYBOARD.md` was reviewed three ways before a frame was drawn: a simplifier (is any of this padding?), an operator (will it render, on this machine, in this time?) and a pentester (what does it claim that it cannot support?). Verdicts below are the ones that survived argument.

## Findings

### CRITICAL — the hook overstated the law

Draft line: "This sentence is live on a product page. For a shop selling into the EU, it has been illegal since 27 September 2026."

The directive bans generic environmental claims **unless** the trader can demonstrate recognised excellent environmental performance. A flat "illegal" turns a conditional ban into an absolute one, and a judge who knows the file will catch it in the first three seconds.

**Fixed:** the narration now says "unless the seller can prove the claim", and the remaining frame never uses "illegal" without the qualifier. The end card's small print names the directive and its application date instead of repeating a verdict.

### CRITICAL — a screenshot can imply a real shop

The film's centrepiece is the demo page. Its product card reads like a shop, and at 4K in a case-file frame it looks like evidence of a real listing.

**Fixed:** the exhibit is captioned on screen, permanently, `THE DEMO PAGE · SYNTHETIC COPY WRITTEN FOR THIS FILM`, and the narration says "the visible text of the page", not "a real page". The real-world evidence stays in the corpus frame, where it is a number with a date attached.

### HIGH — the caption bar rendered empty

The bar's width came from a keyword that no scene defined, so it computed a 68 px pill with no text. Caught on the first contact sheet.

**Fixed:** the caption draws the whole line, keyword or not, and falls back to the full string when the key is absent. Every scene now declares its `capKey`, so the gold word is always the word the beat is about.

### HIGH — a leaked canvas state clipped the title

`textAlign: right` from the HUD survived into the next frame, so each headline glyph was right-aligned at its own x and "CLAIM CHECK" started off-canvas.

**Fixed:** `render(t)` resets align, baseline, letter-spacing, alpha and dash before drawing anything. Every frame is now independent, which is also what the renderer requires of a deterministic `render(t)`.

### HIGH — the panel screenshot was squashed

The bookmarklet panel is 1146×2982; drawing it into a 276×590 box distorted every line of text. It also cropped mid-word at the right edge.

**Fixed:** the panel was re-captured from its own shadow root at device scale 3 and is drawn at its true aspect ratio, with the frame label moved clear of the caption bar.

### HIGH — 4K would not finish in one pass on two cores

A single 3480-frame 4K render is a long, all-or-nothing job on a 2-core box: any restart loses everything.

**Fixed:** the page accepts `?t0=&t1=` and reports a shorter `DUR`, so the film renders in three parts that are concatenated with `-c copy`. Each part is a checkpoint.

### MEDIUM — scene 3 risked a static 12 seconds

The directive line is the longest narration (11.6 s). One date card holding that long breaks the style's "something changes every second".

**Fixed:** three ticks arrive through the scene (18.5, 20.8, 23.3), each with its own check stroke and label, so the frame keeps moving without inventing facts.

### MEDIUM — the decoy needed a second half

Showing only "green tea is not a green claim" leaves a viewer thinking the checker misses the word "green" altogether.

**Fixed:** the same exhibit then marks `green` in "so you can go green without thinking" and stamps it BANNED — the contrast is the argument.

### MEDIUM — the hit rate could read as a survey

"23.1%" with no frame around it invites the reading that a quarter of EU shops are breaking the law. The sample is 13 hand-saved pages, six of them US.

**Fixed:** the receipts frame carries `SMALL, BRAND-SKEWED, SIX PAGES OUTSIDE THE EU` and "A pilot, not a survey", and one false-positive note (`0 of 3 reviewed`) rather than a bare rate.

### LOW — an off-palette green chip

The dragged bookmark button was drawn in a green that appears nowhere else in the film and is not one of the style's inks.

**Fixed:** the button is ink-on-cream until it lands, then cream-on-ink, matching the bar.

## Deleted from the plan

- **The 50-component showroom beat.** A second product inside a 2-minute film splits the argument; the showroom is on the Devpost page, where it can be explored.
- **A fourth law tick** ("enforcement varies by member state"). True, but it is a caveat, not an exhibit, and it competed with the three facts the voice actually says.
- **A React Bits credit line on the end card.** Nothing from that library is in this film, so the credit would be false.

## Verdict

REVISE, then build — every CRITICAL and HIGH finding above is closed in the shipped frames, and the two remaining MEDIUM items are visible in the film rather than hidden in a document.
