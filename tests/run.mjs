// Run with: npm test   (or: node tests/run.mjs)
// No dependencies, no browser. The scanner is pure, so it is tested directly.

import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { scan, sentenceParts, summarise, verdictLine } from '../src/scan.js'
import { RULES, ruleById } from '../src/rules.js'
import {
  bytesText, domText, isSkippedElement, textFromSavedPage,
  SKIP_ATTRIBUTES, SKIP_IDS, SKIP_SELECTOR, SKIP_TAGS
} from '../src/text.js'
import { countPages, MIN_WORDS } from '../src/corpus.js'
import { RECITALS, quotedExamples } from '../src/recitals.js'

let passed = 0
let failed = 0

function test (name, fn) {
  try {
    fn()
    passed += 1
    console.log(`ok    ${name}`)
  } catch (error) {
    failed += 1
    console.log(`FAIL  ${name}\n      ${error.message}`)
  }
}

function assert (condition, message) {
  if (!condition) throw new Error(message || 'assertion failed')
}

function equal (actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message || 'mismatch'}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
  }
}

function ids (text) {
  return scan(text).map(hit => hit.ruleId)
}

const FIXTURE = [
  'Fern & Fold Bamboo Bottle',
  '£28 · 750 ml',
  'Our eco-friendly bottle is carbon neutral and packaged in biodegradable wrap.',
  'Every order is eco-certified by our own sustainability team, so you can go green without thinking about it.',
  'We are proud to be net zero by 2040.',
  'Pairs well with green tea and green beans.',
].join(' ')

test('a generic claim is caught', () => {
  equal(ids('Our eco-friendly bottle holds 750 ml.').join(), 'generic')
})

test('the word green attached to a product is caught', () => {
  assert(ids('Choose our green bottle instead.').includes('green'), 'green bottle not flagged')
})

test('green tea and green beans are left alone', () => {
  equal(scan('Pairs well with green tea and green beans.').length, 0)
})

test('going green is caught', () => {
  assert(ids('So you can go green without thinking.').includes('green'), 'go green not flagged')
})

test('a neutrality claim resting on offsets is caught', () => {
  equal(ids('This carton is carbon neutral.').join(), 'offset')
})

test('a dated promise outranks the plain neutrality match', () => {
  const hits = scan('We will be carbon neutral by 2030.')
  equal(hits.length, 1, 'one finding')
  equal(hits[0].ruleId, 'future')
  equal(hits[0].span.toLowerCase(), 'carbon neutral by 2030')
})

test('an invented certification is caught', () => {
  assert(ids('Every order is eco-certified by our own team.').includes('label'), 'label not flagged')
})

test('the full demo page produces four banned and two evidence findings', () => {
  const summary = summarise(scan(FIXTURE))
  equal(summary.banned, 4)
  equal(summary.needsEvidence, 2)
  equal(summary.total, 6)
})

// Recital 9 and Recital 12 of Directive (EU) 2024/825 name the phrasings the
// bans are about. Every quote is pinned to the rule that reads it and the
// article that rule cites, so a renamed rule, a dropped pattern or a drifted
// citation fails the build. A quoted phrase no rule matches is the regression
// this table exists to catch.
const RECITAL_9 = [
  // [quoted phrase, sentence to scan, rule id, citation]
  ['environmentally friendly', 'Our environmentally friendly bottle.', 'generic', 'Annex I, point 4a'],
  ['eco-friendly', 'Our eco-friendly bottle.', 'generic', 'Annex I, point 4a'],
  ['green', 'Our green bottle.', 'green', 'Annex I, point 4a'],
  ['nature’s friend', 'A bottle that is nature’s friend.', 'generic', 'Annex I, point 4a'],
  ['ecological', 'An ecological bottle.', 'generic', 'Annex I, point 4a'],
  ['environmentally correct', 'An environmentally correct bottle.', 'generic', 'Annex I, point 4a'],
  ['climate friendly', 'A climate friendly bottle.', 'generic', 'Annex I, point 4a'],
  ['gentle on the environment', 'A wash that is gentle on the environment.', 'generic', 'Annex I, point 4a'],
  ['carbon friendly', 'A carbon friendly bottle.', 'generic', 'Annex I, point 4a'],
  ['energy efficient', 'An energy efficient bottle.', 'generic', 'Annex I, point 4a'],
  ['biodegradable', 'A biodegradable wrap.', 'generic', 'Annex I, point 4a'],
  ['biobased', 'A biobased bottle.', 'generic', 'Annex I, point 4a'],
]

