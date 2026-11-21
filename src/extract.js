// Turns a discharge letter into structured instructions.
// Deterministic on purpose: no model decides what the letter said, so the same
// input always produces the same instruction set, and the verifier has a fixed
// reference to check the rewrite against.

import { prettyDate } from './render.js'

const STRENGTH = /(\d+(?:\.\d+)?)\s*(mg|mcg|µg|g|ml|units?|iu)\b/i
const FORM = /(\d+(?:\.\d+)?)\s*(tablets?|tabs?|capsules?|caps?|puffs?|drops?|patches?|sachets?)\b/i
const DURATION_WORDS = /\b(?:for|x)\s*(\d{1,3})\s*(day|days|week|weeks|month|months)\b/i
const DURATION_SHORT = /\bx\s*(\d{1,3})\s*d\b/i

// Ordered: the specific schedules have to win over the generic ones.
const FREQUENCIES = [
  { re: /\b(q6h|every\s*6\s*hours?)\b/i, label: 'four times a day, about six hours apart', perDay: 4, times: ['06:00', '12:00', '18:00', '22:00'] },
  { re: /\b(q8h|every\s*8\s*hours?)\b/i, label: 'three times a day, about eight hours apart', perDay: 3, times: ['06:00', '14:00', '22:00'] },
  { re: /\b(q12h|every\s*12\s*hours?)\b/i, label: 'two times a day, about twelve hours apart', perDay: 2, times: ['08:00', '20:00'] },
  { re: /\b(qhs|at\s+bedtime|before\s+bed)\b/i, label: 'at bedtime', perDay: 1, times: ['21:00'] },
  { re: /\b(qam|every\s+morning|in\s+the\s+morning)\b/i, label: 'in the morning', perDay: 1, times: ['08:00'] },
  { re: /\b(qid|four\s+times|4\s+times)\b/i, label: 'four times a day', perDay: 4, times: ['08:00', '12:00', '17:00', '22:00'] },
  { re: /\b(tid|three\s+times|3\s+times)\b/i, label: 'three times a day', perDay: 3, times: ['08:00', '14:00', '20:00'] },
  { re: /\b(bid|twice|two\s+times|2\s+times)\b/i, label: 'two times a day', perDay: 2, times: ['08:00', '20:00'] },
  { re: /\b(od|qd|once\s+a\s+day|once\s+daily|1\s+time|daily|every\s+day)\b/i, label: 'one time a day', perDay: 1, times: ['08:00'] },
]

// Clinical words whose disappearance from a rewrite would be dangerous. Used
// only to build the verifier's checklist, never to alter the text.
const SAFETY_TERMS = [
  'driving', 'drive', 'alcohol', 'lifting', 'lift', 'stairs', 'exercise', 'swimming', 'smoking', 'sex',
  'aspirin', 'ibuprofen', 'naproxen', 'warfarin', 'anticoagulation', 'blood', 'procedure', 'surgery',
  'bleeding', 'chest', 'breathing', 'fever', 'vomiting', 'confusion', 'fainting', 'rash', 'swelling',
  'infection', 'wound', 'dressing', 'stitches', 'incision', 'pain', 'dizziness', 'constipation',
  'emergency', '911', 'nurse', 'clinic', 'pharmacy', 'pregnant', 'breastfeeding', 'insulin', 'sugar',
]

const HEADER = /^(medications?|medicines?|prescriptions?|discharge\s+medications?|follow[-\s]?up|appointments?|activity|diet|red\s+flags?|when\s+to\s+(call|seek)|instructions?|discharge\s+instructions?|plan|other|notes?|comments?)\s*:?$/i
// "Discharge instructions — Cardiology" is a heading with a department tacked
// on. The strict list above cannot match it without also swallowing real
// instructions that begin with the same word.
const HEADER_QUALIFIED = /^(?:discharge\s+)?(?:instructions?|summary|medications?|plan)\s*[—–\-:,]/i

