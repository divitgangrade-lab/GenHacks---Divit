# GenHacks — 20 Healthcare & Environmental ideas (software only), critiqued, debated, ranked

2026-11-20. **Constraint: no hardware, no purchases. A GitHub repo and a browser.**
Framework: 25% Impact / 25% Technical execution / 25% Creativity / 25% Presentation.
Build window assumed: now → feature freeze 18 Dec, video 20 Dec, submit 22 Dec.

The earlier hardware-flavoured list is superseded by this one.

---

## Part 0 — What "no hardware" costs you

Every sensor idea dies: classroom CO₂, mould risk, radon, phantom loads, water-meter cameras.
That closes the Robotics & IoT track entirely, which was the thinnest one. So this is H&E against
the whole field, and in H&E the default failure mode of software is **the dashboard** — a map, a
chart, a card, and a number nobody acts on. Judges discount those and say so.

Two software shapes survive that:
1. **A measured claim** — you show a number moving that was bad before and is good after (readability,
   cost, dose, hours). The demo *is* the measurement.
2. **An intervention at the moment of decision** — you sit where the choice is made (the checkout
   page, the discharge letter) instead of in a dashboard someone visits later.

Every finalist below is one of those two. Nothing else in the list is.

---

## Part 1 — The 20, and what's wrong with each

**FATAL** = can't win or shouldn't ship · **SERIOUS** = fixable, it's the make-or-break · **FIXABLE** = a scope note

### Health

| # | Idea | One line | Flaw |
|---|---|---|---|
| 1 | **Discharge Rx** | A real discharge letter in, a grade-6 plan + medication schedule + "come back if…" list out, with the readability delta printed on screen. | **SERIOUS.** "AI rewrites a document" is a crowded shape, and a 2026 trial already showed AI letters beat traditional ones on comprehension — so a generic version is beaten prior art. Fix: aim at the thing that trial *failed* at (follow-up appointment dates) and make the schedule the product. |
| 2 | **Pill Bottle Check** | Photograph your bottles, get duplication and interaction warnings. | **SERIOUS.** Open interaction data is messy or licensed, and a false "no interaction found" is a safety claim you can't defend. |
| 3 | **Blister Verify** | Photograph the blister pack; log what was actually taken. | **SERIOUS.** Reads as "vision model on a photo", and the value (adherence over weeks) is invisible in a 3-minute video. |
| 4 | **Polypharmacy Solver** | Five prescriptions → one feasible daily schedule honouring spacing, food and interaction constraints. | **FIXABLE.** The solver is genuinely algorithmic — a good sign — but the constraint rules have to come from somewhere defensible, and that's the whole risk. |
| 5 | **Bill Check** | Scan a US medical bill, flag line items that contradict published prices. | **SERIOUS.** US-only, and price-transparency files are notoriously malformed; the demo needs one hand-cleaned bill, which is itself the tell. |
| 6 | **Handoff** | SBAR shift handoff that refuses to submit when a safety field is missing. | **SERIOUS.** It's a form with validation. Nothing to watch working beyond a red border. |
| 7 | **Ear Screen** | Browser audiogram plus a noise-dose log. | **SERIOUS.** A browser cannot know your headphones' frequency response, so the audiogram is uncalibrated — and this panel has a QA automation engineer. |
| 8 | **Caregiver Log** | One shared timeline for a family caring for a parent. | **FATAL.** A CRUD app with a health theme. No technical claim, no impact number, no reason to place. |
| 9 | **Wound Watch** | Post-op photo → infection risk score. | **FATAL.** Unvalidated clinical judgement. Don't ship it. |
| 10 | **Symptom Triage** | Rural/after-hours urgency checker. | **FATAL.** Saturated, and triage errors hurt people. |

### Environmental

