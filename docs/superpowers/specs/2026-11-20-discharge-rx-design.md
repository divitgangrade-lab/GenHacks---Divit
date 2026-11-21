# Discharge Rx — design

2026-11-20 · GenHacks 2026 · Track: Healthcare & Environmental · Solo or small team · Software only

## Intent

A discharged patient gets a letter written for clinicians and is expected to follow it at home.
The letter is the handoff, and it is the failure point. Discharge Rx turns one real letter into a
plan the patient can actually execute — and, crucially, **proves the rewrite didn't lose anything**.
Every instruction extracted from the original is checked against the rewrite, and the output is
blocked if any of them dropped, weakened or changed.

The product is not a summarizer. The summarizer is a component inside a pipeline that can refuse.

## Why this one

- 81% of 1,511 discharge documents exceed the AMA's sixth-grade reading threshold on Flesch-Kincaid,
  100% on SMOG, and readability did not improve across revision months (Am J Med 2025).
- Comprehension errors predict adherence errors, aOR 8.7; plan complexity predicts both
  (J Pediatr 2019).
- Lowering readability cut post-discharge calls 21.9% → 9.0% and readmissions 1.9% → 0.9% per 100
  discharged (Surgery 2019).
- An AI-generated discharge letter already beat a traditional one on comprehension (median 4 vs 2) —
  but **did not** improve identification of follow-up appointment dates (IJQHC 2026).
  So plain rewriting is taken, and the appointment/fidelity gap is open.

That last finding is the whole wedge: the field has proved the rewrite works and left the
verification unsolved.

## Goals

1. Paste or upload a discharge letter / medication list; get a one-page grade-6 plan.
2. Extract, as structured data: medications (name, dose, frequency, route, duration), follow-up
   appointments (date, place, reason), activity/diet restrictions, and red-flag symptoms.
3. Print the readability score before and after (FKGL, SMOG, FRE) — measured, not asserted.
4. **Fidelity check**: re-extract from the rewrite, diff against the original instruction set, and
   block the output on any lost or altered instruction, with the diff visible.
5. Export: printable one-pager + an `.ics` calendar with the appointments and medication times.

## Non-goals

- Not a diagnosis, not triage, not medical advice. Every screen carries that line.
- No patient accounts, no database of letters, no upload to a third party beyond the model call.
- No EHR integration, no FHIR, no clinician-side editor.
- No multilingual set beyond one extra language (pick one, do it properly).

## Anti-goals — this is a failure even if it technically works

- A chat window where you type a letter and get prose back. That is the losing shape.
- A readability score you only print *after* the rewrite. The comparison is the point.
- A fidelity check that can be disabled for the demo. It ships on.
- A demo with a hand-tuned letter that only works on that letter.

## Constraints

- Hackathon rules: built after 1 Nov 2026; every library, API, template and AI tool listed in the
  submission description; public repo; ≤3-minute video with embedding enabled.
- No hardware, no purchases. One LLM API key is required (owner's own); budget it as a real
  dependency with a hard fallback.
- **No real patient data.** Use synthesized letters and published samples only. Say this in the video.
- Must run on a cold machine from a fresh clone: `npm i && npm run dev`.

## Approaches considered

**A. Prompt-and-display.** One model call, render the output. Fastest, and loses the technical
execution criterion outright — it is a prompt in a box, and the 2026 trial already did it.

**B. Extract → constrain → verify (chosen).** Deterministic extraction into a schema, generation
constrained to that schema, then independent re-extraction and diff. More work, but the verifier is
the contribution, the demo has a climax, and the measurement is real.

**C. Clinician-in-the-loop editor.** A reviewer UI where a nurse approves each line. Strong product
story, but the demo becomes clicking "approve" twelve times and it needs a persona you don't have.

B, because it converts the weakest criterion (technical execution) into the strongest, and because
"our system refused to ship a bad rewrite" is a sentence judges remember.

## The design

Pipeline, five stages, each independently testable:

1. **Ingest.** Text paste, PDF text layer (pdf.js), or photo via OCR. Normalise to plain text,
   keep the original for diffing.
2. **Extract** (deterministic where possible). Regex + a small grammar for doses and frequencies
   ("1 tab PO BID x7d" → `{drug, 1 tab, oral, twice daily, 7 days}`), a date parser for follow-up
   appointments, and a section splitter for restrictions and red flags. The model is a *fallback*
   for messy prose, tagged as such in the UI.
3. **Rewrite** constrained to the extracted schema: for each instruction, produce a plain-language
   line and nothing else. Banned-phrase list applied to the output.
4. **Verify** (the contribution). Re-extract from the rewrite into the same schema and diff against
   stage 2, field by field. Any of: instruction missing, dose changed, frequency changed, duration
   dropped, date missing → `BLOCKED`, with the specific diff shown. Only a clean diff renders.
5. **Deliver.** One-pager, `.ics` export, before/after scores, and an audio read-aloud.

Readability is implemented in-repo, not imported as a black box: Flesch-Kincaid, SMOG and Flesch
Reading Ease over a syllable count taken from CMUdict, with a fallback heuristic for unknown words.
Roughly 150 lines and worth it — a judge can read the scorer on GitHub.

**Stack (my calls, all reversible):** Next.js + TypeScript, Tailwind, no database, no auth.
Model access behind a thin provider interface with two implementations: the chosen API and a
scripted fixture, so the demo runs offline if the network or the key fails. Deployed on Deployxa
(same deploy, plus entry into the Best Use of Deployxa prize) — opt in at submission.

**Demo script, 3 minutes, in order:** the 81% statistic · paste a 700-word letter · score 11.2 shows ·
click · score 6.1 and a four-time medication timeline · calendar dates · **then a deliberately harder
letter where the first rewrite drops "stop ibuprofen 7 days before your blood test" and the verifier
blocks it on screen** · second attempt passes · red flags in plain words · one sentence on limits and
on the 20-letter evaluation set. The refusal is the moment.

**Evaluation (the thing most teams skip):** 20 synthesized letters with known instruction sets.
Report instructions extracted, drop rate at the verifier, and mean FKGL before/after. Put the table
in the repo README and in the video. This is what makes "technical execution" defensible.

## What's left to the builder

- Which extra language, if any. My call: skip it in v1, add it only if week 4 is free.
- Which OCR path for photos, if photo input survives at all. My call: cut photos in v1, text and PDF
  only — OCR accuracy is a second research problem and it doesn't earn points the verifier doesn't.
- The model provider. Needs your key; nothing else depends on the choice.
- Whether to keep the scripted-fixture fallback in the shipped demo build. My call: keep it, and say
  so in the video. A demo that can't fail is worth more than a demo that pretends it can't.

## Schedule to 18 Dec

- **Weeks 1–2:** ingest + extraction schema + readability scorer, with unit tests on dose grammar.
- **Weeks 3:** rewrite + verifier + the diff UI. If the verifier isn't working by 8 Dec, the project
  has no thesis — stop and fall back to Claim Check.
- **Week 4:** the 20-letter evaluation, one-pager and `.ics` export, Deployxa deploy, README with the
  table.
- **18 Dec:** feature freeze. **20 Dec:** video recorded. **22 Dec:** submitted, with the full tool
  list in the description.
