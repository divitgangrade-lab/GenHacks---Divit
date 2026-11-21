// The rule set, transcribed from Directive (EU) 2024/825, which amends the
// Unfair Commercial Practices Directive. Its blacklist applies from
// 27 September 2026, including to stock already on shelves.
//
// Two sources, both first-party:
//   https://eur-lex.europa.eu/eli/dir/2024/825/oj/eng
//   https://commission.europa.eu/document/download/3c257883-bb2a-4dd9-a6dc-501d587bb34f_en
//
// This file is data. The scanner reads it; nothing here knows about the DOM.

export const SOURCES = {
  directive: 'https://eur-lex.europa.eu/eli/dir/2024/825/oj/eng',
  guidance: 'https://commission.europa.eu/document/download/3c257883-bb2a-4dd9-a6dc-501d587bb34f_en',
}

export const RULES = [
  {
    id: 'generic',
    title: 'Generic environmental claim',
    severity: 'banned',
    citation: 'Annex I, point 4a',
    pattern: /\b(?:eco[- ]?friendly|environmentally[- ]friendly|climate[- ]friendly|carbon[- ]friendly|gentle on the environment|nature'?s friend|environmentally correct|ecological(?:ly)?|energy[- ]efficient|biodegradable|biobased)\b/gi,
    says: 'Generic claims are blacklisted unless the seller can show recognised excellent environmental performance for this specific claim.',
    evidence: 'An EU Ecolabel, a recognised national scheme such as Nordic Swan, or top performance under other EU law. "Energy efficient" can be shown with the top energy class under Regulation (EU) 2017/1369.',
  },
  {
    id: 'similar',
    title: 'The same promise in other words',
    severity: 'banned',
    citation: 'Annex I, point 4a, read with Recital 9 ("or similar statements")',
    // Recital 9 closes its list with "or similar statements that suggest or
    // create the impression of excellent environmental performance". These are
    // that clause applied, not phrases the Commission quotes.
    pattern: /\b(?:planet|earth)[- ]friendly\b|\benvironmentally sound\b|\beco[- ]conscious\b/gi,
    says: 'The blacklist gives examples and then adds "or similar statements". Wording that sells the same vague promise falls under the same ban.',
    evidence: 'The same evidence as a generic claim: recognised excellent environmental performance for this product, stated on the same page.',
  },
  {
    id: 'green',
    title: 'The word "green" used as a product claim',
    severity: 'banned',
    citation: 'Annex I, point 4a',
    pattern: /\bgreen\b/gi,
    // "green" is an ordinary word. Only flag it when it is attached to a
    // product, a purchase or a company, never to tea or beans.
    guard: context => /\bgreen\s+(?:product|products|choice|option|alternative|energy|packaging|bottle|future|company|brand|shopping|deal|line|range|credentials)\b|\b(?:go|going|buy|shop)\s+green\b|\b100%\s+green\b/i.test(context),
    says: 'The Commission names "green" as an example of a banned generic claim when it implies excellent environmental performance.',
    evidence: 'Same as any generic claim: recognised excellent environmental performance, stated explicitly next to the claim.',
  },
  {
    id: 'offset',
    title: 'Neutrality claim resting on offsets',
    severity: 'banned',
    citation: 'Annex I, point 4c',
    // The lookahead is what keeps "net zero by 2040" for the future-promise
    // rule. Without it this rule matches too and the two overlap, which used to
    // need a whole overlap resolver in the scanner.
    pattern: /\b(?:(?:carbon|climate)[- ]neutral|net[- ]zero|co(?:2|₂)[- ]neutral)(?!\s+by\s+(?:19|20)\d{2})\b|\b(?:carbon|climate)[- ]compensated\b|\bcarbon[- ](?:positive|negative)\b|\breduced climate impact\b|\blimited co(?:2|₂) footprint\b/gi,
    says: 'Claims of neutral, reduced or positive greenhouse-gas impact based on offsetting are banned outright. Only the product\'s own life-cycle impact counts.',
    evidence: 'A life-cycle assessment of the product itself, not purchased credits.',
  },
  {
    id: 'future',
    title: 'Future promise with no published plan',
    severity: 'needs-evidence',
    citation: 'Article 6(2)(d) UCPD',
    pattern: /\b(?:net[- ]zero|climate[- ]neutral|carbon[- ]neutral)\s+by\s+(?:19|20)\d{2}\b/gi,
    says: 'A promise about future environmental performance is misleading unless it comes with a detailed, realistic plan and independent verification.',
    evidence: 'A published implementation plan with interim targets, checked by an independent expert.',
  },
  {
    id: 'label',
    title: 'Sustainability label with no named scheme',
    severity: 'needs-evidence',
    citation: 'Annex I, point 2a',
    pattern: /\b(?:eco[- ]?certified|certified sustainable|sustainably certified)\b/gi,
    says: 'A sustainability label has to rest on a certification scheme or be set by a public authority. A label the seller invented does not count.',
    evidence: 'The name of the scheme, and a link to the certificate it issued.',
  },
]

// One place decides what a severity is called. The panel, the findings list and
// the rule table all read it from here.
export const TAG_LABEL = {
  banned: 'Banned',
  'needs-evidence': 'Needs evidence',
}

export function ruleById (id) {
  return RULES.find(rule => rule.id === id)
}
