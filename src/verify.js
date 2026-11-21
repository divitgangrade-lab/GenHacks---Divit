// The fidelity check. Every instruction extracted from the original letter has
// anchors: numbers, dates, drug names and a short list of clinical words whose
// disappearance would be dangerous. The rewrite must keep all of them, or the
// output is blocked.

import { GLOSSARY, plainify } from './render.js'

export function normalise (value) {
  return String(value)
    .toLowerCase()
    .replace(/([a-z])(\d)/g, '$1 $2')
    .replace(/(\d)([a-z])/g, '$1 $2')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

// An anchor passes if it survives word for word, or if the plain-language
// glossary replaced it with the phrase that means the same thing.
function acceptedForms (anchor) {
  const replacement = GLOSSARY[String(anchor).toLowerCase()]
  const forms = replacement ? [anchor, replacement] : [anchor]
  return forms.map(normalise).filter(Boolean)
}

export function verify (extraction, outputText) {
  const haystack = ` ${normalise(outputText)} `
  const problems = []
  let anchorsChecked = 0

  for (const instruction of extraction.all) {
    if (instruction.verbatimRequired) {
      const raw = normalise(instruction.raw)
      // A statement can be carried verbatim and still get one jargon word
      // swapped for an everyday one, so both forms are accepted.
      const plain = normalise(plainify(instruction.raw))
      const kept = raw && haystack.includes(` ${raw} `)
      const keptPlain = plain && haystack.includes(` ${plain} `)
      if (!kept && !keptPlain) {
        problems.push({
          id: instruction.id,
          statement: instruction.raw,
          kind: instruction.kind,
          missing: ['the whole instruction'],
        })
      }
      continue
    }


    const missing = []
    for (const anchor of instruction.checks) {
      anchorsChecked += 1
      const forms = acceptedForms(anchor)
      const found = forms.some(form => haystack.includes(` ${form} `))
      if (!found) missing.push(anchor)
    }

    if (missing.length) {
      problems.push({
        id: instruction.id,
        statement: instruction.raw,
        kind: instruction.kind,
        missing,
      })
    }
  }

  return {
    ok: problems.length === 0,
    instructions: extraction.all.length,
    anchorsChecked,
    problems,
  }
}

// Used by the demo's stress test: drops one sentence so the checker has
// something real to catch.
export function removeFirstMedication (text, extraction) {
  const first = extraction.medications[0]
  if (!first) return text
  const needle = first.drug
  const lines = text.split('\n')
  const index = lines.findIndex(line => needle && line.toLowerCase().includes(needle.toLowerCase()))
  if (index === -1) return text
  return [...lines.slice(0, index), ...lines.slice(index + 1)].join('\n')
}