const RECITAL_12 = [
  ['climate neutral', 'This carton is climate neutral.', 'offset', 'Annex I, point 4c'],
  ['CO₂ neutral certified', 'This carton is CO₂ neutral certified.', 'offset', 'Annex I, point 4c'],
  ['carbon positive', 'This carton is carbon positive.', 'offset', 'Annex I, point 4c'],
  ['climate net zero', 'This carton is climate net zero.', 'offset', 'Annex I, point 4c'],
  ['climate compensated', 'This carton is climate compensated.', 'offset', 'Annex I, point 4c'],
  ['reduced climate impact', 'A carton with reduced climate impact.', 'offset', 'Annex I, point 4c'],
  ['limited CO₂ footprint', 'A carton with a limited CO₂ footprint.', 'offset', 'Annex I, point 4c'],
]

function conformance (recital, table, count) {
  test(`every phrase Recital ${recital} quotes appears verbatim and maps to its rule`, () => {
    equal(table.length, count, `Recital ${recital} quotes ${count} examples`)
    const source = RECITALS[recital]
    const quotes = quotedExamples(recital)
    equal(quotes.length, table.length, `Recital ${recital} quotes ${quotes.length} phrases, the table has ${table.length}`)
    for (const [quote, text, ruleId, citation] of table) {
      assert(source.includes(quote), `${quote} does not appear verbatim in the vendored Recital ${recital}`)
      const rule = ruleById(ruleId)
      assert(rule, `${quote} maps to missing rule ${ruleId}`)
      assert(new RegExp(rule.pattern.source, rule.pattern.flags.replace('g', '')).test(quote), `rule ${ruleId} does not match its quoted phrase ${quote}`)
      assert(text.toLowerCase().includes(quote.toLowerCase()), `${quote} is not in the sample text`)
      const fired = [...new Set(scan(text).map(hit => hit.ruleId))]
      equal(fired.join('|'), ruleId, `${quote} produced ${fired.join('|') || 'no findings'}`)
      equal(rule.citation, citation, `${quote} cites the wrong article`)
    }
  })
}

// The other direction: parse the phrases out of the vendored recital and make
// sure the rule table covers every one. A new quote in the directive fails here
// even if nobody remembers to add it to the table above.
function recitalCoverage (recital, table) {
  test(`every phrase Recital ${recital} names is covered by a rule (parsed from the text)`, () => {
    const rows = new Map(table.map(row => [row[0], row]))
    const quotes = quotedExamples(recital)
    assert(quotes.length > 0, `Recital ${recital} yielded no quoted phrases`)
    for (const quote of quotes) {
      const row = rows.get(quote)
      assert(row, `Recital ${recital} names “${quote}” but no rule row covers it`)
      const [, sample, ruleId] = row
      const fired = [...new Set(scan(sample).map(hit => hit.ruleId))]
      equal(fired.join('|'), ruleId, `“${quote}” produced ${fired.join('|') || 'no findings'}`)
    }
    equal(rows.size, quotes.length, `the Recital ${recital} table has a row the text does not name`)
  })
}

conformance(9, RECITAL_9, 12)
conformance(12, RECITAL_12, 7)
recitalCoverage(9, RECITAL_9)
recitalCoverage(12, RECITAL_12)

// The same words in ordinary use, and specific claims the directive does not
// blacklist, must stay quiet. ``green`` is only a claim when it is attached to a
// product, so these catch an over-eager rule.
const NOT_BANNED = [
  ['green tea', 'Pairs well with green tea.'],
  ['green beans', 'Pairs well with green beans.'],
  ['greenhouse gas', 'We publish our greenhouse gas emissions.'],
  ['green light', 'The project got the green light.'],
  ['eco mode', 'Press eco mode to use less water.'],
  ['ecosystem', 'Healthy soil needs a living ecosystem.'],
  ['recycled aluminium', 'The body is recycled aluminium.'],
]

