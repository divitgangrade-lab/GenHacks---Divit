# Claim Check

**Marks the environmental claims that are now illegal, on the page you are shopping on.**

Since 27 September 2026, Directive (EU) 2024/825 has blacklisted generic green claims across the EU. "Eco-friendly", "climate neutral", "biodegradable" and the word "green" itself are banned unless the seller can show recognised excellent environmental performance. The rules apply to stock already on shelves, not just new products.

Yet many shop pages still carry them. Claim Check reads the page, finds those claims, and names the rule each one breaks and the evidence that would make it legal.

## Why this, and not another carbon calculator

- **The rule already exists.** The law names the phrases, so there are no emission factors to argue about. Each rule carries its citation.
- **The failure is visible in one second.** One click on a real product page and the claims light up.
- **It runs client-side.** The page text never leaves the browser, so it is safe on a checkout page.
- **It is a check, not a rewrite.** Every finding quotes the exact words and the article, so a reader can disagree with it in public.

## How it works

```
src/rules.js   the rule set: pattern, plain-English reading, citation, evidence
src/scan.js    pure functions: text in, findings out (no DOM, no network)
src/text.js    page text: one skip definition, a DOM adapter and a bytes adapter
src/corpus.js  the counting rules for a corpus run
src/escape.js  HTML escaping, shared by both renderers
report.js      bookmarklet entry: reads the page, renders the panel in a shadow root
app.js         the demo page, and its own renderer
showroom/      the 50-component React Bits showroom (Vite + React, its own deps)
motion/        the showroom's built output, committed for GitHub Pages
tests/run.mjs  49 assertions against the scanner, page text and the corpus script
scripts/corpus.mjs  the same scanner over a folder of saved product pages
```

The decision layer is pure and testable. The demo page and the floating panel share it, through two small renderers.

### Marking commentary out of a scan

Text that quotes a banned phrase on purpose — this site's own rule table, a review, another checker — can be put inside an element marked `data-scan-skip`. Both readers drop that element and everything inside it, so the scan reports the product, not the commentary:

```html
<section data-scan-skip>
  <p>"Our eco-friendly bottle is carbon neutral." — quoted in a review</p>
</section>
```

Nothing has to be marked on a shop page: an unmarked page is read in full. The same skip list also drops `script`, `style`, `noscript`, `template`, `svg`, `iframe` and `hidden` elements, so markup and invisible text are never counted.

### The motion showroom

`showroom/` is a separate Vite + React app holding 50 React Bits components, fetched as source from the registry and mounted one per tile. Build it with `npm run build:showroom`; the output in `motion/` is committed so GitHub Pages serves it without a build step. The 50 component files in `showroom/src/components/` are vendored as fetched from the React Bits registry under the MIT + Commons Clause License Condition v1.0, copyright © 2026 David Haz, and are used as fetched rather than rewritten. That licence is not the repo's MIT licence: the Commons Clause forbids selling, sublicensing or redistributing the components themselves, alone, in a bundle or as a ported version, which is why they are included only as part of this demo application. The full text sits in `showroom/src/components/LICENSE.md` and in the built site at `motion/react-bits-LICENSE.txt`.

## Run it

The Claim Check page itself is still dependency-free: `index.html`, `styles.css`, `app.js`, `report.js` and `src/` are plain ES modules, with no build step and no key. `npm test`, `npm run serve` and `npm run corpus` need Node and nothing else.

The motion showroom is the exception. It is a Vite + React app in `showroom/` with its own dependencies:

```bash
npm install              # once, for the showroom only
npm run build:showroom   # writes motion/
npm test          # 49 assertions, no dependencies needed
npm run serve            # http://localhost:3000
npm run corpus           # hit rate over saved pages, see below
```

`package-lock.json` is committed, so `npm ci` reproduces the same dependency tree. The built `motion/` output is committed as well: after editing the showroom, rebuild it, or Pages keeps serving the old bundle.

Drag **Check this page** from the demo onto your bookmarks bar, then click it on any product page. The bookmarklet loads `report.js` as a module from wherever the site is served, so it needs no store listing and no permissions prompt. If a shop's Content-Security-Policy blocks that module, the bookmarklet leaves a small notice linking back to the demo instead of doing nothing. A policy that blocks `javascript:` URLs outright stops any bookmarklet before it can speak, which no page can work around.

## What it will not do

- **It cannot see images.** A leaf logo with no text is invisible to it, and soft claims like "kinder to the planet" are not in the blacklist yet.
- **It does not judge the product.** It flags wording, not facts. A page can break the rules while being genuinely green, and a green product can still fail the wording test.
- **It is English-only, and EU-only.** The UK and US have different regimes.
- **It is not legal advice**, and it does not know whether a national authority has started enforcing.

