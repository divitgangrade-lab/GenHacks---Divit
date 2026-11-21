# Legal compliance register

This register accounts for all 100 items in the supplied "Legalities for vibecoded websites" checklist. It is an engineering audit, **not a legal opinion, certification, or guarantee that the site is "100% legal."** No static page can honestly promise that. A lawyer, the operator's entity, and the operator's insurers have to close the owner-only items.

Scope: the Claim Check static demo at `index.html`, its bookmarklet, the optional `motion/` showroom, and the repository. The site has no accounts, sign-up forms, cookies, analytics, payments, uploads, email, SMS, database, or runtime third-party API. Where a row says "Done", it refers to the checker and the legal page; the experimental showroom is called out separately in the accessibility statement and is not claimed to be fully audited.

## Status key

- **Done** — a control or public disclosure exists in this repository.
- **N/A** — the feature that triggers the rule is absent from this demo. The reason is stated; this is not a claim that the law never applies to a future version.
- **Partial** — something exists, but it is not a complete legal or accessibility assurance.
- **Owner** — requires the operator, a lawyer, an insurer, a registrar, or an account setting. It cannot be implemented in the codebase.

## Pillar A — vibe-coding risks (1–40)

| # | Risk | Status | Where / why |
|---:|---|---|---|
| 1 | Lack of age verification (COPPA) | N/A | No account, sign-up, form, or personal-data collection; the site is not directed to under-13s. |
| 2 | CDN-hosted fonts (GDPR) | Done | `styles.css` uses a system font stack; no Google Fonts or font CDN. |
| 3 | Session replay / CIPA | N/A | No analytics, session replay, advertising, or third-party scripts. |
| 4 | Disabled row level security | N/A | No database or Supabase; the checker is client-side. |
| 5 | Copyleft open-source ingestion | Done | No GPL/AGPL/LGPL in installed packages; original code is MIT; React Bits terms are recorded. |
| 6 | Stripped MIT/Apache notices | Done | [LICENSE](LICENSE), [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md), and the React Bits licence. |
| 7 | No copyright in pure AI code | Partial | Git history and human edits exist, but copyrightability is a legal conclusion, not a code control. |
| 8 | Prompts are not authorship | Partial | Prompts and design decisions are not maintained as an authorship log; git history is the record. |
| 9 | Statutory damages exposure | Owner | Registration and litigation strategy need counsel. |
| 10 | Prompt input data leaks | Owner | No customer data is sent at runtime; development AI use and any DPA are operator decisions. |
| 11 | Trade-secret destruction | N/A | The repository is open source; no trade secret is claimed. |
| 12 | Missing SBOM | Partial | `package-lock.json` pins dependencies and notices exist, but there is no formal SBOM/CRA process. |
| 13 | Strict product liability for code | N/A | No software product is sold; this is a free demo. Reassess before distribution. |
| 14 | Privacy by design | Done | No data collection or hardcoded credentials; the checker runs locally. |
| 15 | Serverless recursive billing | N/A | No serverless functions or metered backend. |
| 16 | Rate limiting / spend exposure | N/A | Static GitHub Pages hosting; no application server or billable API. |
| 17 | Third-party API terms | N/A | No runtime third-party API calls. |
| 18 | Missing DMCA agent | N/A | No user-uploaded content. |
| 19 | CAN-SPAM | N/A | No marketing email. |
| 20 | TCPA / SMS | N/A | No SMS or waitlist texting. |
| 21 | California auto-renewal | N/A | No subscriptions or recurring payments. |
| 22 | Accessibility overlays | N/A | No overlay is used; fixes are in the markup and CSS. |
| 23 | Missing focus / focus traps | Done | Semantic controls, `:focus-visible`, no focus trap; the panel focuses Close and supports Escape. |
| 24 | Missing form labels | N/A | No data-collection or sign-up forms. The showroom's ScrubField has a local visual input with no submit or network request. |
| 25 | Missing image alt text | Partial | No content images in the checker; the third-party showroom visuals have not all been independently audited. |
| 26 | OWASP failure rates | Partial | Client-side static scanner, escaped output, no SQL/server; no independent penetration test. |
| 27 | AI chatbot deception | N/A | No chatbot. |
| 28 | Fabricated testimonials | N/A | No reviews or testimonials. |
| 29 | State privacy thresholds | N/A | No personal data is collected, so the thresholds are not triggered. |
| 30 | Unprotected API endpoints | N/A | No API or backend routes. |
| 31 | Hardcoded credentials | Done | No secrets found in the repository; the site is static. |
| 32 | Missing terms of service | Done | [legal.html#terms](legal.html#terms). |
| 33 | Personal liability from no entity | Owner | Incorporation or an LLC is an operator decision. |
| 34 | Insurance exclusions | Owner | Cyber/tech liability cover is an operator decision. |
| 35 | Contributor IP ambiguity | Owner | Written IP assignments are needed for collaborators. |
| 36 | EU AI Act staff literacy | N/A | No AI system is deployed; AI-assisted development only. Reassess if an AI feature is added. |
| 37 | Undocumented development lifecycle | Partial | Git history and tests exist; there is no separate design-decision log. |
| 38 | Hallucinated packages | Done | `package-lock.json` pins the tree; the test suite and build run against it. |
| 39 | Inaccurate software claims | Done | Limits are stated; the site does not claim "100% secure" or "error-free". |
| 40 | Ignoring opt-out signals | N/A | No tracking or sale, so there is no opt-out signal to honour. |

## Pillar B — mandatory website legalities (41–75)

| # | Requirement | Status | Where / why |
|---:|---|---|---|
| 41 | Compliant privacy policy | Done | [legal.html#privacy](legal.html#privacy). |
| 42 | Annual privacy-policy review | Partial | The policy carries a last-updated date; an annual review is an operator calendar task. |
| 43 | Terms of service | Done | [legal.html#terms](legal.html#terms), with a plain-language disclaimer. |
| 44 | Affirmative cookie consent | N/A | No cookies or non-essential storage are set. |
| 45 | CCPA/CTDPA opt-out | N/A | No sale, sharing, or targeted advertising. |
| 46 | "Do Not Sell or Share" link | N/A | The business does not sell or share personal information. |
| 47 | Cookie preference centre | N/A | No cookie preferences exist to manage. |
| 48 | DSAR mechanism | N/A | No personal data is stored; the privacy notice gives a contact route. |
| 49 | FTC dark patterns | Done | No consent UI, pre-checked boxes, or hidden reject buttons. |
| 50 | WCAG 2.1/2.2 AA | Partial | Target and known limits are published; not certified or manually audited with assistive-technology users. |
| 51 | 4.5:1 text contrast | Done | Muted text is 5.14:1, body 9.36:1, banned tag 7.24:1, evidence tag 5.9:1, links 7.56:1+. |
| 52 | 3:1 non-text contrast | Partial | The checker has no input borders or icon-only controls, and its focus ring uses the 7.56:1 accent; third-party showroom controls are not audited. |
| 53 | 24×24 touch targets | Done | The bookmarklet and panel Close control are at least 44px; inline links are exempt. |
| 54 | Keyboard navigation | Done | Native links/buttons; the panel is keyboard operable. |
| 55 | Visible focus | Done | Global `:focus-visible` outline in `styles.css`; panel Close has its own focus style. |
| 56 | Reflow at 320px / 200% | Partial | Responsive single-column layout; rechecked at 320px, but 200% browser zoom has not been separately audited. |
| 57 | Semantic HTML | Done | `header`, `main`, sections, headings, lists, footer, and a skip link. |
| 58 | Published accessibility statement | Done | [legal.html#accessibility](legal.html#accessibility). |
| 59 | PCI DSS | N/A | No payment handling. |
| 60 | HTTPS/TLS | Done | GitHub Pages serves the demo over HTTPS; no mixed-content resources. |
| 61 | Refund/return policy | N/A | No sales. |
| 62 | FTC shipping policy | N/A | No physical goods. |
| 63 | E-commerce terms of sale | N/A | No checkout or orders. |
| 64 | Copyright footer | Done | `© 2026 divitgangrade-lab` in the footer and [legal.html](legal.html). |
| 65 | DMCA takedown clause | N/A | No user-generated content. |
| 66 | TASL attribution | Done | Sources are linked; React Bits attribution is in the licence and notices. |
| 67 | Disclosure of media modifications | N/A | No third-party media is cropped or altered on the site. |
| 68 | CAN-SPAM unsubscribe | N/A | No marketing email. |
| 69 | Accurate email headers | N/A | No email is sent. |
| 70 | Advertising disclosures | N/A | No ads, sponsorships, or affiliate links. |
| 71 | Affiliate/legal disclaimers | Done | [legal.html#terms](legal.html#terms) covers external links and liability. |
| 72 | Professional-advice disclaimer | Done | The rules note and legal page say informational, not legal advice. |
| 73 | HIPAA disclosures | N/A | No health intake, booking, or patient data. |
| 74 | ABA legal-site rules | N/A | This is not a law-firm site. |
| 75 | Contact and ownership | Partial | GitHub Issues and the maintainer name are published; no physical address or company number is claimed. |

## Pillar C — avoidance and best practice (76–100)

| # | Practice | Status | Where / why |
|---:|---|---|---|
| 76 | Internal AI governance policy | Owner | The README discloses AI assistance; a formal approved-tool/input policy is an operator document. |
| 77 | Enterprise AI licences | Owner | Requires a commercial agreement and DPA. |
| 78 | Mandatory human review | Partial | Changes are reviewed through the repository and tests, but there is no formal approval gate. |
| 79 | Document human contributions | Partial | Git commits and tests are the record; no separate prompt/design log. |
| 80 | Substantially modify AI code | Partial | The project contains substantial human design and implementation; copyrightability remains a legal question. |
| 81 | Protect specifications as trade secrets | N/A | The project is open source. |
| 82 | Licence and duplicate scanners | Partial | No GPL/AGPL/LGPL found and notices are present; no automated licence scanner in CI. |
| 83 | Data inventory and audit | Done | [legal.html#privacy](legal.html#privacy) records that no personal data, cookies, or trackers are used. |
| 84 | DPAs with vendors | Partial | No application vendors; GitHub Pages hosting is governed by GitHub's terms, not a negotiated DPA. |
| 85 | Self-host fonts | Done | System fonts; no remote font files. |
| 86 | Enforce RLS | N/A | No database. |
| 87 | DDoS and rate limiting | N/A | GitHub Pages handles hosting; there is no billable application endpoint. |
| 88 | Manual WCAG audit | Partial | The accessibility statement is published; no audit with assistive-technology users yet. |
| 89 | Top accessibility fixes | Partial | No images/forms to label; keyboard, focus, contrast, and reflow are addressed, but a full manual audit remains. |
| 90 | Contractual accessibility guarantees | N/A | No agency or third-party build contract. |
| 91 | Analytics consent mode | N/A | No analytics. |
| 92 | SMS prior express consent | N/A | No SMS. |
| 93 | Subscription disclosures | N/A | No subscriptions. |
| 94 | DMCA agent registration | N/A | No user content or uploads. |
| 95 | AI usage disclosures | Done | Footer and [legal.html](legal.html) disclose AI assistance; the README does too. |
| 96 | Incorporate | Owner | Entity formation is an operator decision. |
| 97 | Cyber/tech insurance | Owner | Insurance is an operator decision. |
| 98 | IP assignment agreements | Owner | Needed for employees and contractors. |
| 99 | MFA and access control | Owner | GitHub account and deployment access are operator settings. |
| 100 | Complaint resolution process | Partial | GitHub Issues is the public channel; no formal service-level process. |

## What a reader should take from this

- The demo's data posture is simple: it collects nothing, sets no cookies, and runs the scan locally. That makes a large block of the checklist genuinely inapplicable rather than "handled by a banner."
- The remaining **Owner** rows are not code defects. They are entity, insurance, contract, AI-vendor, and account-security decisions that a repository cannot make.
- The **Partial** rows are the honest residual gaps, chiefly formal accessibility auditing, a design-decision log, an SBOM/licence gate, and a formal complaints process.

If this demo becomes a commercial product, the register should be re-run with counsel; the N/A answers depend on staying a static, no-data, no-sale site.