test('ordinary uses of the same words are not banned', () => {
  for (const [term, text] of NOT_BANNED) {
    equal(scan(text).length, 0, `${term} was flagged as ${ids(text).join('|')}`)
  }
})

test('energy efficient is one of the named examples', () => {
  equal(ids('An energy efficient kettle.').join(), 'generic')
})

test('planet-friendly is caught as a similar statement', () => {
  equal(ids('A planet-friendly bottle.').join(), 'similar')
})

test('earth-friendly is caught the same way', () => {
  assert(ids('Earth friendly refills.').includes('similar'), 'earth friendly not flagged')
})

test('the offset rule covers the greenhouse-gas wordings the Commission lists', () => {
  const phrases = ['CO2 neutral', 'CO₂ neutral', 'climate compensated', 'reduced climate impact', 'limited CO2 footprint', 'climate net zero']
  for (const phrase of phrases) {
    assert(ids(`This carton is ${phrase}.`).includes('offset'), `missed: ${phrase}`)
  }
})

test('a specific reduced-impact claim is not swept up', () => {
  equal(scan('Reduced CO2 impact, from 100% renewable electricity at this plant.').length, 0)
})

test('terms the directive does not blacklist are left alone', () => {
  for (const phrase of ['sustainable', 'conscious', 'responsible', 'natural']) {
    equal(scan(`A ${phrase} choice for the home.`).length, 0, `over-reached on "${phrase}"`)
  }
})

test('a compliant page produces no findings', () => {
  const text = 'Body is 100% recycled aluminium. Licensed under the EU Ecolabel, licence DK/001. Spare parts sold for ten years.'
  equal(scan(text).length, 0, 'clean copy flagged')
})

test('every finding reads back to a real rule', () => {
  for (const hit of scan(FIXTURE)) {
    assert(ruleById(hit.ruleId), `unknown rule id ${hit.ruleId}`)
    assert(hit.context.length > hit.span.length, 'context missing')
    assert(hit.sentence.includes(hit.span), 'sentence missing the matched span')
  }
})

test('each finding carries the sentence around the match', () => {
  const hits = scan('Recycled body. Our eco-friendly bottle is here. Ships flat.')
  equal(hits.length, 1)
  equal(hits[0].sentence, 'Our eco-friendly bottle is here.')
  const parts = sentenceParts(hits[0])
  equal(parts.before, 'Our ')
  equal(parts.match, 'eco-friendly')
  equal(parts.after, ' bottle is here.')
})

test('a heading on its own line does not join the first sentence', () => {
  const [hit] = scan('Fern & Fold Bottle\n£28 · 750 ml\nOur eco-friendly bottle.')
  equal(hit.sentence, 'Our eco-friendly bottle.')
  equal(sentenceParts(hit).before, 'Our ')
})

test('findings come back in reading order', () => {
  const hits = scan(FIXTURE)
  for (let i = 1; i < hits.length; i += 1) {
    assert(hits[i].start > hits[i - 1].start, 'findings out of order')
  }
})

test('every rule can cite itself and say what would satisfy it', () => {
  for (const rule of RULES) {
    assert(rule.citation, `${rule.id} has no citation`)
    assert(rule.evidence, `${rule.id} has no evidence line`)
    assert(rule.says, `${rule.id} has no plain explanation`)
    assert(rule.pattern.global, `${rule.id} pattern must be global`)
    assert(rule.severity === 'banned' || rule.severity === 'needs-evidence', `${rule.id} has a bad severity`)
  }
})

test('no rule can match an empty string', () => {
  // The scanner no longer guards against zero-length matches; this is what
  // makes that safe.
  for (const rule of RULES) {
    const pattern = new RegExp(rule.pattern.source, rule.pattern.flags)
    assert(pattern.exec('') === null, `${rule.id} matches empty input`)
  }
})

