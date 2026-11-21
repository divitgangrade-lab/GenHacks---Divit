# Corpus run: 21 November 2026

**13 pages read · 0 skipped · 3 with at least one banned claim (23.1%) · scanner commit `c015683`**

The sample was fixed before the scanner saw any page. Snapshots were captured on 2026-11-21, one file per URL, with the URL, byte count and SHA-256 recorded in [`manifest.json`](manifest.json). The snapshots themselves are third-party content and are not committed; the manifest is the reproducible part of the list.

```bash
npm run corpus -- corpus/pages        # add --json for the full report
```

## Sample

| role | pages | region |
|---|---|---|
| shop product page | 10 | 6 US, 4 EU |
| EU Ecolabel product page | 3 | 3 UK |

| file | role | URL |
|---|---|---|
| 001-allbirds-tree-runner | shop | https://www.allbirds.com/products/mens-tree-runner-nz-medium-grey |
| 002-allbirds-cruiser | shop | https://www.allbirds.com/products/mens-cruiser-medium-grey |
| 003-method-shampoo | shop | https://methodproducts.com/products/shampoo-simply-nourish-14-fl-oz |
| 004-method-body-wash | shop | https://methodproducts.com/products/barrier-supporting-and-microbuffing-body-wash-tonic-bundle-34-fl-oz |
| 005-weleda-skin-food | shop | https://www.weleda.com/product/skin-food-original-ultra-rich-cream-g009398 |
| 006-weleda-skin-food-light | shop | https://www.weleda.com/product/skin-food-light-nourishing-cream-g007756 |
| 007-armedangels-jeans | shop | https://www.armedangels.com/en-eu/products/baarly-high-waist-barrel-jeans-fluid-ink |
| 008-armedangels-knit | shop | https://www.armedangels.com/en-eu/products/ripp-stricktroyer-honey-melange |
| 009-organicbasics-hoodie | shop | https://organicbasics.com/products/womens-weekend-crop-hoodie-misty-grey-melange |
| 010-organicbasics-cardigan | shop | https://organicbasics.com/products/soft-knit-rib-cardigan-black |
| 011-ecover-tablets | certified | https://uk.ecover.com/products/dishwashing/wrapper-free-all-in-one-dishwasher-tablets/ |
| 012-ecover-zero-tablets | certified | https://uk.ecover.com/products/dishwashing/wrapper-free-all-in-one-zero-dishwasher-tablets/ |
| 013-ecover-power-tablets | certified | https://uk.ecover.com/products/dishwashing/wrapper-free-all-in-one-power-dishwasher-tablets/ |

## Results

| role | pages read | pages with a banned claim | rate |
|---|---|---|---|
| shop | 10 | 0 | 0.0% |
| certified | 3 | 3 | 100.0% |
| all | 13 | 3 | 23.1% |

Three findings in total, all the same rule and the same phrase:

```
BANNED  1 banned  0 evidence  011-ecover-tablets.html       Biodegradable
BANNED  1 banned  0 evidence  012-ecover-zero-tablets.html  Biodegradable
BANNED  1 banned  0 evidence  013-ecover-power-tablets.html Biodegradable
```

```
   3 pages  banned  generic
   0 pages  banned  similar, green, offset
   0 pages  evidence  future, label
```

## False positives

Every finding was read in context and judged against the rule that raised it.

- **“Biodegradable formula.”** on each Ecover page. Recital 9 names “biodegradable” as a generic claim; the sentence gives no timescale, environment or certification scheme, and no scheme is named in the page text. Judged a true positive.
- No finding was judged a false positive.

**False-positive rate: 0 of 3 findings (0.0%), 0 of 13 pages.** These are counts over a hand review by one reviewer, not a statistical estimate; three findings cannot support a rate. The certified pages were selected as a control on the assumption that a certified product page would read cleanly. It did not, which is itself the result: a certification badge did not stop the generic wording.

## What this shows, and what it does not

- **Shows:** ten sustainability-positioned English product pages, saved on one day, carried none of the blacklisted phrasings; three EU Ecolabel pages each carried the bare word “biodegradable”.
- **Does not show:** that shop pages in general are clean. All ten shop pages come from brands whose marketing already leans environmental, and six of the ten are US pages outside the directive's jurisdiction. The sample is a pilot, not a survey of the EU market.
- **Misses a semantic claim:** the Ecover page says carbon emissions were “measured, reduced and offset as certified by Climate Impact Partners”. No rule matches that wording, because the offset rule looks for neutrality/positive phrasing. It is an offset-based reduced-impact claim that a pattern scanner cannot recognise; it is not counted above.
- **Cannot see:** copy rendered after load that is absent from the snapshot, text inside images or badges, `alt` and `title` attributes, and any language other than English.
