// Plain-language rendering. Template-driven, so the output is predictable and
// the verifier has something stable to check.

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// Jargon -> everyday words. Keys are matched on word boundaries, longest first,
// so "n/v" cannot eat "n".
export const GLOSSARY = {
  'po': 'by mouth',
  'npo': 'nothing to eat or drink',
  'prn': 'only when you need it',
  'bid': 'two times a day',
  'tid': 'three times a day',
  'qid': 'four times a day',
  'qd': 'one time a day',
  'od': 'one time a day',
  'qhs': 'at bedtime',
  'qam': 'every morning',
  'q6h': 'every six hours',
  'q8h': 'every eight hours',
  'q12h': 'every twelve hours',
  'dc': 'discharge',
  'fu': 'follow-up',
  'rx': 'prescription',
  'hx': 'history',
  'dx': 'diagnosis',
  'sx': 'surgery',
  'appt': 'appointment',
  'stat': 'right away',
  'etoh': 'alcohol',
  'apap': 'acetaminophen',
  'n/v': 'feeling sick and throwing up',
  'uti': 'urinary tract infection',
  'abd': 'belly',
  'abdomen': 'belly',
  'hypertension': 'high blood pressure',
  'myocardial infarction': 'heart attack',
  'dyspnea': 'trouble breathing',
  'edema': 'swelling',
  'analgesic': 'pain medicine',
  'analgesia': 'pain relief',
  'antipyretic': 'fever medicine',
  'anticoagulation clinic': 'clinic that manages your blood thinner',
  'h2o ad lib': 'drink as much water as you feel able',
  'amox': 'amoxicillin',
  'er': 'emergency room',
  'anticoagulation': 'blood thinner',
  'anticoagulant': 'blood thinner',
  'ambulate': 'walk',
  'ad lib': 'as much as you feel able',
  'hyperglycemia': 'high blood sugar',
  'hypoglycemia': 'low blood sugar',
  'cbc': 'blood test',
  'laceration': 'cut',
  'sutures': 'stitches',
  'incision': 'surgical cut',
  'incisions': 'surgical cuts',
  'hematoma': 'bruise',
  'emesis': 'throwing up',
  'nausea': 'feeling sick to your stomach',
  'pyrexia': 'fever',
  'malaise': 'feeling unwell',
  'benign': 'not cancer',
  'malignant': 'cancer',
  'biopsy': 'tissue sample',
  'anesthesia': 'numbing medicine',
  'general anesthesia': 'being asleep for surgery',
  'postoperative': 'after surgery',
  'preoperative': 'before surgery',
  'post-op': 'after surgery',
  'pre-op': 'before surgery',
  'follow-up': 'follow up',
  'h2o': 'water',
  'ambulation': 'walking',
  'febrile': 'feverish',
  'afebrile': 'no fever',
  'diet as tolerated': 'eat what feels okay',
  'clear liquids': 'water, broth, and juice',
  'per os': 'by mouth',
}

const GLOSSARY_ENTRIES = Object.entries(GLOSSARY).sort((a, b) => b[0].length - a[0].length)

