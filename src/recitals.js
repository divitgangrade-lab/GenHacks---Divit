// Recital 9 and Recital 12 of Directive (EU) 2024/825, vendored verbatim so the
// conformance test can check the rule set against the directive's own words
// instead of a hand-copied phrase list.
//
// Source: OJ L, 2024/825, 6.3.2024 (CELEX 32024L0825),
// https://eur-lex.europa.eu/eli/dir/2024/825/oj/eng
//
// The Official Journal renders the "2" in CO2 as a subscript. That is written
// here as U+2082 (₂), which is what the printed text shows; the scanner also
// accepts the plain ASCII "CO2" found in saved pages.

export const RECITAL_SOURCE = 'https://eur-lex.europa.eu/eli/dir/2024/825/oj/eng'

export const RECITALS = {
  9: `Annex I to Directive 2005/29/EC should also be amended to prohibit the making of a generic environmental claim without recognised excellent environmental performance which is relevant to the claim. Examples of generic environmental claims include ‘environmentally friendly’, ‘eco-friendly’, ‘green’, ‘nature’s friend’, ‘ecological’, ‘environmentally correct’, ‘climate friendly’, ‘gentle on the environment’, ‘carbon friendly’, ‘ energy efficient’, ‘biodegradable’, ‘biobased’ or similar statements that suggest or create the impression of excellent environmental performance. Such generic environmental claims should be prohibited when recognised excellent environmental performance cannot be demonstrated. Whenever the specification of the environmental claim is provided in clear and prominent terms on the same medium, such as the same advertising spot, the product’s packaging or online selling interface, the environmental claim is not considered to be a generic environmental claim.

For example, the claim ‘climate-friendly packaging’ would be a generic claim, whilst claiming that ‘100 % of energy used to produce this packaging comes from renewable sources’ would be a specific claim, which would not fall under this prohibition, without prejudice to other provisions of Directive 2005/29/EC remaining applicable to those specific claims. Furthermore, a claim made in written form or orally combined with implicit claims such as colours or images could constitute a generic environmental claim.`,

  12: `It is particularly important to prohibit the making of claims, based on the offsetting of greenhouse gas emissions, that a product, either a good or service has a neutral, reduced, or positive impact on the environment in terms of greenhouse gas emissions. Such claims should be prohibited in all circumstances and added to the list in Annex I to Directive 2005/29/EC as they mislead consumers by making them believe that such claims relate to the product itself or to the supply and production of that product, or as they give the false impression to consumers that the consumption of that product does not have an environmental impact. Examples of such claims are ‘climate neutral’, ‘CO₂ neutral certified’, ‘carbon positive’, ‘climate net zero’, ‘climate compensated’, ‘reduced climate impact’ and ‘limited CO₂ footprint’.

Such claims should only be allowed when they are based on the actual lifecycle impact of the product in question, and not based on the offsetting of greenhouse gas emissions outside the product’s value chain, as the former and the latter are not equivalent. Such a prohibition should not prevent companies from advertising their investments in environmental initiatives, including carbon credit projects, as long as they provide such information in a way that is not misleading and that complies with the requirements laid down in Union law.`
}

// The sentence in each recital that lists the banned phrasings. Parsing the
// quotes out of the vendored text is what makes the coverage check two-way:
// a phrase added to the recital fails until a rule covers it, and a phrase a
// rule claims as a quote fails if the recital does not contain it.
const EXAMPLE_LEADS = {
  9: 'Examples of generic environmental claims include',
  12: 'Examples of such claims are'
}

export function quotedExamples (recital) {
  const text = RECITALS[recital]
  const lead = EXAMPLE_LEADS[recital]
  if (!text || !lead) throw new Error(`No vendored example sentence for Recital ${recital}`)
  const start = text.indexOf(lead)
  if (start === -1) throw new Error(`Recital ${recital} no longer contains its example sentence`)
  const end = text.indexOf('.', start)
  if (end === -1) throw new Error(`Recital ${recital} example sentence has no full stop`)
  // Apostrophes inside a quote (“nature’s friend”) are right single quotes
  // too, so keep one when a letter follows it; the closing quote is followed
  // by punctuation or a space.
  return [...text.slice(start, end).matchAll(/‘\s*((?:[^‘’]|’(?=[A-Za-z]))+?)\s*’(?![A-Za-z])/g)]
    .map(([, quote]) => quote.replace(/\s+/g, ' ').trim())
}