const RED_FLAG = /\b(911|emergency|go\s+to\s+the\s+(er|emergency)|call\s+(us|your|the|9)|return\s+(to|if)|if\s+you\s+(have|notice|get|develop|see)|seek\s+(care|help)|chest\s+pain|shortness\s+of\s+breath|trouble\s+breathing|can'?t\s+breathe)\b/i
const RESTRICTION = /\b(do\s+not|don'?t|avoid|no\s+(driving|alcohol|heavy)|hold|limit|restrict|nothing\s+by\s+mouth|npo)\b/i
const APPOINTMENT = /\b(follow[-\s]?up|appointment|clinic|see\s+(your|the)\s+(doctor|surgeon|nurse)|return\s+to\s+clinic|post[-\s]?op\s+visit|come\s+back)\b/i
// Checked after medication, so "take this with food" stays a medicine line.
const DIET = /\b(diet|dietary|eat|drink|fluids?|liquids?|h2o)\b/i
// A short title-case line with no digits is a department heading, not an
// instruction. Closed vocabulary, so nothing real gets dropped.
const DEPARTMENT = /^(general|vascular|orthopaedic|orthopedic|cardiac|cardiology|surgical|surgery|medical|medicine|oncology|neurology|paediatric|pediatric|urology|gynaecology|gynecology|psychiatry|ward|unit|department|service)\b/i
const DATE_ISO = /\b(\d{4})-(\d{2})-(\d{2})\b/
const DATE_MONTH = /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:,?\s*(\d{4}))?\b/i
const DATE_SLASH = /\b(\d{1,2})\/(\d{1,2})\/(\d{2,4})\b/
const DATE_RELATIVE = /\bin\s+(\d{1,2})\s+(day|days|week|weeks)\b/i

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']

const DRUG_STOPWORDS = new Set([
  'take', 'start', 'continue', 'stop', 'hold', 'use', 'apply', 'give', 'one', 'two', 'three', 'four',
  'tablet', 'tablets', 'tab', 'tabs', 'capsule', 'capsules', 'cap', 'caps', 'po', 'by', 'mouth', 'the',
  'a', 'an', 'of', 'and', 'with', 'for', 'daily', 'every', 'to', 'at', 'your', 'you', 'this', 'that',
  'medication', 'medicine', 'dose', 'doses',
])

function isoDate (y, m, d) {
  const mm = String(m).padStart(2, '0')
  const dd = String(d).padStart(2, '0')
  return `${y}-${mm}-${dd}`
}

export function findDate (statement, baseDate) {
  const base = baseDate instanceof Date ? new Date(baseDate) : new Date()

  const iso = statement.match(DATE_ISO)
  if (iso) return { iso: isoDate(iso[1], iso[2], iso[3]), raw: iso[0] }

  const month = statement.match(DATE_MONTH)
  if (month) {
    const monthIndex = MONTHS.indexOf(month[1].toLowerCase()) + 1
    const year = month[3] ? Number(month[3]) : base.getFullYear()
    return { iso: isoDate(year, monthIndex, month[2]), raw: month[0] }
  }

  const slash = statement.match(DATE_SLASH)
  if (slash) {
    const year = slash[3].length === 2 ? Number(`20${slash[3]}`) : Number(slash[3])
    return { iso: isoDate(year, slash[1], slash[2]), raw: slash[0] }
  }

  const relative = statement.match(DATE_RELATIVE)
  if (relative) {
    const date = new Date(base)
    const amount = Number(relative[1])
    const unit = relative[2].toLowerCase().startsWith('week') ? 'week' : 'day'
    date.setDate(date.getDate() + amount * (unit === 'week' ? 7 : 1))
    return { iso: date.toISOString().slice(0, 10), raw: relative[0] }
  }

  return null
}

function findDuration (statement) {
  const long = statement.match(DURATION_WORDS)
  if (long) {
    const count = Number(long[1])
    const unit = long[2].toLowerCase().startsWith('week') ? 'week' : long[2].toLowerCase().startsWith('month') ? 'month' : 'day'
    const days = unit === 'week' ? count * 7 : unit === 'month' ? count * 30 : count
    return { count, unit, days, raw: long[0] }
  }
  const short = statement.match(DURATION_SHORT)
  if (short) return { count: Number(short[1]), unit: 'day', days: Number(short[1]), raw: short[0] }
  return null
}

function findFrequency (statement) {
  // As-needed medicine controls its own schedule: no fixed times, whatever
  // interval the letter also mentions.
  if (/\b(prn|as\s+needed)\b/i.test(statement)) {
    return { label: 'only when you need it', perDay: 0, times: [] }
  }
  for (const entry of FREQUENCIES) {
    if (entry.re.test(statement)) return { ...entry }
  }
  return null
}

function findDrug (statement, cutAt) {
  const head = cutAt > 0 ? statement.slice(0, cutAt) : statement
  const tokens = head.split(/[\s,;/]+/).filter(Boolean)
  // Drug names and safety terms overlap on purpose (warfarin, aspirin,
  // insulin), so only the generic stopwords are excluded here.
  const words = tokens.filter(t =>
    /^[A-Za-z][A-Za-z-]{2,}$/.test(t) &&
    !DRUG_STOPWORDS.has(t.toLowerCase())
  )
  if (!words.length) return ''
  // Drug names sit next to the dose, so take the closest words before it.
  return words.slice(-2).join(' ')
}

function numbersWithUnits (statement) {
  const found = []
  const re = /\b\d+(?:\.\d+)?\s*(?:mg|mcg|µg|g|kg|ml|lbs?|pounds?|units?|iu|tablets?|tabs?|capsules?|caps?|puffs?|drops?|hours?|hour|days?|weeks?|months?)\b/gi
  let match
  while ((match = re.exec(statement)) !== null) found.push(match[0].replace(/\s+/g, ' ').trim())
  return found
}

function safetyTermsIn (statement) {
  const lower = statement.toLowerCase()
  return SAFETY_TERMS.filter(term => new RegExp(`\\b${term}\\b`).test(lower))
}

function anchorsFor (kind, statement, fields) {
  const anchors = new Set(numbersWithUnits(statement))
  for (const term of safetyTermsIn(statement)) anchors.add(term)
  if (fields?.drug) anchors.add(fields.drug)
  if (fields?.date) anchors.add(fields.date)
  return [...anchors]
}

// Envelope lines carry no instruction, so they are dropped rather than shown as
// "your care team wrote" noise.
const NOISE = /^(date\s+of\s+discharge|discharge\s+date|dc\s+summary|discharge\s+summary|admission\s+date|patient\s*:)/i

// Titles and initials carry a full stop that does not end a sentence: without
// this, "with Dr. Chen" becomes a stray instruction called "Chen".
const SENTINEL = '\u0001'
const TITLES = /\b(Dr|Mr|Mrs|Ms|Prof|St|vs|approx|Fig|No|Inc|Ltd)\./gi

export function segment (text) {
  return String(text || '')
    .replace(TITLES, `$1${SENTINEL}`)
    .split(/\n|(?<=[.;])\s+(?=[A-Z])/)
    .map(line => line.trim().replace(/^(?:\d+[.)]|[a-z][.)]|[-*•])\s+/i, ''))
    .map(line => line.replace(new RegExp(SENTINEL, 'g'), '.').trim())
    .filter(line =>
      line &&
      /[A-Za-z]/.test(line) &&
      !HEADER.test(line) &&
      !HEADER_QUALIFIED.test(line) &&
      !NOISE.test(line) &&
      !(line.split(/\s+/).length <= 4 && DEPARTMENT.test(line))
    )
}

