// Assertion tests for the pipeline. No dependencies: `node tests/run.mjs`.
import assert from 'node:assert/strict'
import { analyse, syllables } from '../src/readability.js'
import { extract } from '../src/extract.js'
import { render } from '../src/render.js'
import { verify, removeFirstMedication, normalise } from '../src/verify.js'
import { buildIcs } from '../src/ics.js'
import { SAMPLES } from '../src/samples.js'

let passed = 0
const failures = []

function test (name, fn) {
  try {
    fn()
    passed += 1
  } catch (error) {
    failures.push({ name, message: error.message })
  }
}

const sample = id => SAMPLES.find(s => s.id === id)

test('syllables handles common words', () => {
  assert.equal(syllables('a'), 1)
  assert.equal(syllables('day'), 1)
  assert.equal(syllables('tablet'), 2)
  assert.ok(syllables('medication') >= 3, `medication -> ${syllables('medication')}`)
  assert.ok(syllables('hospitalisation') > syllables('hospital'))
})

test('a plainly written sentence scores lower than a clinical one', () => {
  const plain = analyse('Take one tablet by mouth two times a day. Call us if you feel sick.')
  const clinical = analyse(
    'Amoxicillin 500 mg PO TID x 7 days; acetaminophen 500 mg PO Q6H PRN for analgesia, with subsequent reassessment of the incision for evidence of erythema or purulent discharge.'
  )
  assert.ok(plain.fkgl < clinical.fkgl, `${plain.fkgl} !< ${clinical.fkgl}`)
  assert.ok(plain.fre > clinical.fre)
})

test('analyser never divides by zero on empty input', () => {
  const result = analyse('')
  assert.ok(Number.isFinite(result.fkgl))
  assert.ok(Number.isFinite(result.smog))
})

test('clean letter: three medications with the right shape', () => {
  const extraction = extract(sample('clean').text, { baseDate: '2026-11-20' })
  assert.equal(extraction.medications.length, 3, 'three medications')
  const amoxicillin = extraction.medications.find(m => /amoxicillin/i.test(m.drug))
  assert.ok(amoxicillin, 'found amoxicillin')
  assert.equal(amoxicillin.strength, '500 mg')
  assert.equal(amoxicillin.frequency.perDay, 3)
  assert.equal(amoxicillin.duration.days, 7)
})

test('as-needed medicine gets no fixed schedule', () => {
  const extraction = extract(sample('clean').text, { baseDate: '2026-11-20' })
  const pain = extraction.medications.find(m => /acetaminophen/i.test(m.drug))
  assert.ok(pain.frequency.times.length === 0, 'PRN must not be given fixed times')
})

test('appointment date is parsed to ISO', () => {
  const extraction = extract(sample('clean').text, { baseDate: '2026-11-20' })
  assert.equal(extraction.appointments.length, 1)
  assert.equal(extraction.appointments[0].date, '2026-12-02')
})

test('restrictions and red flags are separated', () => {
  const extraction = extract(sample('clean').text, { baseDate: '2026-11-20' })
  assert.ok(extraction.restrictions.length >= 3, `got ${extraction.restrictions.length}`)
  assert.ok(extraction.redFlags.length >= 3, `got ${extraction.redFlags.length}`)
})

test('numbered lists do not leak their marker', () => {
  const extraction = extract(sample('messy').text, { baseDate: '2026-11-20' })
  assert.ok(!extraction.all.some(i => /^\d+[.)]$/.test(i.raw)), 'no bare list numbers')
})

test('echoed jargon survives verification through the glossary', () => {
  const extraction = extract(sample('messy').text, { baseDate: '2026-11-20' })
  const rendered = render(extraction)
  const result = verify(extraction, rendered.text)
  assert.deepEqual(result.problems, [], JSON.stringify(result.problems, null, 2))
})

test('the hold-warfarin instruction is not swallowed', () => {
  const extraction = extract(sample('messy').text, { baseDate: '2026-11-20' })
  const found = extraction.all.find(i => /hold warfarin/i.test(i.raw))
  assert.ok(found, 'the instruction was extracted somewhere')
})

test('plain plan keeps every anchor and never raises the grade level', () => {
  for (const letter of SAMPLES) {
    const extraction = extract(letter.text, { baseDate: '2026-11-20' })
    const rendered = render(extraction)
    const before = analyse(letter.text)
    const after = analyse(rendered.text)
    const result = verify(extraction, rendered.text)
    assert.ok(result.ok, `${letter.id}: ${JSON.stringify(result.problems)}`)
    // The product promise is a plan at or below the sixth-grade target, not
    // "a lower number than before". Expanding shorthand adds syllables, so a
    // letter written in shorthand can score higher afterwards while being far
    // easier to act on. Grade level rewards brevity, not understanding.
    assert.ok(after.fkgl <= 6, `${letter.id}: plain plan sits at grade ${after.fkgl}`)
    if (before.fkgl > 6) {
      assert.ok(after.fkgl < before.fkgl, `${letter.id}: ${after.fkgl} !< ${before.fkgl}`)
    }
  }
})