test('the verdict line stays honest about a clean page', () => {
  equal(verdictLine(summarise([])), 'No banned or unsubstantiated environmental claims were found on this page.')
})

test('the verdict line counts both severities', () => {
  const line = verdictLine(summarise(scan(FIXTURE)))
  assert(line.startsWith('4 banned claims and 2 needing evidence'), line)
})

// --- the shared page-text seam and the corpus counting rules ---

function filler (words) {
  return Array.from({ length: words }, (_, i) => `word${i}`).join(' ')
}

test('a saved page drops a region marked data-scan-skip', () => {
  const html = '<body><div data-scan-skip><p>Our eco-friendly bottle is carbon neutral.</p></div><p>Body is 100% recycled aluminium.</p></body>'
  const text = textFromSavedPage(html)
  assert(!/eco-friendly/i.test(text), 'the skipped region survived')
  assert(/recycled aluminium/.test(text), 'the rest of the page was lost')
  equal(scan(text).length, 0)
})

test('a data-scan-skip region goes whole, however deeply nested', () => {
  const html = '<body><div data-scan-skip><div><p>eco-friendly</p><div>carbon neutral</div></div></div><p>Spare parts sold for ten years.</p></body>'
  const text = textFromSavedPage(html)
  equal(scan(text).length, 0, 'text leaked out of the skipped region')
  assert(text.includes('ten years'), 'the text after the region was lost')
})

test('nested data-scan-skip regions end at the outer close tag', () => {
  const html = '<body><div data-scan-skip><div data-scan-skip>eco-friendly</div>carbon neutral</div><p>Body is recycled aluminium.</p></body>'
  const text = textFromSavedPage(html)
  assert(!/carbon neutral/i.test(text), 'text after the inner region leaked out')
  assert(/recycled aluminium/.test(text), 'the rest of the page was lost')
})

test('a save that ends inside a skipped region drops the tail', () => {
  const text = textFromSavedPage('<body><p>Body is recycled aluminium.</p><div data-scan-skip><p>eco-friendly')
  assert(/recycled aluminium/.test(text), 'the text before the region was lost')
  assert(!/eco-friendly/i.test(text), 'text after an unclosed region survived')
})

test('a trailing slash closes void elements and svg, not html elements', () => {
  const div = textFromSavedPage('<body><div data-scan-skip/>eco-friendly</div><p>recycled aluminium</p></body>')
  assert(!/eco-friendly/i.test(div), 'a slash closed an html element the browser keeps open')
  assert(/recycled aluminium/.test(div))

  const svg = textFromSavedPage('<body><svg data-scan-skip/>eco-friendly bottle<p>recycled aluminium</p></body>')
  assert(/eco-friendly bottle/.test(svg), 'a self-closed svg swallowed the rest of the page')
  assert(/recycled aluminium/.test(svg))

  const img = textFromSavedPage('<body><img data-scan-skip src="x.png">eco-friendly bottle</body>')
  assert(/eco-friendly bottle/.test(img), 'a marked void element swallowed the page')
})

test('the saved-page reader drops the same non-prose blocks as the browser walker', () => {
  for (const tag of ['script', 'style', 'noscript', 'template', 'svg', 'iframe']) {
    const text = textFromSavedPage(`<body><${tag}>eco-friendly bottle</${tag}><p>Body is recycled aluminium.</p></body>`)
    assert(!/eco-friendly/i.test(text), `${tag} text was read`)
    assert(/recycled aluminium/.test(text), `${tag} swallowed the rest of the page`)
  }
  const withoutTitle = textFromSavedPage('<html><head><title>Eco-friendly bottle</title></head><body><p>Body is recycled aluminium.</p></body></html>')
  assert(!/eco-friendly/i.test(withoutTitle), 'the <title> was read as page text')

  const withHidden = textFromSavedPage('<body><p hidden>eco-friendly bottle</p><p aria-hidden="true">Carbon neutral carton</p><p>Body is recycled aluminium.</p></body>')
  assert(!/eco-friendly/i.test(withHidden), 'a hidden block was read')
  assert(/carbon neutral/i.test(withHidden), 'aria-hidden text is visible, so it should be read')
})

