# GenHacks 2026 submission pack

Deadline: 26 December 2026, 12:00am EST. This file is the copy to paste into Devpost, plus the shot list for the demo video. Nothing here is recorded yet. Field-by-field paste-in copy, tags, links and the gallery images are in [DEVPOST.md](DEVPOST.md).

## Track

**Healthcare & Environmental** (the Devpost track is a single combined track; this project sits on the environmental side).

Why this track: the project exists because Directive (EU) 2024/825 bans generic environmental claims in consumer advertising. It does not claim a health outcome. It gives a shopper a concrete, cited check on the environmental wording in front of them, which is the consumer-protection half of the track.

Do not select Open: the environmental fit is direct and specific.

## Devpost short description

> Claim Check marks the environmental claims that EU Directive 2024/825 now bans, right on the product page you're shopping on, and names the article each one breaks.

(164 characters.)

## Devpost long description

### Inspiration

On 27 September 2026, Directive (EU) 2024/825 blacklisted generic environmental claims across the EU: "eco-friendly", "climate neutral", "biodegradable", the word "green" used as a product claim, and others. The ban applies to stock already on shelves. The law is specific about the words, but a shopper standing on a product page has no practical way to check them.

We wanted the check to happen where the claim is, not on another website. That meant a bookmarklet, a client-side scan, and a panel that quotes the sentence and the article instead of producing a vague score.

### What it does

Claim Check reads the visible text of a product page in the browser and lists the claims that match the directive. Each finding shows:

- the surrounding sentence, with the matched phrase marked;
- the plain-English rule it breaks;
- the Annex I point or article, and the evidence that would make the claim lawful.

The demo page runs the same scanner on a synthetic product card and shows 4 banned claims and 2 claims needing evidence. A bookmarklet runs it on any live product page. Nothing is uploaded: the page text stays in the browser, including on a checkout page.

The rule set has six rules: four banned practices (generic claim, the same promise in other words, "green" as a product claim, neutrality claims resting on offsets) and two that need evidence (a future promise with no published plan, a sustainability label with no named scheme).

### How we built it

The scanner is pure JavaScript: text in, findings out, no DOM and no network. Page text comes through one contract with two adapters, one for a live DOM and one for saved HTML, so the bookmarklet and the offline corpus cannot disagree about what counts as page text. Both adapters share one skip definition, so regions marked `data-scan-skip` are ignored by both.

The rules are data in `src/rules.js`: pattern, citation, plain-English reading, and the evidence that would satisfy it. The demo and the bookmarklet share the same renderer logic through small separate entry points; the panel is mounted in a shadow root so a shop's CSS cannot restyle or break it.

The claim that this is not a keyword grep is machine-checked. The Recital 9 and Recital 12 sentences are vendored in `src/recitals.js`; the test parses the quoted examples out of that text and fails if a rule claims a phrase the directive does not contain, or if the directive names a phrase no rule covers. There are 55 assertions, including ordinary uses of the same words ("green tea", "green beans", "ecosystem") that must stay quiet.

We also ran the scanner over a fixed, dated sample of 13 saved product pages: 10 shop pages and 3 EU Ecolabel pages kept as a false-positive control. Ten shop pages produced no findings; all three certified pages carried "Biodegradable formula", which Recital 9 names and which the sentence does not substantiate. All three findings were reviewed in context and judged true positives. That is a 23.1% page hit rate and 0 of 3 reviewed false positives. The sample is a pilot, not a survey: it is small, brand-skewed, and six of the ten shop pages are US pages outside the directive's jurisdiction. The report states that limit itself.

The repo also contains a 50-component React Bits motion showroom, built for the visual side of the submission. The checker does not depend on it.

### Challenges we ran into

- **Bookmarklets and CSP.** Some shops block injected module scripts. The bookmarklet now leaves a short notice linking back to the demo instead of failing silently. A policy that blocks `javascript:` URLs outright stops any bookmarklet, which no page can work around.
- **One definition of page text.** The browser and the saved-page reader had to agree on hidden text, nested skip regions, self-closing tags and entities. Cross-adapter tests and a shared skip definition keep them aligned.
- **Not over-flagging.** "Green" is an ordinary word. The rule only fires when it is attached to a product, purchase or company, and the tests hold the line on tea, beans, greenhouse gas and ecosystems.
- **The certification control backfired in a useful way.** We expected the EU Ecolabel pages to read cleanly. They did not. A certification badge did not stop the generic wording, which is itself a finding.

### Accomplishments that we're proud of

- A finding is arguable in public: it shows the sentence, the exact phrase and the citation.
- The directive's own recital text is the source of truth for the phrase list, and the test enforces both directions.
- The scanner is dependency-free, works offline over saved HTML, and runs on a live page without a backend or an API key.
- The corpus is dated, hashed and honest about what 13 pages can support.

### What we learned

A legal rule can be a better product constraint than a model. Because the directive names the phrases and the citations, the hard part is not classification; it is reading the page the way a person does, showing enough context to be challengeable, and refusing to flag ordinary language.

We also learned that a small sample can reverse an assumption. The certified pages were meant to be the clean control; they became the only pages with findings.

### What's next

- A larger, pre-registered corpus (100 to 200 pages) across more EU shops and languages.
- A rule editor so a lawyer can add a phrase without touching code.
- Image and badge text, which a text scanner cannot see.
- Localisation for the languages the directive will be enforced in.

