# GenHacks 2026 — research notes for choosing a project

Written 2026-11-20. Everything below is either quoted from a source (cited inline) or
marked as my judgement. Repo is empty at time of writing, so every idea here starts
from zero and complies with the "start after November 1" rule.

---

## 1. What this event actually is

| Fact | Source |
|---|---|
| Submissions 1 Nov 2026 → 26 Dec 2026, 12:00 AM ET. Judging 26 Dec → 1 Jan, winners 7 Jan. | [Devpost overview](https://genhacks-open.devpost.com/), [LaunchPanda listing](https://www.launchpanda.dev/vibe-jams/genhacks) |
| Students only, 13+, any country. Solo or team of any size. | [Rules](https://genhacks-open.devpost.com/rules) |
| 1,050 CAD cash across 7 cash prizes. 1st/2nd/3rd = 500/200/150 CAD. Four track winners = 50 CAD each. Plus "Best Use of Deployxa". | [Devpost overview](https://genhacks-open.devpost.com/) |
| Prize pool also includes Momen, Formaloo, Deployxa, MojoAuth, CodeCrafters and Adaption Labs credits — i.e. the sponsor list is six developer-tool companies. | [Devpost overview](https://genhacks-open.devpost.com/) |
| 226 participants at the time I checked (third-party trackers report 350–545 registrations, so treat 226 as a floor and the true field as a few hundred). | [Project gallery page](https://genhacks-open.devpost.com/project-gallery) |
| Tagged "Beginner Friendly · IoT · Machine Learning/AI". | [Devpost overview](https://genhacks-open.devpost.com/) |

**The rules that actually constrain you** (from the [rules page](https://genhacks-open.devpost.com/rules)):

- "Start your project after the hackathon begins. You can use open-source libraries, APIs,
  templates and AI tools **if you list them in your project description**. We will disqualify
  projects that started before the hackathon or copy someone else's work."
  → Listing your stack is a hard requirement, not a courtesy. Many teams skip it.
- One team per person, one project per team.
- "Judges score each project within its track. Organizers may move a project to a track that
  fits it better." → track-gaming has a ceiling; the project has to genuinely belong there.
- Submission needs: project page (name / what it does / how built / tools), ≤3 min demo video on
  YouTube or Vimeo **with embedding on**, public code repo, photos or video for hardware, track, all teammates added.

**The resources tab is a hint about what organizers expect you to have access to**
([resources](https://genhacks-open.devpost.com/resources)):

- Robotics & IoT → **Wokwi** (online Arduino/ESP32 simulator "if you don't have hardware") and Tinkercad Circuits.
  Organizers have pre-blessed simulation. A hardware project without hardware is a supported path.
- Healthcare & Environmental → Kaggle datasets, NASA Earthdata.
- AI/Security/DevTools → Hugging Face, OWASP Top 10.

---

## 2. Decoding the rubric

Officially 25% Impact, 25% Technical execution, 25% Creativity, 25% Presentation.
What that actually rewards, from people who judge:

- "The single largest score differentiator I saw [was] whether the demo ran. A working demo, live…
  beats a more ambitious project shown as slides almost every time… cut scope until something
  end-to-end runs. One complete path beats four half-built paths."
  — [What Judges Actually Score](https://dev.to/kurbaitaev/what-judges-actually-score-notes-from-a-year-of-hackathon-judging-3p4l)
- "One clear 'oh, this is possible now' moment is much stronger than a tour of every feature."
  and "you have to be able to show something working within about 90 seconds."
  — [JetBrains, notes from the judging table](https://blog.jetbrains.com/ai/2026/06/how-to-win-a-hackathon-notes-from-the-judging-table/)
- "As a judge, it was surprising to see how many submissions did not fulfill the basic requirements."
  — [Devpost, advice from 5 judges](https://info.devpost.com/blog/hackathon-judging-tips)
- Judges rank you against the six projects they saw just before yours, not against an ideal.
  — [same dev.to piece](https://dev.to/kurbaitaev/what-judges-actually-score-notes-from-a-year-of-hackathon-judging-3p4l)

Presentation is therefore the cheapest 25% to win, and it's scored by people watching a video,
not by your compiler.

---

## 3. Five strategic levers specific to *this* event

**a) Track choice is a real lever, and Robotics & IoT is the thin one.**
There are only ~226–500 participants and four tracks. Most students will pick the AI track
(it is the default gravity of every hackathon). The Robotics & IoT and Healthcare & Environmental
track prizes are therefore contested by far fewer projects. Cost of entry: an ESP32 and one sensor,
or a credible Wokwi simulation. Rules say organizers can re-file you, so the project must genuinely
be the thing you claim.

**b) "Best Use of Deployxa" is nearly free expected value.**
Deployxa is an AI-native PaaS — Git push / CLI / REST / VS Code / **MCP server** to a live URL
([deployxa.com](https://deployxa.com/about), [profile](https://www.everydev.ai/tools/deployxa)).
You have to deploy something anyway. Deploying it there and opting in at submission costs an hour
and enters a separate prize pool. No other sponsor prize requires so little.

**c) The judge panel is unusually non-specialist, which rewards legibility.**
Job titles include a **Staff Accountant (KPMG)**, a **Product Manager at Enercare** (home
energy/HVAC), a **QA Automation Engineer**, a **Cell Cathode Intern at Tesla**, an AI engineer, and
a Caltech PhD/CTO. Read that as: (i) at least two judges think about buildings, energy and
manufacturing; (ii) at least one judge will not read your code, so the demo video is the product;
(iii) "saves a household $X per year" lands with this panel in a way "novel architecture" does not.

**d) You have five weeks, not 36 hours — that is the whole edge.**
Almost all hackathon advice assumes a weekend. The 25% "how much did the team build" criterion is
where five weeks shows: real data, a real dataset, a working device, a deployed URL, a written
method. Build something a weekend team physically could not have shipped.

**e) Generic AI is now a liability, not a feature.**
- "Judges have reported that generic LLM demos no longer stand out… AI is table stakes, not a
  differentiator." — [HackerEarth](https://www.hackerearth.com/blog/hackathon-ideas)
- "Almost 90% of them have some form of AI influence… do not delegate the innovation to AI.
  The ideas they generate have a pattern to them, and a judge can feel it." — [HackerNoon, from the judge's seat](https://hackernoon.com/from-the-judges-seat-standing-out-in-hackathons-in-the-age-of-ai)
- "The idea that arrives in two minutes arrived for everyone else too… if you hear it twice, the
  judges will hear it five times." — [AngelHack](https://angelhack.com/blog/how-to-pick-the-hackathon-project-ideas)

**Do not build:** a general mental-health/wellness chatbot, an "AI study buddy", a generic
analytics dashboard, another todo/notes app, or anything whose honesty depends on a dataset you
don't have. Those are the categories judges report being tired of.

---

## 4. Evidence-backed problem spaces

### Indoor air quality in classrooms — the strongest documented gap
- A systematic review of 125 studies covering 2,444 naturally ventilated classrooms found a
  **median CO₂ of 1,487 ppm and 81% exceeding the 1,000 ppm threshold**; 3 of 4 included studies
  found a significant inverse association between CO₂ and cognitive performance, one reporting a
  17% rise in CO₂ cutting attention-test performance by 16%.
  — [MDPI Buildings, 2024](https://www.mdpi.com/2075-5309/14/12/4003)
- A Boston Public Schools study logged **245 million CO₂ measurements**; average school-day
  concentration 841 ppm, 99.9th percentile of daily maxima **5,080 ppm**, with variation "by over an
  order of magnitude" between classrooms. Its stated conclusion: "the need for continuous
  classroom-level monitoring and demand-controlled ventilation… **decision tools for schools**."
  — [Lancet Regional Health – Americas, 2025](https://www.thelancet.com/journals/lanam/article/PIIS2667-193X(25)00158-9/fulltext)
- University classrooms: higher peak CO₂ associated with lower cognitive test scores across
  ~440–1,630 ppm. — [J. Exposure Science & Env. Epi., 2025](https://www.nature.com/articles/s41370-025-00770-6)
- Meta-analysis: complex-task performance declines significantly at +1,000–1,500 ppm CO₂.
  — [Building & Environment, 2023](https://www.sciencedirect.com/science/article/pii/S036013232300358X)

Why this matters for a hackathon: the literature is not asking for another sensor. It is asking for
a **decision tool** — something that turns a number into "open the windows now, for six minutes,
before period 3". That's a product-shaped gap, and almost nobody builds it.

### Medication non-adherence — big money, crowded idea space
- Adjusted total cost of non-adherence per person per year: **$8,327 (diabetes), $8,584
  (respiratory), $12,146 (cardiovascular), $14,585 (mental health), $30,771 (GI), $43,372
  (osteoporosis)**, 2024 USD. — [review of systematic reviews, 2025](https://pmc.ncbi.nlm.nih.gov/articles/PMC12237677)
- Caveat: reminder apps are one of the most-built student projects. Any entry here needs to
  *verify* rather than nag, and pick one narrow patient.

### Food waste — good numbers, crowded app space
- **20% (11 million tonnes) of all food produced in Canada** becomes avoidable loss or waste.
  — [Environment and Climate Change Canada](https://www.canada.ca/en/environment-climate-change/services/managing-reducing-waste/food-loss-waste/taking-stock.html)
- Cost to the average US consumer: **$728/year ($14/week)**; $2,913/year for a household of four.
  — [US EPA, 2025](https://www.epa.gov/system/files/documents/2025-04/costoffoodwastereport_508.pdf)
- Caveat: "fridge inventory app" is a seen-it-before category. The money meter is the hook.

### Household hazardous / e-waste — real, but data-dependent
- ~**80% of Canadian households** had hazardous waste to dispose of in the past year (38% had
  pesticides/chemicals/e-waste); only about three in four disposed of it "in a controlled way",
  varying by community type. — [Statistics Canada, 2026](https://www150.statcan.gc.ca/n1/pub/36-28-0001/2026009/article/00003-eng.htm)
- Caveat: a disposal-router app is mostly a data-sourcing problem, not a build problem.

### AI agent security — the timely software space
- OWASP's 2025 Top 10 for LLM Applications leads with **LLM01 Prompt Injection** and includes
  **LLM06 Excessive Agency** — the risk that an agent with tool access does something destructive
  because untrusted text told it to.
  — [OWASP GenAI](https://genai.owasp.org/llm-top-10/); organizers point participants at OWASP in the resources tab.
- Every MCP server (including Deployxa's own, at `mcp.deployxa.com`) is a new tool surface with no
  standard guardrail layer. This is a live gap, and stopping an attack demos beautifully.

---

## 5. Six candidate projects

Scored 1–5 against the organisers' own 25/25/25/25 rubric. These are my judgements, not facts.

### 1. "Breathline" — classroom CO₂ as a decision tool
**Track:** Robotics & IoT (also defensible as Healthcare & Environmental).
ESP32 + true-CO₂ NDIR sensor (SCD41, ~$20–25) + OLED per classroom, streaming to a local dashboard.
It doesn't plot ppm — it computes a **ventilation debt** per room, tells the teacher "open the windows
during break, 6 minutes", times its prompts to the timetable, and gives the school a per-room league
table plus a weekly PDF for the board. Simulation mode in Wokwi, plus a recorded-data replay mode so
the demo can never fail.

| Impact | Execution | Creativity | Presentation |
|---|---|---|---|
| 5 | 4 | 4 | 5 |

**Demo moment:** cover the sensor with a cup → number climbs past 1,500 → dashboard flips to red and
issues a timed purge instruction. Physical, immediate, undeniable.
**Why it wins:** only project in the room with an object on the desk; quotable evidence (81% of
classrooms over threshold; Lancet explicitly calls for "decision tools for schools"); Enercare PM and
Tesla engineer on the panel; thinnest track.
**Risk:** sensor cost/shipping time. Mitigate with Wokwi + replay so the demo is hardware-independent.

### 2. "Auditor" — a policy layer for AI-agent tool calls
**Track:** AI, Agentic Systems, Cybersecurity, and Dev Tools.
A gateway between an agent and its MCP tools. Enforces per-tool policy and tracks taint: content that
came from an untrusted source (a web page, an email) can never trigger a write or exfiltrate tool
without explicit human approval. Every blocked attempt renders as a readable trace: this text → this
tool call → blocked, here's why.
**Demo moment:** the agent is asked to summarise a webpage that contains a hidden instruction to email
the user's notes to an outside address. The trace lights up, the call is intercepted, the judge clicks
*deny*. A negative demo — stopping something — is far more memorable than a feature tour.

| Impact | Execution | Creativity | Presentation |
|---|---|---|---|
| 4 | 4 | 5 | 5 |

**Why it wins:** timely (MCP everywhere), grounded in OWASP, and it doubles as "Best Use of Deployxa"
because Deployxa ships an MCP server you can demo against.
**Risk:** LLM nondeterminism under judging. Script the injection payload and keep a canned transcript
fallback.

### 3. "Dose Check" — verify adherence instead of nagging about it
**Track:** Healthcare & Environmental.
Photograph the blister pack; a vision model reads which pockets are still sealed; the app logs what was
actually taken and sends the adult-child caregiver a weekly summary. The differentiator is
*verification*, not reminders, and one specific patient: an elderly parent on 5+ medications.
**Why it scores:** $8k–43k/patient/year cost of non-adherence is a strong impact number.
**Risk:** this is exactly where generic-AI gravity pulls hardest. It only works if the caregiver summary
is the product and the photo is the mechanic.

| Impact | Execution | Creativity | Presentation |
|---|---|---|---|
| 5 | 3 | 3 | 4 |

### 4. "Machine Ear" — acoustic anomaly detection on a $10 board
**Track:** Robotics & IoT. ESP32 + I2S mic learns a machine's normal sound (a pump, a washing machine,
a 3D printer) and flags drift before it fails. TinyML inference on-device; public MIMII-style datasets
supply healthy/faulty audio for the demo.
**Why it scores:** invisible-to-visible, cheap, and genuinely engineering-flavoured for the Tesla/QA judges.
**Risk:** needs convincing faulty audio, and "predictive maintenance" is a familiar pitch.

| Impact | Execution | Creativity | Presentation |
|---|---|---|---|
| 4 | 4 | 4 | 3 |

### 5. "LastThree" — receipt in, dinner out, money saved
**Track:** Healthcare & Environmental / Open. Photograph a grocery receipt → structured inventory →
expiry clocks → "cook the salmon tonight, you save $9". A running dollar counter is the whole hook.
**Why it scores:** 11 Mt / 20% of Canadian food wasted; $728 per consumer per year; the accountant judge
understands the number instantly.
**Risk:** crowded category; only the money meter and receipt ingestion differentiate it.

| Impact | Execution | Creativity | Presentation |
|---|---|---|---|
| 4 | 4 | 2 | 4 |

### 6. "Second Life" — repair-or-replace and disposal router
**Track:** Healthcare & Environmental / Open. Scan an appliance → repair cost estimate, local repair
shops, parts links, and the correct disposal route for your postal code.
**Why it scores:** 80% of households hold hazardous waste, ~40% of it e-waste, and controlled disposal
is far from universal.
**Risk:** the product *is* its dataset. Thin without municipal partnership data.

| Impact | Execution | Creativity | Presentation |
|---|---|---|---|
| 4 | 2 | 3 | 3 |

---

## 6. Recommendation

- **With hardware access (even $25 of it): build #1, Breathline**, for the Robotics & IoT track.
  Thinnest competition, physical demo, quotable evidence, real dual health+environment impact, and a
  sensor you can defeat on camera with a coffee cup. A five-week build also lets you collect a few days
  of genuine data from your own room — something no weekend team can show.
- **Software only: build #2, Auditor.** Highest creativity score available, timely, security is a named
  track, and deploying to Deployxa doubles as a second prize entry.
- Both should be deployed on Deployxa and opted in at submission.
- Schedule with buffer: feature freeze ~18 Dec, video recorded ~20 Dec, submitted ~22 Dec. The deadline
  is 26 Dec 00:00 ET and late submissions are not judged.

---

## 7. Sources

- GenHacks: [overview](https://genhacks-open.devpost.com/) · [rules](https://genhacks-open.devpost.com/rules) · [resources](https://genhacks-open.devpost.com/resources) · [gallery (unpublished)](https://genhacks-open.devpost.com/project-gallery)
- Judging practice: [Devpost judges' advice](https://info.devpost.com/blog/hackathon-judging-tips) · [JetBrains](https://blog.jetbrains.com/ai/2026/06/how-to-win-a-hackathon-notes-from-the-judging-table/) · [dev.to field notes](https://dev.to/kurbaitaev/what-judges-actually-score-notes-from-a-year-of-hackathon-judging-3p4l) · [HackerNoon](https://hackernoon.com/from-the-judges-seat-standing-out-in-hackathons-in-the-age-of-ai)
- Idea selection: [HackerEarth](https://www.hackerearth.com/blog/hackathon-ideas) · [AngelHack](https://angelhack.com/blog/how-to-pick-the-hackathon-project-ideas)
- Air quality: [MDPI review](https://www.mdpi.com/2075-5309/14/12/4003) · [Lancet BPS study](https://www.thelancet.com/journals/lanam/article/PIIS2667-193X(25)00158-9/fulltext) · [Nature exposure study](https://www.nature.com/articles/s41370-025-00770-6) · [B&E meta-analysis](https://www.sciencedirect.com/science/article/pii/S036013232300358X)
- Adherence: [systematic review of reviews](https://pmc.ncbi.nlm.nih.gov/articles/PMC12237677)
- Food waste: [ECCC](https://www.canada.ca/en/environment-climate-change/services/managing-reducing-waste/food-loss-waste/taking-stock.html) · [US EPA](https://www.epa.gov/system/files/documents/2025-04/costoffoodwastereport_508.pdf)
- E-waste: [Statistics Canada](https://www150.statcan.gc.ca/n1/pub/36-28-0001/2026009/article/00003-eng.htm)
- Sponsors: [Deployxa](https://deployxa.com/about) · [MojoAuth](https://mojoauth.com/) · [Momen](https://momen.app/) · [Adaption Labs](https://adaptionlabs.ai/) · [OWASP GenAI](https://genai.owasp.org/llm-top-10/)