| # | Idea | One line | Flaw |
|---|---|---|---|
| 11 | **Lung Route** | The cleanest route, not the shortest: inhaled dose = concentration × minute-ventilation × time, so the hilly detour can beat the flat polluted one. | **SERIOUS.** Needs live air quality and street-level traffic at usable resolution; a static-data demo guts the insight. |
| 12 | **Claim Check** | Browser extension: on any product page, flag green claims against the actual legal test, with the rule cited. | **SERIOUS.** The rule set has to be hand-encoded, it's EU-specific, and the tone must stay informational or it reads as legal advice. |
| 13 | **Watt Neighbour** | Public building-energy benchmarks → your building vs its neighbours, waste priced in dollars. | **SERIOUS.** A ranking dashboard until you add a decision ("this building could cut $X by doing Y") — and then it's a recommendation engine with no ground truth. |
| 14 | **Which Bin** | Address-aware disposal router for that gadget. | **FATAL.** The product *is* municipal data you'd hand-collect for one city, and a wrong bin is a wrong answer. |
| 15 | **Recipe Carbon** | Carbon and water label for any recipe URL. | **SERIOUS.** Published per-ingredient footprints, so it's a lookup table with a UI — and the number is unverifiable in the demo. |
| 16 | **Cleanest Hour** | Shift the laundry to the cleanest hour on your grid. | **FATAL.** One API call and a bar chart. Cannot fill five weeks against a "how much did you build" criterion. |
| 17 | **LastThree** | Receipt → expiry clocks → "cook this tonight, save $9". | **SERIOUS.** The most common student environmental app in existence. Creativity caps around 5/10. |
| 18 | **Compost Coach** | Bin photo → contamination diagnosis. | **SERIOUS.** One image classifier and a card. |
| 19 | **Heat Equity** | Satellite heat + canopy → street tree-planting priority. | **FATAL.** Published, funded prior art (American Forests Tree Equity Score) and no live demo moment. |
| 20 | **Beach Watch** | Public beach water quality + rain-forecast risk. | **FATAL.** Seasonal, city-specific, and it's a map with a badge. |

---

## Part 2 — The debate

Three lenses, run independently against the same list.

**Simplifier.** Kills anything that needs data you'd have to hand-collect, licence or clean: 2, 5, 14,
16. Kills anything with no algorithmic core: 8, 17, 18. Kills anything unsafe to fake: 9, 10. Keeps
1, 3, 4, 6, 7, 11, 12, 13, 15.

**Operator (will it run, on camera, on the day?).** Flags the live dependencies: 11 relies on an air
quality API mid-video, 12 depends on scraping a shopping page that may change shape, 5 depends on a
file format designed by committee. Demands a bundled fallback for each — recorded hour of AQ data, a
saved DOM snapshot, one cleaned bill. Notes 6 and 7 will run perfectly and say nothing.

**Judge (would a KPMG accountant, an Enercare PM and a Tesla engineer score it?).** Kills the
dashboard-shaped survivors: 13, 19, 20. Asks of each remaining idea: what changes on screen in the
first 20 seconds? Flags that "AI rewrites your discharge letter" has already been tried in a published
trial this year, so judges in health may have seen the pitch — and therefore the *documented failure*
of that trial is the only wedge left.

### Contradictions, resolved

**"Discharge Rx is AI-wrapper territory" vs "it has the strongest evidence base here."**
Both true; it survives on the specificity of the gap. The trial found AI letters improved comprehension
but did *not* improve identification of follow-up appointment dates. So the product is not the rewrite —
it's the medication schedule, the appointment extraction, and the red-flag list, with the rewrite as
the delivery mechanism. And it can put a number on screen (FKGL 11.2 → 6.4) instead of asking for trust.

**"Lung Route is un-demoable without live data" vs "it's the most original thing in the list."**
Keep it, with the demo cut: one city, two routes, recorded hourly AQ, and the claim stated as a unit
problem (micrograms inhaled, not distance walked). The insight is provable with an hour-old file.