### Try it

Live demo: https://divitgangrade-lab.github.io/GenHacks---Divit/

Drag **Check this page** from the demo to the bookmarks bar, open a product page, and click it. The repo's README has a five-step testing path.

### Built with

JavaScript, ES modules, Shadow DOM, CSS, Node.js (tests), GitHub Pages. The optional motion showroom uses Vite, React and React Bits.

## Demo video shot list (2:30 target, 2:00–2:45 acceptable)

Record on a real product page that sells into the EU, not the demo. The page used in the corpus run is UK, so it is a fallback rather than the ideal subject:

`https://uk.ecover.com/products/dishwashing/wrapper-free-all-in-one-dishwasher-tablets/`

It carried "Biodegradable formula." when saved on 21 November 2026, and the UK is outside the directive. If you record that page, caption it as a UK page and say the same wording is banned for EU sales; do not imply the UK page itself is unlawful. Prefer an EU-facing Ecover or other shop page carrying the same phrase.

**Pre-flight before recording:** open the live page, confirm it sells into the EU (euro pricing or EU delivery) and that a blacklisted phrase is still present, then note the URL and date. If the wording has changed, pick another live EU-facing product page that carries one of the rule phrases. Do not record the demo as if it were a shop, and do not use a saved snapshot and call it live.

### Before you hit record

- 1920×1080 or 2560×1440, browser at 100–125%, bookmarks bar visible with only **Check this page**.
- Close the Claim Check panel from any earlier run; clear extensions and notifications.
- Have the real product page in tab 1, a clean product page in tab 2, and the demo in tab 3.
- Confirm the demo shows 4 banned + 2 needing evidence, and that each finding shows a sentence with one marked phrase.
- Capture the live page's claim in a still before recording, so the edit can cut to it if the page changes mid-shoot.

### Beats

**0:00–0:12 — Cold open on the claim.**
Picture: the real product page, scrolled so the claim ("Biodegradable formula." on the Ecover page) is centred. Slow push-in; no panel yet.
VO: "This sentence is live on a product page. For a shop selling into the EU, it has been illegal since 27 September 2026."

**0:12–0:25 — Title and problem.**
Picture: title card over a dimmed page: **Claim Check — the claim, the sentence, the article.**
VO: "Directive 2024/825 bans generic green claims unless the seller can show recognised excellent environmental performance. Shoppers have no practical way to check that."

**0:25–0:45 — The demo is the proof of output, not the product.**
Picture: demo page, Findings panel. Highlight finding 1: the full sentence with **eco-friendly** marked; then the rule title and "Annex I, point 4a". Scroll once to show the other five findings.
VO: "Claim Check quotes the sentence, marks the exact phrase, and names the rule and the evidence that would make it lawful. Four banned claims and two that need evidence on this card."

**0:45–1:00 — Not a keyword grep.**
Picture: quick cuts: `src/rules.js`, the vendored recital text in `src/recitals.js`, terminal `npm test` ending **55 passed, 0 failed**.
VO: "The phrase list is checked against the directive's own Recital 9 and 12 text. A phrase cannot be added to a rule without appearing in the directive, and a phrase the directive names cannot be left uncovered."

**1:00–1:12 — Install.**
Picture: demo page, cursor drags **Check this page** to the bookmarks bar; close-up of the new bookmark.
VO: "It installs as a bookmarklet. No account, no extension, no permissions prompt."

**1:12–1:55 — The real page.**
Picture: switch to the live product-page tab. Click the bookmark. Panel appears; scroll/focus to the "Biodegradable formula." line as the panel shows the same sentence with **biodegradable** marked. Hold on the rule title "Generic environmental claim", citation "Annex I, point 4a", and the evidence line. Close the panel once.
VO: "One click on the live page. The panel reads the page in the browser, finds the sentence, marks the word, and cites the article. The page text never leaves the browser."

**1:55–2:10 — The negative case.**
Picture: clean product page tab (or the demo's decoy line). Click the bookmarklet; verdict reads "No banned or unsubstantiated environmental claims were found on this page." Then cut to the demo line "Pairs well with green tea and green beans" with no finding, while "go green" is highlighted.
VO: "It stays quiet when the words are ordinary. Green tea is not a green claim. Ten shop pages in the dated run produced no findings."

**2:10–2:25 — The number and its limit.**
Picture: `corpus/report.md` or the rendered table: 13 pages, 3 flagged, 23.1%; 0 false positives after review; then the line "pilot, not a survey".
VO: "Thirteen saved pages, three findings, all reviewed as true positives. It is a pilot, not a survey: small, brand-skewed, and six shop pages are outside the EU. The report says so."

**2:25–2:40 — Close.**
Picture: demo URL and repo URL on screen; end card: **Claim Check — a check, not a rewrite.**
VO: "The directive already names the words. Claim Check shows you where they are, and what would make them lawful. Live demo and source are in the submission."

### Edit notes

- Keep the live-page click and the panel appearing in one unbroken shot; that is the proof.
- Zoom the sentence and the citation to at least 125% for legibility on a phone.
- Burn in captions for the quoted claim and the citation; do not rely on the viewer's audio.
- Do not add a fake "before/after" of the shop page. The only edit inside the page shot is a cut to the pre-captured still if the live wording changes.
