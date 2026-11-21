# Discharge Rx

A hospital discharge letter becomes a plan you can follow, and every instruction in the original is checked before the plan is allowed out.

Built for GenHacks 2026, Healthcare & Environmental track. Runs entirely in the browser, with no dependencies, no API keys and no build step.

**[Open the live demo](https://divitgangrade-lab.github.io/GenHacks---Divit/)**

## The problem

A patient leaves hospital with a letter written for clinicians, and is expected to follow it at home. In a review of 1,511 discharge documents, 81% sat above the sixth-grade reading level the American Medical Association recommends, and 100% did on SMOG — and the readability had not improved over the period the documents were revised. Comprehension errors then go on to predict adherence errors.

The gap this project aims at is not "rewrite the letter". That has been tried: AI-generated discharge letters beat traditional ones on comprehension in a 2026 trial (median 4 vs 2) **but did not improve identification of follow-up appointment dates**. The unsolved part is making sure the rewrite still says everything the original said.

So the product is the check, not the sentence.

## What it does

1. **Reads** the letter with a rules-based parser: medicines, doses, frequencies, durations, appointments, restrictions and warning signs. No model decides what the letter said, so the same input always yields the same instruction set.
2. **Rewrites** each instruction into short sentences, replacing clinical shorthand with everyday words (`PO` → by mouth, `TID` → three times a day, `ETOH` → alcohol).
3. **Checks** the rewrite against the original. Every dose, date, drug name and clinical warning must survive. If one is missing, the plan is blocked and the missing fact is named.
4. **Carries through** anything the parser does not recognise, in the original words, rather than guessing.
5. **Exports** a calendar file with appointments and repeating dose reminders, and prints as a one-page plan.

## The check, which is the point

Each instruction gets a set of anchors: numbers with units, dates, drug names, and a short list of clinical words whose disappearance would be dangerous (warfarin, bleeding, driving, 911). The rewrite passes only if every anchor is present, either word for word or through the plain-language glossary.

The demo includes a **checker test** that deletes a sentence from the finished plan and runs the same check against it. It names what was lost. That is the failure the tool exists to prevent, shown working.

## Measured results

Reproduce with `node scripts/eval.mjs`.

| Letter | FKGL | SMOG | Instructions | Facts checked | Meds | Appointments | Warnings | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Clean letter | 4.8 → 4.4 | 8.4 → 8.7 | 10 | 26 | 3 | 1 | 3 | all kept |
| Abbreviation soup | 4.1 → 5.3 | 7.4 → 8.8 | 12 | 18 | 3 | 1 | 2 | all kept |
| Unusual instruction | 4.5 → 4.3 | 8.1 → 8.4 | 9 | 18 | 2 | 1 | 3 | all kept |

Read that table carefully, because it contains the most useful thing this project learned: **the readability score barely moves, and on one letter it gets worse.**

The reason is that these letters are lists of short lines, and Flesch-Kincaid rewards short lines. The "abbreviation soup" letter scores 4.1 while being completely unreadable to a patient, because `Amox 500mg PO TID x7d` is made of short words. Expanding that shorthand into "for 7 days" adds syllables, so the grade level rises even though the plan is far easier to act on.

So the honest claim is not a grade-level drop. It is: **on the clean letter, 26 facts in and 26 facts out, verified; on the abbreviation letter, 17 pieces of clinical shorthand replaced, three medicines turned into four timed doses, and a calendar file exported.** Grade level is a weak proxy and this project shows where it breaks.

## What it does not do

- **Narrative discharge summaries.** The parser expects one instruction per line or sentence. A paragraph containing two medicines in one sentence will lose one, so the tool reports what it could not parse rather than pretending.
- **Date ambiguity.** `12/2/2026` is read as 2 December (month first). European order would invert it. A real deployment needs locale detection.
- **Clinical judgement.** It does not check whether a dose is correct or a drug is appropriate. It only checks that nothing was lost.
- **Real patient data.** Every sample letter is synthetic and written for this demo.
- **A complete glossary.** 71 terms. Anything outside it is carried through unchanged, which is safe but less plain.

## Run it

```bash
npm test        # 23 assertion tests, no dependencies
npm run serve   # http://localhost:4173
```

Or open `index.html` through any static server. There is no build step: the browser loads `app.js` and the ES modules in `src/` directly.

## How it is built

Plain HTML, CSS and ES modules. No framework, no package dependencies, no network calls, no runtime AI model.

- `src/readability.js` — Flesch-Kincaid, SMOG and Flesch Reading Ease, implemented here so the numbers on screen can be traced to code.
- `src/extract.js` — the rules-based parser and the anchor builder.
- `src/render.js` — the plain-language renderer and the glossary.
- `src/verify.js` — the fidelity check.
- `src/ics.js` — the calendar export.
- `tests/run.mjs` — assertions, including the two cases that must fail.

An earlier design note proposed Next.js and a Deployxa deployment. The shipped build is dependency-free static files instead, so it runs on GitHub Pages with nothing to install and nothing to break during a demo. The design note is in `docs/superpowers/specs/`.

Written with AI assistance (Freebuff). No third-party libraries, APIs, templates or generated code assets are bundled: every file in this repository was written for it.

## Sources

- [Language and readability barriers in discharge instructions, Am J Med 2025](https://www.amjmed.com/article/S0002-9343(25)00196-2/fulltext)
- [Discharge instruction comprehension and adherence errors, J Pediatr 2019](https://www.jpeds.com/article/S0022-3476(19)30535-9/abstract)
- [Enhanced readability and readmissions, Surgery 2019](https://www.sciencedirect.com/science/article/abs/pii/S0039606018307268)
- [Comprehension of an AI-generated discharge letter, IJQHC 2026](https://academic.oup.com/intqhc/article/38/4/mzag133/8792929)
- [Hospital discharge instructions: comprehension among older adults, JGIM 2012](https://pmc.ncbi.nlm.nih.gov/articles/PMC4238191)
