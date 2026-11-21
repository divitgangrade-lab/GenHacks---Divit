// Calendar export: appointments as all-day events, medication doses as one
// repeating event per time of day.

const MONTH = { 1: 'JAN', 2: 'FEB', 3: 'MAR', 4: 'APR', 5: 'MAY', 6: 'JUN', 7: 'JUL', 8: 'AUG', 9: 'SEP', 10: 'OCT', 11: 'NOV', 12: 'DEC' }

function escapeText (value) {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

// RFC 5545 asks for folding at 75 octets. Character folding is close enough
// for the text we emit, which is ASCII apart from the occasional accent.
function fold (line) {
  if (line.length <= 74) return line
  const parts = [line.slice(0, 74)]
  let rest = line.slice(74)
  while (rest.length > 73) {
    parts.push(` ${rest.slice(0, 73)}`)
    rest = rest.slice(73)
  }
  if (rest) parts.push(` ${rest}`)
  return parts.join('\r\n')
}

function addDays (iso, days) {
  const [year, month, day] = iso.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function compactDate (iso) {
  return iso.replace(/-/g, '')
}

function stamp () {
  return new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

function uid (seed, index) {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return `${hash.toString(16)}-${index}@discharge-rx`
}

export function buildIcs (extraction, options = {}) {
  const startDate = options.startDate || new Date().toISOString().slice(0, 10)
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Discharge Rx//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ]

  extraction.appointments.forEach((appointment, index) => {
    if (!appointment.date) return
    const summary = escapeText(appointment.raw.slice(0, 120))
    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid(summary + appointment.date, index)}`,
      `DTSTAMP:${stamp()}`,
      `DTSTART;VALUE=DATE:${compactDate(appointment.date)}`,
      `DTEND;VALUE=DATE:${compactDate(addDays(appointment.date, 1))}`,
      `SUMMARY:${escapeText('Appointment: ')}${summary}`,
      'BEGIN:VALARM',
      'TRIGGER:-P1D',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeText('Appointment tomorrow')}`,
      'END:VALARM',
      'END:VEVENT',
    )
  })

  let eventIndex = 100
  extraction.medications.forEach((medication) => {
    if (!medication.frequency || !medication.frequency.times.length) return
    const days = medication.duration ? medication.duration.days : 7
    const name = [medication.drug || 'Medicine', medication.strength].filter(Boolean).join(' ')
    for (const time of medication.frequency.times) {
      const [hours, minutes] = time.split(':').map(Number)
      if (hours > 23) continue // midnight spelled as 24:00
      const timePart = `${String(hours).padStart(2, '0')}${String(minutes).padStart(2, '0')}00`
      lines.push(
        'BEGIN:VEVENT',
        `UID:${uid(name + time, eventIndex)}`,
        `DTSTAMP:${stamp()}`,
        `DTSTART:${compactDate(startDate)}T${timePart}`,
        `DURATION:PT10M`,
        `RRULE:FREQ=DAILY;COUNT=${days}`,
        `SUMMARY:${escapeText(`Take ${medication.formDose ? medication.formDose + ' of ' : ''}${name}`)}`,
        `DESCRIPTION:${escapeText(medication.frequency.label)}`,
        'BEGIN:VALARM',
        'TRIGGER:PT0M',
        'ACTION:DISPLAY',
        `DESCRIPTION:${escapeText(name)}`,
        'END:VALARM',
        'END:VEVENT',
      )
      eventIndex += 1
    }
  })

  lines.push('END:VCALENDAR')
  return lines.map(fold).join('\r\n') + '\r\n'
}