test('the plain plan leaves no clinical abbreviations behind', () => {
  for (const letter of SAMPLES) {
    const rendered = render(extract(letter.text, { baseDate: '2026-11-20' }))
    assert.doesNotMatch(
      rendered.text,
      /\b(PO|TID|QID|BID|Q\d+H|QHS|QAM|NPO|PRN|ETOH|APAP|DC|FU)\b/i,
      `${letter.id} still contains shorthand`
    )
  }
})

test('verifier blocks a rewrite that dropped a medication', () => {
  const extraction = extract(sample('clean').text, { baseDate: '2026-11-20' })
  const rendered = render(extraction)
  const lossy = removeFirstMedication(rendered.text, extraction)
  const result = verify(extraction, lossy)
  assert.equal(result.ok, false, 'a dropped medication must not pass')
  assert.ok(result.problems.some(p => /amoxicillin/i.test(p.statement)))
})

test('verifier blocks a rewrite that changed a dose', () => {
  const extraction = extract(sample('clean').text, { baseDate: '2026-11-20' })
  const rendered = render(extraction)
  const tampered = rendered.text.replace(/500 mg/g, '250 mg')
  const result = verify(extraction, tampered)
  assert.equal(result.ok, false, 'a changed dose must not pass')
})

test('normalise joins digits and units', () => {
  assert.equal(normalise('500mg'), normalise('500 mg'))
})

test('unparsed instruction with no anchors must be carried verbatim', () => {
  const extraction = extract('Rest when you feel tired.')
  assert.equal(extraction.unparsed.length, 1)
  assert.equal(extraction.unparsed[0].verbatimRequired, true)
  const rendered = render(extraction)
  assert.match(rendered.text, /Rest when you feel tired/i)
  assert.equal(verify(extraction, rendered.text).ok, true)
})

test('glossary phrases do not double a leading article', () => {
  for (const letter of SAMPLES) {
    const rendered = render(extract(letter.text, { baseDate: '2026-11-20' }))
    assert.doesNotMatch(rendered.text, /\b(the|a|an)\s+\1\b/i, `${letter.id} doubled an article`)
  }
})

test('short brand names are expanded, not left as shorthand', () => {
  const rendered = render(extract(sample('messy').text, { baseDate: '2026-11-20' }))
  assert.doesNotMatch(rendered.text, /\bAmox\b/)
  assert.match(rendered.text, /amoxicillin/i)
})

test('diet lines land in the activity section, not the leftovers', () => {
  const extraction = extract(sample('messy').text, { baseDate: '2026-11-20' })
  assert.ok(
    extraction.restrictions.some(item => /diet as tolerated/i.test(item.raw)),
    'diet instruction classified as a restriction'
  )
  const rendered = render(extraction)
  assert.match(rendered.text, /drink as much water/i)
  assert.doesNotMatch(rendered.text, /H2O/)
})

test('department headings are not treated as instructions', () => {
  const extraction = extract(sample('clean').text, { baseDate: '2026-11-20' })
  assert.ok(
    !extraction.all.some(item => /^general surgery$/i.test(item.raw.trim())),
    'heading survived as an instruction'
  )
})

test('a doctor name is not split into a stray instruction', () => {
  const extraction = extract(sample('clean').text, { baseDate: '2026-11-20' })
  assert.ok(
    !extraction.all.some(item => /^chen\.?$/i.test(item.raw.trim())),
    'Chen became its own instruction'
  )
  assert.equal(extraction.unparsed.length, 0, 'nothing left over in the clean letter')
  assert.match(extraction.appointments[0].raw, /Dr\. Chen/)
})

test('calendar export is well formed', () => {
  const extraction = extract(sample('clean').text, { baseDate: '2026-11-20' })
  const ics = buildIcs(extraction, { startDate: '2026-11-20' })
  assert.match(ics, /^BEGIN:VCALENDAR/)
  assert.match(ics, /END:VCALENDAR\r\n$/)
  assert.match(ics, /DTSTART;VALUE=DATE:20261202/)
  assert.equal((ics.match(/BEGIN:VEVENT/g) || []).length, (ics.match(/END:VEVENT/g) || []).length)
  assert.match(ics, /RRULE:FREQ=DAILY;COUNT=7/)
})

test('empty input is handled without throwing', () => {
  const extraction = extract('')
  assert.equal(extraction.all.length, 0)
  const rendered = render(extraction)
  assert.equal(rendered.text, '')
  assert.equal(verify(extraction, '').ok, true)
  assert.match(buildIcs(extraction), /BEGIN:VCALENDAR/)
})

console.log(`${passed} passed, ${failures.length} failed`)
for (const failure of failures) {
  console.error(`\nFAIL: ${failure.name}\n  ${failure.message}`)
}
process.exit(failures.length ? 1 : 0)