test('markup between words does not glue them together', () => {
  equal(textFromSavedPage('<p>Body is <b>recycled</b><br>aluminium.</p>'), 'Body is recycled aluminium.')
  equal(textFromSavedPage('<p>Body is recycled<p>aluminium.</p>'), 'Body is recycled aluminium.')
})

test('a saved page decodes entities before scanning', () => {
  const found = ids(textFromSavedPage('<p>Our eco&nbsp;friendly bottle is carbon&#160;neutral.</p>'))
  assert(found.includes('generic'), 'eco friendly was not matched after decoding')
  assert(found.includes('offset'), 'carbon neutral was not matched after decoding')
  const friend = ids(textFromSavedPage('<p>A bottle that is nature&rsquo;s friend.</p>'))
  assert(friend.includes('generic'), 'the recital’s curly apostrophe was lost after decoding')
})

test('the corpus reads the demo card the same way the bookmarklet does', () => {
  const html = `<article id="fixture" data-scan-root>
    <h2>Fern &amp; Fold Bamboo Bottle</h2>
    <p class="product__price">£28 · 750 ml</p>
    <p>Our eco-friendly bottle is carbon neutral and packaged in biodegradable wrap. Every order is eco-certified by our own sustainability team, so you can go green without thinking about it.</p>
    <p>We are proud to be net zero by 2040.</p>
    <p class="product__aside">Pairs well with green tea and green beans.</p>
  </article>`
  const summary = summarise(scan(textFromSavedPage(html)))
  equal(summary.banned, 4, 'banned claims')
  equal(summary.needsEvidence, 2, 'claims needing evidence')
  equal(summary.total, 6, 'findings')
})

test('a file too short to be a page is skipped, not counted clean', () => {
  const result = countPages([{ file: 'consent-wall.html', text: `eco-friendly ${filler(28)}` }])
  equal(MIN_WORDS, 30, 'the floor moved')
  equal(result.pages.length, 0, 'short file read as a page')
  equal(result.skipped, 1, 'short file not reported')
  equal(result.pagesWithBannedClaim, 0)
  equal(result.bannedRate, 0)
  equal(result.findings, 0, 'a skipped file contributed findings')
})

test('a page at the word floor is read and counted', () => {
  const result = countPages([{ file: 'thirty.html', text: `eco-friendly ${filler(29)}` }])
  equal(result.pages.length, 1)
  equal(result.pagesWithBannedClaim, 1)
  equal(result.skipped, 0)
})

test('a page counts once however many claims it carries', () => {
  const text = `eco-friendly, carbon neutral, planet-friendly, eco-certified. ${filler(26)}`
  const result = countPages([{ file: 'many.html', text }])
  equal(result.pages.length, 1)
  equal(result.findings, 4, 'findings are counted per hit')
  equal(result.pagesWithBannedClaim, 1, 'the page was counted more than once')
})

test('the per-rule table counts pages, not mentions', () => {
  const result = countPages([{ file: 'repeat.html', text: `eco-friendly eco-friendly eco-friendly ${filler(27)}` }])
  equal(result.findings, 3, 'mentions')
  equal(result.byRule.get('generic'), 1, 'pages carrying the rule')
})

test('the per-rule table lists every rule, including the ones nothing matched', () => {
  const result = countPages([])
  equal(result.byRule.size, RULES.length)
  for (const rule of RULES) equal(result.byRule.get(rule.id), 0, rule.id)
})

test('the hit rate is over pages read, not files saved', () => {
  const result = countPages([
    { file: 'a.html', text: `eco-friendly ${filler(29)}` },
    { file: 'b.html', text: `Body is 100% recycled aluminium. ${filler(29)}` },
    { file: 'c.html', text: 'Loading…' },
  ])
  equal(result.pages.length, 2, 'pages read')
  equal(result.skipped, 1, 'files skipped')
  equal(result.pagesWithBannedClaim, 1)
  equal(result.bannedRate, 50, 'rate should ignore the skipped file')
})