**"Claim Check depends on scraping pages that change" vs "it has the best 15 seconds available."**
Keep it, and ship two modes: inspect-any-page, plus a fixed demo page that cannot break. The EU rule
set is finite and short enough to encode in a week, which is what makes it a build rather than a wrapper.

### Verdict

**Discharge Rx > Claim Check > Lung Route.**

---

## Part 3 — The three finalists

### 1. Discharge Rx — the letter is the product, the rewrite is the wrapper
Upload (or paste) a discharge letter or medication list. Out comes a one-page plan at grade 6 or below:
what happened, what to take and when, what to watch for, when to come back — with the readability score
printed before and after, and every appointment date extracted into a calendar. Nothing about it needs
a server you don't have.

- **Demo:** paste a real letter. Panel shows FKGL 11.2 / SMOG 13.1. Click. Same content at FKGL 6.4,
  four medication times on a timeline, two appointment dates in a calendar, three red flags in plain
  words. Numbers moved.
- **Evidence:** across 1,511 discharge documents, 81% exceeded the AMA's sixth-grade threshold on
  Flesch-Kincaid and 100% on SMOG, with no improvement over revision months
  ([Am J Med 2025](https://www.amjmed.com/article/S0002-9343(25)00196-2/fulltext)). Comprehension
  errors predict adherence errors (aOR 8.7) and plan complexity predicts both
  ([J Pediatr 2019](https://www.jpeds.com/article/S0022-3476(19)30535-9/abstract)). Improving
  readability cut post-discharge calls 21.9%→9.0% and readmissions 1.9%→0.9% per 100 discharged
  ([Surgery 2019](https://www.sciencedirect.com/science/article/abs/pii/S0039606018307268)).
  AI letters already beat traditional ones on comprehension — but **not** on identifying follow-up
  dates ([IJQHC 2026](https://academic.oup.com/intqhc/article/38/4/mzag133/8792929)).
- **Weak point:** looking like a chat window. Mitigate by never showing a chat: show a document, a
  score, a schedule.

### 2. Claim Check — the law, applied at the checkout
A browser extension. On any product page it reads the environmental claims in the copy, matches each
against the actual prohibited-practices list, and shows a short verdict with the rule cited: *"carbon
neutral — banned when based on offsetting (Annex I, 4c)"*, *"eco-friendly — generic claim, needs
recognised excellent environmental performance (Annex I, 4a)"*.

- **Demo:** open a real product page, extension badges three claims, hover shows the rule and what
  evidence would be required. Then open a compliant page and it stays quiet — the negative case proves
  it isn't just matching keywords.
- **Evidence:** Directive (EU) 2024/825 applies from 27 September 2026 and blacklists generic claims
  ("eco-friendly", "green", "climate friendly") without recognised excellent environmental performance,
  plus carbon-neutrality claims based on offsetting, plus sustainability labels not backed by a
  certification scheme ([EUR-Lex](https://eur-lex.europa.eu/eli/dir/2024/825/oj/eng),
  [Commission Q&A](https://commission.europa.eu/document/download/3c257883-bb2a-4dd9-a6dc-501d587bb34f_en)).
  The broader Green Claims Directive was withdrawn in November 2026, which makes the *surviving* rule
  set the interesting story ([Loyens & Loeff](https://www.loyensloeff.com/insights/news--events/news/esg-update-green-claims-directive-set-to-be-withdrawn-but-anti-greenwashing-rules-remain)).
- **Weak point:** tone. Every verdict must read "this claim looks unsubstantiated under rule X", never
  "this company is lying".

### 3. Lung Route — you inhale dose, not distance
Enter a start and end. The app does not return the fastest route. It returns the route with the lowest
inhaled pollutant dose, computed as concentration × minute-ventilation (which rises with hills, heat
and speed) × time on each segment — then shows the trade: "+4 minutes, −38% PM2.5 inhaled".

- **Demo:** two routes on one map, one bar chart. The longer, hillier, back-street route wins and the
  reason is on screen. Then change the hour of day and watch the winner change.
- **Evidence:** the mechanism is standard exposure science — dose is concentration times ventilation
  times duration, so effort and duration matter as much as the reading — and the route-level
  intervention is the part commercial map apps don't do.
- **Weak point:** data. Ship with one city's recorded hourly AQ plus a saved traffic layer, and say so.

---

## Part 4 — Five criteria, per-idea weights, scores

Same five criteria, because the judges use one rubric on all three. Weights differ per idea because
each one wins or loses on a different axis, and a single shared rubric would punish the same weakness
twice.

| # | Criterion | What it measures |
|---|---|---|
| C1 | **Impact & evidence** | documented harm, specific population, a number you can quote |
| C2 | **Build feasibility** | genuinely working by 18 Dec, solo or small team, no paid data |
| C3 | **Demo strength** | a 90-second, on-camera, undeniable moment in a browser |
| C4 | **Originality** | fresh to a judge who has seen ~100 projects |
| C5 | **Legibility** | understood by a non-engineer without reading code |

Scores are 1–10 and are my judgement, not measurement.

### Discharge Rx — weights on impact and demo, where its points are

| Criterion | Weight | Score | Weighted |
|---|---|---|---|
| C1 Impact & evidence | 25% | 9 | 2.25 |
| C2 Build feasibility | 20% | 9 | 1.80 |
| C3 Demo strength | 25% | 9 | 2.25 |
| C4 Originality | 15% | 7 | 1.05 |
| C5 Legibility | 15% | 9 | 1.35 |
| **Total** | **100%** | | **8.70 / 10** |

Originality is its weakest leg and is deliberately down-weighted: the idea is not new, the *specific
gap* and the *measurement* are. If the demo turns into a chat window, C4 and C3 both fall and the total
drops to ~8.1.

### Claim Check — weights on demo, because the overlay is the product

| Criterion | Weight | Score | Weighted |
|---|---|---|---|
| C1 Impact & evidence | 20% | 8 | 1.60 |
| C2 Build feasibility | 15% | 7 | 1.05 |
| C3 Demo strength | 30% | 9 | 2.70 |
| C4 Originality | 20% | 9 | 1.80 |
| C5 Legibility | 15% | 9 | 1.35 |
| **Total** | **100%** | | **8.50 / 10** |

Demo carries 30% because an overlay appearing on a live product page is the strongest 15 seconds
available to you. Feasibility is down-weighted *and* scored lowest — the honest position: scraping plus
a hand-encoded rule set in five weeks is doable but fragile.

### Lung Route — weights on impact and originality, because the insight is the whole case

| Criterion | Weight | Score | Weighted |
|---|---|---|---|
| C1 Impact & evidence | 25% | 8 | 2.00 |
| C2 Build feasibility | 20% | 7 | 1.40 |
| C3 Demo strength | 20% | 8 | 1.60 |
| C4 Originality | 20% | 9 | 1.80 |
| C5 Legibility | 15% | 8 | 1.20 |
| **Total** | **100%** | | **8.00 / 10** |

### What would flip the ranking

- **Claim Check → first** if the rule set is complete and the extension works on three different real
  sites by 5 Dec. Its feasibility score is the only number with real headroom.
- **Lung Route → first** only if you can get street-level traffic data for one city; without it, the
  dose model is a filter over concentration and the originality claim weakens.
- **Discharge Rx → third** if the output ever looks like a chat transcript. The whole case rests on
  being a document with a score, not a conversation.
- **None of them survive** a missing public repo or an unembedded video. Both are submission rules.

### Near miss, and why
**Pill Bottle Check** (interaction warnings from a photo of your bottles) has the best harm story in the
list and I left it out on data: defensible interaction data is licensed, and an unlicensed subset makes
a safety claim you cannot stand behind in a demo.
