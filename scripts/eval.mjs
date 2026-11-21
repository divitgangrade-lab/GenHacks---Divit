// Prints the measured table used in the README. `node scripts/eval.mjs`.
import { SAMPLES } from '../src/samples.js'
import { extract } from '../src/extract.js'
import { render } from '../src/render.js'
import { verify } from '../src/verify.js'
import { analyse } from '../src/readability.js'

const rows = SAMPLES.map(letter => {
  const extraction = extract(letter.text, { baseDate: '2026-11-20' })
  const rendered = render(extraction)
  const before = analyse(letter.text)
  const after = analyse(rendered.text)
  const check = verify(extraction, rendered.text)
  return {
    letter: letter.name,
    fkgl: `${before.fkgl} → ${after.fkgl}`,
    smog: `${before.smog} → ${after.smog}`,
    instructions: extraction.all.length,
    anchors: check.anchorsChecked,
    meds: extraction.medications.length,
    appts: extraction.appointments.length,
    flags: extraction.redFlags.length,
    kept: check.ok ? 'all' : `${check.problems.length} lost`,
  }
})

const headers = ['Letter', 'FKGL', 'SMOG', 'Instructions', 'Facts checked', 'Meds', 'Appointments', 'Warnings', 'Verdict']
const cells = rows.map(row => [row.letter, row.fkgl, row.smog, row.instructions, row.anchors, row.meds, row.appts, row.flags, row.kept])

console.log(`| ${headers.join(' | ')} |`)
console.log(`| ${headers.map(() => '---').join(' | ')} |`)
for (const cell of cells) console.log(`| ${cell.join(' | ')} |`)