// --- one page-text contract, two adapters ---

function textNode (value, skipped) {
  return {
    nodeValue: value,
    parentElement: { closest: selector => (skipped && selector === SKIP_SELECTOR ? {} : null) }
  }
}

function stubDocument (nodes) {
  return {
    createTreeWalker: () => {
      let index = 0
      return { nextNode: () => (index < nodes.length ? nodes[index++] : null) }
    }
  }
}

test('both readers implement one contract', () => {
  const dom = domText(stubDocument([]))
  const bytes = bytesText()
  equal(dom.text(null), '', 'a missing root reads as nothing')
  equal(bytes.text('<p>Body is recycled aluminium.</p>'), 'Body is recycled aluminium.')
})

test('the DOM adapter drops text inside a skipped region', () => {
  const doc = stubDocument([
    textNode('Our eco-friendly bottle', false),
    textNode('is carbon neutral', true)
  ])
  equal(domText(doc).text({}), 'Our eco-friendly bottle')
})

test('block mode keeps a heading off the paragraph that follows', () => {
  const root = { closest: () => null }
  const heading = { tagName: 'H1', parentElement: root, closest: () => null }
  const para = { tagName: 'P', parentElement: root, closest: () => null }
  const node = (value, parent) => ({ nodeValue: value, parentElement: parent })
  const doc = stubDocument([
    node('Fern & Fold Bottle', heading),
    node('Our eco-friendly bottle.', para)
  ])
  equal(domText(doc).text({}, { blocks: true }), 'Fern & Fold Bottle\nOur eco-friendly bottle.')
  equal(domText(doc).text({}), 'Fern & Fold Bottle Our eco-friendly bottle.')
})

test('the two adapters are built from one skip definition', () => {
  for (const tag of SKIP_TAGS) {
    assert(SKIP_SELECTOR.includes(tag), `${tag} missing from the DOM selector`)
    assert(isSkippedElement(tag, ''), `${tag} not skipped for saved bytes`)
  }
  for (const attribute of SKIP_ATTRIBUTES) {
    assert(SKIP_SELECTOR.includes(`[${attribute}]`), `[${attribute}] missing from the DOM selector`)
    assert(isSkippedElement('div', ` ${attribute}`), `${attribute} not skipped for saved bytes`)
  }
  for (const id of SKIP_IDS) {
    assert(SKIP_SELECTOR.includes(`#${id}`), `#${id} missing from the DOM selector`)
    assert(isSkippedElement('div', ` id="${id}"`), `${id} not skipped for saved bytes`)
  }
  assert(!isSkippedElement('div', ' aria-hidden="true"'), 'aria-hidden text is visible and should be read')
})

// --- the corpus script itself: files in, exit code and report out ---

const CORPUS_SCRIPT = fileURLToPath(new URL('../scripts/corpus.mjs', import.meta.url))