export function extract (text, options = {}) {
  const baseDate = options.baseDate ? new Date(options.baseDate) : new Date()
  const statements = segment(text)

  const instructions = []
  const unparsed = []

  statements.forEach((statement, index) => {
    const id = `i${index + 1}`

    if (RED_FLAG.test(statement)) {
      instructions.push({
        id, kind: 'red-flag', raw: statement,
        checks: anchorsFor('red-flag', statement),
      })
      return
    }

    if (RESTRICTION.test(statement)) {
      instructions.push({
        id, kind: 'restriction', raw: statement,
        checks: anchorsFor('restriction', statement),
      })
      return
    }

    const strengthMatch = statement.match(STRENGTH)
    const formMatch = statement.match(FORM)
    const frequency = findFrequency(statement)

    if (strengthMatch || formMatch || (frequency && /\b(tab|cap|mg|mcg|ml)\b/i.test(statement))) {
      const cutAt = Math.min(
        strengthMatch ? strengthMatch.index : Infinity,
        formMatch ? formMatch.index : Infinity
      )
      const drug = findDrug(statement, Number.isFinite(cutAt) ? cutAt : -1)
      const duration = findDuration(statement)
      instructions.push({
        id,
        kind: 'medication',
        raw: statement,
        drug,
        strength: strengthMatch ? `${strengthMatch[1]} ${strengthMatch[2]}`.replace(/\s+/g, ' ') : '',
        formDose: formMatch ? `${formMatch[1]} ${formMatch[2].toLowerCase()}` : '',
        frequency,
        duration,
        checks: anchorsFor('medication', statement, { drug }),
      })
      return
    }

    if (DIET.test(statement)) {
      instructions.push({
        id, kind: 'restriction', raw: statement,
        checks: anchorsFor('restriction', statement),
      })
      return
    }

    const date = findDate(statement, baseDate)
    if (APPOINTMENT.test(statement)) {
      const checks = anchorsFor('appointment', statement)
      // The plan prints the date in words, so that is the form the verifier
      // must look for. A bare ISO string never appears in the output.
      if (date) checks.push(prettyDate(date.iso))
      instructions.push({
        id,
        kind: 'appointment',
        raw: statement,
        date: date ? date.iso : '',
        dateRaw: date ? date.raw : '',
        checks,
      })
      return
    }

    unparsed.push({ id, kind: 'unparsed', raw: statement, checks: anchorsFor('unparsed', statement) })
  })

  const all = [...instructions, ...unparsed]

  // A statement with no anchor cannot be checked, so it must survive verbatim.
  for (const instruction of all) {
    instruction.verbatimRequired = instruction.checks.length === 0
  }

  const dischargeDate = (String(text || '').match(/\b(\d{4}-\d{2}-\d{2})\b/) || [])[1] || ''

  return {
    raw: text,
    dischargeDate,
    medications: instructions.filter(i => i.kind === 'medication'),
    appointments: instructions.filter(i => i.kind === 'appointment'),
    restrictions: instructions.filter(i => i.kind === 'restriction'),
    redFlags: instructions.filter(i => i.kind === 'red-flag'),
    unparsed,
    all,
  }
}
