// Run with: npm test   (or: node tests/run.mjs)
// No dependencies, no browser. The scanner is pure, so it is tested directly.

import { scan, summarise, verdictLine } from '../src/scan.js'
import { RULES, ruleById } from '../src/rules.js'

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
  }
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

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed === 0 ? 0 : 1)