function withFolder (run) {
  const dir = mkdtempSync(join(tmpdir(), 'claim-check-'))
  try {
    return run(dir)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

function corpus (...args) {
  try {
    const stdout = execFileSync(process.execPath, [CORPUS_SCRIPT, ...args], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    })
    return { status: 0, stdout, stderr: '' }
  } catch (error) {
    return { status: error.status ?? 1, stdout: String(error.stdout || ''), stderr: String(error.stderr || '') }
  }
}

function savePage (folder, name, text) {
  writeFileSync(join(folder, name), `<!doctype html><html><body><p>${text}</p></body></html>`)
}

test('corpus script: a page counts once, however many claims it carries', () => withFolder(dir => {
  savePage(dir, 'many.html', `eco-friendly, carbon neutral, planet-friendly, eco-certified. ${filler(26)}`)
  const { status, stdout } = corpus(dir, '--json')
  equal(status, 0)
  const report = JSON.parse(stdout)
  equal(report.pagesRead, 1, 'pages read')
  equal(report.findings, 4, 'findings are counted per hit')
  equal(report.pagesWithBannedClaim, 1, 'the page was counted more than once')
}))

test('corpus script: a mixed folder accumulates per-rule counts and rates pages read', () => withFolder(dir => {
  savePage(dir, '001-banned.html', `eco-friendly ${filler(29)}`)
  savePage(dir, '002-banned.html', `eco-friendly ${filler(29)}`)
  savePage(dir, '003-clean.html', `Body is 100% recycled aluminium. ${filler(28)}`)
  savePage(dir, '004-short.html', 'Eco-friendly.')

  const { status, stdout } = corpus(dir, '--json')
  equal(status, 0)
  const report = JSON.parse(stdout)
  equal(report.pagesRead, 3, 'the short save is not a page read')
  equal(report.skipped, 1, 'the short save is reported separately')
  equal(report.pagesWithBannedClaim, 2, 'the two banned pages count once each')
  equal(report.bannedRate, 66.7, 'the rate uses pages read, not files saved')
  equal(report.findings, 2, 'one finding on each banned page')
  equal(report.byRule.generic, 2, 'the per-rule count accumulates across pages')

  const clean = report.pages.find(page => page.file === '003-clean.html')
  assert(clean, 'the clean page is missing from the report')
  equal(clean.banned, 0, 'the clean page was flagged')

  const text = corpus(dir).stdout
  assert(/^\s*2 pages\s+banned\s+generic$/m.test(text), text)
}))

test('corpus script: a save under 30 words is skipped, not counted clean', () => withFolder(dir => {
  savePage(dir, 'cookie-wall.html', 'Loading… please accept cookies. Our eco-friendly bottle is carbon neutral.')
  const report = JSON.parse(corpus(dir, '--json').stdout)
  equal(report.pagesRead, 0)
  equal(report.skipped, 1)
  equal(report.pagesWithBannedClaim, 0)
  equal(report.bannedRate, 0)

  const text = corpus(dir).stdout
  assert(!/\bclean\b/.test(text), 'a skipped save was reported as a clean page')
  assert(/1 skipped as too short to be a page/.test(text), text)
}))

test('corpus script: the per-rule table counts a page once per rule', () => withFolder(dir => {
  savePage(dir, 'repeat.html', `eco-friendly eco-friendly eco-friendly ${filler(27)}`)
  const report = JSON.parse(corpus(dir, '--json').stdout)
  equal(report.findings, 3, 'mentions')
  equal(report.byRule.generic, 1, 'pages carrying the rule')

  const text = corpus(dir).stdout
  assert(/^\s*1 pages\s+banned\s+generic$/m.test(text), text)
}))

test('corpus script: claims inside a data-scan-skip region are not counted', () => withFolder(dir => {
  writeFileSync(join(dir, 'quoted.html'), `<!doctype html><html><body>
    <div data-scan-skip><p>Our eco-friendly bottle is carbon neutral.</p></div>
    <p>${filler(30)}</p>
  </body></html>`)
  const report = JSON.parse(corpus(dir, '--json').stdout)
  equal(report.pagesRead, 1, 'the page itself is read')
  equal(report.findings, 0, 'text the bookmarklet skips was counted')
}))

test('corpus script: a folder path with a space still runs', () => withFolder(dir => {
  const spaced = join(dir, 'saved pages')
  mkdirSync(spaced)
  savePage(spaced, 'one.html', `eco-friendly ${filler(29)}`)
  const { status, stdout } = corpus(spaced, '--json')
  equal(status, 0, 'the path guard skipped main() for a path with a space')
  equal(JSON.parse(stdout).pagesRead, 1)
}))

test('corpus script: a missing folder exits 1 and points at the docs', () => withFolder(dir => {
  const { status, stderr } = corpus(join(dir, 'not-saved-yet'))
  equal(status, 1)
  assert(stderr.includes('no such folder'), stderr)
  assert(stderr.includes('README.md'), stderr)
}))

test('corpus script: a folder with no page files exits 1', () => withFolder(dir => {
  writeFileSync(join(dir, 'notes.png'), 'not a page')
  const { status, stderr } = corpus(dir)
  equal(status, 1)
  assert(stderr.includes('No .html, .htm or .txt files'), stderr)
}))

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed === 0 ? 0 : 1)