These are limits of a text check, not bugs to fix later.

## Measuring it against real pages

The demo page shows that the scanner works. It does not show how common the claims are, and "most shop pages still carry them" is a claim in need of a number. `scripts/corpus.mjs` measures it: it runs the same rule set over a folder of saved pages and prints the count.

```bash
mkdir -p corpus
# hand-save product pages into corpus/, one file each
npm run corpus              # or: npm run corpus -- corpus --json
```

The method, so the number can be argued with:

1. **Fix the sample before looking at results.** Write the list of pages down first. For example, the first product page of each of 30 EU-facing shops in one category, saved exactly as listed. Dropping a page after seeing what it says turns a hit rate into fiction.
2. **Save the pages by hand.** Use the browser menu, *Save page as*, *Web page, HTML only*, and save into `corpus/`, one file per page, named `NNN-shop-product.html`. There is no crawling and no scraping. The script reads the files from disk and fetches nothing.
3. **Count pages, not findings.** A page counts once if it carries at least one banned claim, however many it has. The per-rule table counts a page once per rule, so it sums to more than the page total.
4. **Skip the unreadable.** The script drops any save under 30 words, which catches a cookie wall or a save that failed halfway, and reports it as skipped rather than as clean. Counting those as clean would flatter the result.
5. **Report the sample with the number.** Say how many pages, from where, saved on what date, and which commit the scanner ran at. The script prints the commit itself.

A saved page and a live page are read by the same definition of visible text, in `src/text.js`: one skip definition (`data-scan-skip`, the panel's own output, `hidden`, and non-prose elements such as `script`, `style`, `svg` and `template`) behind two adapters, `domText` for a live DOM and `bytesText` for a saved file, which share the same contract. The browser walks the text nodes of the page; the corpus has only bytes, so it drops marked regions by tag depth, ignores `<head>` and its `<title>`, strips the remaining tags, decodes entities and collapses whitespace. Both then call the same `scan()`, so the same page gives the same findings either way. The counting rules — a page counts once, a rule counts a page once however often it is mentioned, saves under 30 words are skipped rather than counted clean — live in `src/corpus.js` and are tested.

The number therefore cannot see copy rendered by JavaScript after load, words inside attributes such as `alt` and `title`, text baked into images and badges, pages behind a consent wall, or any language other than English. It is a lower bound on a hand-picked sample, not a survey of EU e-commerce.

The first dated run is in [corpus/report.md](corpus/report.md): 13 pages saved on 21 November 2026 at commit `c015683`, of which 10 were shop product pages and 3 were EU Ecolabel product pages kept as a false-positive control. No shop page carried a banned claim; all three certified pages carried the generic word "biodegradable". All three findings were reviewed in context and judged true positives, so the reviewed false-positive count was 0 of 3. The report states what that small, brand-skewed sample can and cannot support.

## Where the phrases come from

Annex I, point 4a says only that a generic environmental claim is banned without recognised excellent environmental performance. The example phrases are in Recital 9, and the Commission's Q&A quotes that recital verbatim. Every term in `src/rules.js` is one of three things, and the rule says which:

- **Named in Recital 9:** environmentally friendly, eco-friendly, green, nature's friend, ecological, environmentally correct, climate friendly, gentle on the environment, carbon friendly, energy efficient, biodegradable, biobased.
- **Named in Recital 12 for offsetting:** climate neutral, CO2 neutral certified, carbon positive, climate net zero, climate compensated, reduced climate impact, limited CO2 footprint.
- **Covered by "or similar statements":** planet-friendly, earth-friendly, environmentally sound, eco-conscious. These are the closing clause of Recital 9 applied, not phrases the Commission quotes, and the rule is labelled that way.

Wording the directive does **not** blacklist stays out: `sustainable`, `conscious`, `responsible` and `natural` are not flagged, because Recital 10 discusses them without banning them, and tests hold that line.

## Next

- A rule editor so a lawyer can add a phrase without touching code.
- A published corpus run of 100 to 200 saved pages, dated, with the per-rule table, so the hit rate is a number a judge can check.

Sources: [Directive (EU) 2024/825](https://eur-lex.europa.eu/eli/dir/2024/825/oj/eng) and the [Commission's Q&A](https://commission.europa.eu/document/download/3c257883-bb2a-4dd9-a6dc-501d587bb34f_en).

Built for GenHacks 2026. Written with AI assistance (Freebuff).