function escapeRegExp (value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Dosing shorthand with a number in it, which a word list cannot hold.
const DOSING_SHORTHAND = [
  [/\bx\s*(\d{1,3})\s*d\b/gi, 'for $1 days'],
  [/\bx\s*(\d{1,3})\s*(?:wk|wks)\b/gi, 'for $1 weeks'],
  [/\bq(\d{1,2})h\b/gi, 'every $1 hours'],
]

export function plainify (text) {
  let out = String(text || '')
  for (const [pattern, replacement] of DOSING_SHORTHAND) {
    out = out.replace(pattern, replacement)
  }
  for (const [key, value] of GLOSSARY_ENTRIES) {
    out = out.replace(new RegExp(`\\b${escapeRegExp(key)}\\b`, 'gi'), value)
  }
  return out.replace(/\s+/g, ' ').trim()
}

// Which clinical terms actually appeared, so the page can report a real count
// instead of asserting that the copy is plainer.
export function jargonHits (text) {
  const source = String(text || '')
  const found = new Set()
  for (const [key] of GLOSSARY_ENTRIES) {
    if (!new RegExp(`\\b${escapeRegExp(key)}\\b`, 'i').test(source)) continue
    // Short lowercase keys are abbreviations, and read better shouted back.
    found.add(key.length <= 5 && /^[a-z0-9/.]+$/.test(key) ? key.toUpperCase() : key)
  }
  if (/\bx\s*\d{1,3}\s*d\b/i.test(source)) found.add('x 7d dose shorthand')
  // "anticoagulation" and "anticoagulation clinic" are one find, not two.
  const byLength = [...found].sort((a, b) => b.length - a.length)
  const distinct = byLength.filter(key =>
    !byLength.some(other => other !== key && new RegExp(`\\b${escapeRegExp(key)}\\b`, 'i').test(other))
  )
  return distinct.sort((a, b) => a.localeCompare(b))
}

export function sentenceCase (text) {
  const trimmed = String(text || '').trim()
  if (!trimmed) return ''
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

export function prettyDate (iso) {
  if (!iso) return ''
  const [year, month, day] = iso.split('-').map(Number)
  if (!year || !month || !day) return iso
  const date = new Date(Date.UTC(year, month - 1, day))
  return `${DAY_NAMES[date.getUTCDay()]} ${day} ${MONTH_NAMES[month - 1]} ${year}`
}

function prettyDuration (duration) {
  if (!duration) return ''
  const unit = duration.unit === 'week' ? 'week' : duration.unit === 'month' ? 'month' : 'day'
  return `${duration.count} ${unit}${duration.count === 1 ? '' : 's'}`
}

function prettyTime (time) {
  const [hours, minutes] = time.split(':').map(Number)
  const suffix = hours >= 12 ? 'pm' : 'am'
  const hour = hours % 12 === 0 ? 12 : hours % 12
  return `${hour}:${String(minutes).padStart(2, '0')} ${suffix}`
}

export function medicationLine (medication) {
  // The drug name is plainified too, so brand shorthand like APAP does not
  // survive into the patient's copy.
  const what = [plainify(medication.drug) || 'your medicine', medication.strength].filter(Boolean).join(' ')
  let line = medication.formDose ? `Take ${medication.formDose} of ${what}` : `Take ${what}`
  if (medication.frequency) line += `, ${medication.frequency.label}`
  if (medication.duration) line += ` for ${prettyDuration(medication.duration)}`
  return sentenceCase(`${line}.`)
}

export function appointmentLine (appointment) {
  const when = appointment.date ? `Appointment: ${prettyDate(appointment.date)}. ` : ''
  return when + sentenceCase(plainify(appointment.raw))
}

export function render (extraction) {
  const sections = []
  const textParts = []

  if (extraction.medications.length) {
    const lines = extraction.medications.map(medicationLine)
    sections.push({ key: 'medications', title: 'Your medicines', lines })
    textParts.push('Your medicines.', ...lines)
  }

  if (extraction.appointments.length) {
    const lines = extraction.appointments.map(appointmentLine)
    sections.push({ key: 'appointments', title: 'Appointments', lines })
    textParts.push('Appointments.', ...lines)
  }

  if (extraction.redFlags.length) {
    const lines = extraction.redFlags.map(item => sentenceCase(plainify(item.raw)))
    sections.push({ key: 'watch', title: 'Get help right away if', lines })
    textParts.push('Get help right away if', ...lines)
  }

  if (extraction.restrictions.length) {
    const lines = extraction.restrictions.map(item => sentenceCase(plainify(item.raw)))
    sections.push({ key: 'activity', title: 'Activity and food', lines })
    textParts.push('Activity and food.', ...lines)
  }

  if (extraction.unparsed.length) {
    // Anything the parser did not recognise is carried through in the original
    // words rather than guessed at. Losing it silently is the failure mode we
    // are designing against.
    const lines = extraction.unparsed.map(item => `Your care team wrote: ${sentenceCase(plainify(item.raw))}`)
    sections.push({ key: 'other', title: 'Also in your letter', lines })
    textParts.push('Also in your letter.', ...lines)
  }

  const schedule = []
  for (const medication of extraction.medications) {
    if (!medication.frequency || !medication.frequency.times.length) continue
    for (const time of medication.frequency.times) {
      schedule.push({
        time,
        label: prettyTime(time),
        name: [medication.drug || 'Medicine', medication.strength].filter(Boolean).join(' '),
        dose: medication.formDose,
      })
    }
  }
  schedule.sort((a, b) => a.time.localeCompare(b.time))

  return {
    text: textParts.join('\n'),
    sections,
    schedule,
    medicationCount: extraction.medications.length,
  }
}
