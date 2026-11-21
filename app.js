import { analyse } from './src/readability.js'
import { extract } from './src/extract.js'
import { render, prettyDate, jargonHits } from './src/render.js'
import { verify, removeFirstMedication } from './src/verify.js'
import { buildIcs } from './src/ics.js'
import { SAMPLES } from './src/samples.js'

const el = {
  letter: document.getElementById('letter'),
  samples: document.getElementById('samples'),
  simplify: document.getElementById('simplify'),
  stress: document.getElementById('stress'),
  clear: document.getElementById('clear'),
  notice: document.getElementById('notice'),
  result: document.getElementById('result'),
  verdict: document.getElementById('verdict'),
  score: document.getElementById('score'),
  plan: document.getElementById('plan'),
  schedule: document.getElementById('schedule'),
  scheduleList: document.getElementById('schedule-list'),
  actions: document.getElementById('actions'),
  ics: document.getElementById('ics'),
  copy: document.getElementById('copy'),
  print: document.getElementById('print'),
  stressOut: document.getElementById('stress-out'),
}

let state = null
let activeSample = null

function escapeHtml (value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function notice (message) {
  el.notice.textContent = message
  el.notice.hidden = !message
}

function band (fkgl) {
  if (fkgl <= 6) return 'at or below the sixth-grade level doctors are told to aim for'
  if (fkgl <= 8) return 'around the level of a newspaper'
  return 'harder than most adults read easily'
}

// The score often barely moves, and one sample gets worse. Saying so is more
// useful than implying the number is the point.
function scoreNote (before, after) {
  const delta = after.fkgl - before.fkgl
  const absolute = `The plan sits ${band(after.fkgl)}.`
  if (delta > 0.3) {
    return `The grade level rose from ${before.fkgl} to ${after.fkgl}. Expanding shorthand adds syllables, and the formula counts syllables rather than meaning. ${absolute}`
  }
  if (delta < -0.3) {
    return `The grade level fell from ${before.fkgl} to ${after.fkgl}. ${absolute}`
  }
  return `The grade level barely moves, because this letter is already built from short lines and the formula rewards short lines. ${absolute}`
}

function paintScores (before, after) {
  const rows = [
    ['Flesch–Kincaid grade', before.fkgl, after.fkgl],
    ['SMOG grade', before.smog, after.smog],
    ['Flesch reading ease', before.fre, after.fre],
  ]
  el.score.innerHTML = `
    <h3>Reading level</h3>
    <table>
      <thead>
        <tr><th scope="col">Measure</th><th scope="col">Original</th><th scope="col">Plain plan</th></tr>
      </thead>
      <tbody>
        ${rows.map(([label, beforeValue, afterValue]) => `
          <tr>
            <th scope="row">${label}</th>
            <td>${beforeValue}</td>
            <td class="score__after">${afterValue}</td>
          </tr>`).join('')}
      </tbody>
    </table>
    <p class="score__note">${scoreNote(before, after)}</p>
  `
}

function paintVerdict (check, jargon) {
  if (check.ok) {
    const jargonLine = jargon.length
      ? ` ${jargon.length} pieces of clinical shorthand were replaced with everyday words (${jargon.slice(0, 5).map(escapeHtml).join(', ')}${jargon.length > 5 ? ', and others' : ''}).`
      : ''
    el.verdict.className = 'verdict verdict--ok'
    el.verdict.innerHTML = `
      <p class="verdict__label">Checked and cleared</p>
      <p>${check.instructions} instructions, ${check.anchorsChecked} facts. Every dose, date, drug name and warning in the original survived the rewrite.${jargonLine}</p>
    `
    return
  }

  el.verdict.className = 'verdict verdict--block'
  el.verdict.innerHTML = `
    <p class="verdict__label">Blocked</p>
    <p>The rewrite lost ${check.problems.length} ${check.problems.length === 1 ? 'instruction' : 'instructions'}, so the plan is not shown. What went missing:</p>
    <ul class="verdict__list">
      ${check.problems.map(problem => `
        <li>“${escapeHtml(problem.statement)}” — missing ${problem.missing.map(item => `<code>${escapeHtml(item)}</code>`).join(', ')}</li>
      `).join('')}
    </ul>
  `
}

function paintPlan (rendered) {
  el.plan.innerHTML = rendered.sections.map(section => `
    <section class="plan__block plan__block--${section.key}">
      <h3 class="block__title">${escapeHtml(section.title)}</h3>
      <ul>${section.lines.map(line => `<li>${escapeHtml(line)}</li>`).join('')}</ul>
    </section>
  `).join('')
}

function paintSchedule (rendered) {
  if (!rendered.schedule.length) {
    el.schedule.hidden = true
    return
  }
  el.schedule.hidden = false
  el.scheduleList.innerHTML = rendered.schedule.map(slot => `
    <li>
      <span class="schedule__time">${escapeHtml(slot.label)}</span>
      <span>${escapeHtml(slot.name)}${slot.dose ? ` <span class="schedule__dose">(${escapeHtml(slot.dose)})</span>` : ''}</span>
    </li>
  `).join('')
}

function paint () {
  const { before, after, check, rendered } = state
  paintVerdict(check, state.jargon)
  paintScores(before, after)
  if (check.ok) {
    paintPlan(rendered)
    paintSchedule(rendered)
  } else {
    el.plan.innerHTML = ''
    el.schedule.hidden = true
  }
  el.actions.hidden = !check.ok
  el.result.hidden = false
  el.stressOut.hidden = true
}

function run () {
  const raw = el.letter.value
  if (!raw.trim()) {
    notice('Paste a letter first, or pick one of the samples above.')
    return
  }
  notice('')
  try {
    const extraction = extract(raw)
    const rendered = render(extraction)
    state = {
      extraction,
      rendered,
      before: analyse(raw),
      after: analyse(rendered.text),
      check: verify(extraction, rendered.text),
      jargon: jargonHits(raw),
    }
    paint()
  } catch (error) {
    notice(`Could not read that letter: ${error.message}`)
    el.result.hidden = true
  }
}

function runStressTest () {
  if (!state) run()
  if (!state) return

  const lossy = removeFirstMedication(state.rendered.text, state.extraction)
  const result = verify(state.extraction, lossy)

  if (result.ok) {
    el.stressOut.innerHTML = `
      <h3>Checker test</h3>
      <p>Nothing was flagged. That is a bug: removing a medicine should trip the check.</p>
    `
  } else {
    el.stressOut.innerHTML = `
      <h3>Checker test</h3>
      <p>A sentence was deleted from the finished plan, the way a careless rewrite would lose one, and the same check that guards the output was pointed at it.</p>
      <ol>
        ${result.problems.map(problem => `
          <li>Dropped “${escapeHtml(problem.statement)}”, which took ${problem.missing.map(item => `<code>${escapeHtml(item)}</code>`).join(', ')} with it.</li>
        `).join('')}
      </ol>
      <p>This is the check that runs on every plan before you see it.</p>
    `
  }
  el.stressOut.hidden = false
  el.stressOut.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
}

function loadSample (sample) {
  el.letter.value = sample.text
  activeSample = sample.id
  for (const button of el.samples.querySelectorAll('button')) {
    button.setAttribute('aria-pressed', String(button.dataset.sample === sample.id))
  }
  el.result.hidden = true
  state = null
  notice('')
  run()
}

function downloadCalendar () {
  if (!state) return
  const startDate = state.extraction.dischargeDate || new Date().toISOString().slice(0, 10)
  const ics = buildIcs(state.extraction, { startDate })
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'discharge-plan.ics'
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

async function copyPlan () {
  if (!state) return
  const text = `${state.rendered.text}\n\nAppointments: ${state.extraction.appointments.map(a => a.date ? prettyDate(a.date) : a.raw).join('; ') || 'none in this letter'}`
  try {
    await navigator.clipboard.writeText(text)
    const original = el.copy.textContent
    el.copy.textContent = 'Copied'
    setTimeout(() => { el.copy.textContent = original }, 1500)
  } catch {
    notice('The browser blocked the clipboard. Select the plan and copy it manually.')
  }
}

for (const sample of SAMPLES) {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'btn'
  button.dataset.sample = sample.id
  button.textContent = sample.name
  button.title = sample.note
  button.setAttribute('aria-pressed', 'false')
  button.addEventListener('click', () => loadSample(sample))
  el.samples.appendChild(button)
}

el.simplify.addEventListener('click', run)
el.stress.addEventListener('click', runStressTest)
el.clear.addEventListener('click', () => {
  el.letter.value = ''
  el.result.hidden = true
  state = null
  activeSample = null
  for (const button of el.samples.querySelectorAll('button')) button.setAttribute('aria-pressed', 'false')
  notice('')
  el.letter.focus()
})
el.ics.addEventListener('click', downloadCalendar)
el.copy.addEventListener('click', copyPlan)
el.print.addEventListener('click', () => window.print())

document.addEventListener('keydown', event => {
  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
    event.preventDefault()
    run()
  }
})

loadSample(SAMPLES[0])
