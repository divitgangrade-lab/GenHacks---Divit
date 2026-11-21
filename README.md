# Claim Check

**Marks the environmental claims that are now illegal, on the page you are shopping on.**

Since 27 September 2026, Directive (EU) 2024/825 has blacklisted generic green claims across the EU. "Eco-friendly", "climate neutral", "biodegradable" and the word "green" itself are banned unless the seller can show recognised excellent environmental performance. The rules apply to stock already on shelves, not just new products.

Yet most shop pages still carry them. Claim Check reads the page, finds those claims, and names the rule each one breaks and the evidence that would make it legal.

## Why this, and not another carbon calculator

- **The rule already exists.** No estimation, no emission factors to argue about: a specific law names specific phrases, with a citation each.
- **The failure is visible in one second.** One click on a real product page and the claims light up.
- **It runs client-side.** The page text never leaves the browser, so it is safe on a checkout page.
- **It is a check, not a rewrite.** Every finding quotes the exact words and the article, so a reader can disagree with it in public.

## How it works

```
src/rules.js   the rule set: pattern, plain-English reading, citation, evidence
src/scan.js    pure functions: text in, findings out (no DOM, no network)
src/panel.js   renders findings into a shadow root, immune to page CSS
report.js      bookmarklet entry: scan the page you are on
app.js         the demo page
tests/run.mjs  14 assertions against the scanner
```

The split matters: the decision layer is pure and testable, and the two renderers (inline in the demo, floating panel on a live page) share it.

## Run it

No build step, no install, no key.

```bash
npm test          # 14 assertions
npm run serve     # http://localhost:3000
```

Drag **Check this page** from the demo onto your bookmarks bar, then click it on any product page. The bookmarklet loads `report.js` as a module from wherever the site is served, so it needs no store listing and no permissions prompt.

## What it will not do

- **It cannot see images.** A leaf logo with no text is invisible to it, and soft claims like "kinder to the planet" are not in the blacklist yet.
- **It does not judge the product.** It flags wording, not facts: a page can break the rules while being genuinely green, and the reverse is also true.
- **It is English-only, and EU-only.** The UK and US have different regimes.
- **It is not legal advice**, and it does not know whether a national authority has started enforcing.

These are limits of a text check, not bugs to fix later.

## Next

- A rule editor so a lawyer can add a phrase without touching code.
- Flag a page's claim density across a whole category, to show which brands lean on wording instead of evidence.

Sources: [Directive (EU) 2024/825](https://eur-lex.europa.eu/eli/dir/2024/825/oj/eng) and the [Commission's Q&A](https://commission.europa.eu/document/download/3c257883-bb2a-4dd9-a6dc-501d587bb34f_en).

Built for GenHacks 2026. Written with AI assistance (Freebuff).
