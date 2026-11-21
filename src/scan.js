// Pure functions: text in, findings out. No DOM, no network, so the whole
// decision layer can be tested without a browser.

import { RULES, ruleById } from './rules.js'

const CONTEXT_CHARS = 70
const TERMINATOR = /[.!?]/
const CLOSER = /["'”’)\]]/

// A terminator ends a sentence only when nothing but closing punctuation sits
// between it and the next space, so "4.5" and "e.g. x" do not split mid-thought.
function endsSentence (source, index) {
  if (!TERMINATOR.test(source[index])) return false
  let next = index + 1
  while (next < source.length && CLOSER.test(source[next])) next += 1
  return next >= source.length || /\s/.test(source[next])
}

// Matching sees collapsed whitespace; the sentence is cut from the raw text so
// a heading or price on its own line does not get glued onto the first claim.
function sentenceOf (raw, start, end) {
  let from = 0
  for (let i = start - 1; i >= 0; i -= 1) {
    if (raw[i] === '\n' || endsSentence(raw, i)) {
      from = i + 1
      break
    }
  }
  let to = raw.length
  for (let i = end; i < raw.length; i += 1) {
    if (raw[i] === '\n') {
      to = i
      break
    }
    if (endsSentence(raw, i)) {
      to = i + 1
      break
    }
  }
  const chunk = raw.slice(from, to)
  from += chunk.length - chunk.trimStart().length
  const before = raw.slice(from, start).replace(/\s+/g, ' ')
  return {
    sentence: chunk.trim().replace(/\s+/g, ' '),
    sentenceOffset: before.length
  }
}

// Collapse runs of whitespace while remembering where each surviving character
// came from, so a match index can be mapped back into the raw text.
function collapse (raw) {
  let source = ''
  const origin = []
  let gap = false
  for (let i = 0; i < raw.length; i += 1) {
    if (/\s/.test(raw[i])) {
      gap = source.length > 0
    } else {
      if (gap) {
        source += ' '
        origin.push(i)
      }
      source += raw[i]
      origin.push(i)
      gap = false
    }
  }
  return { source, origin }
}

// The three pieces a finding's sentence is rendered from, so the demo and the
// bookmarklet panel cannot disagree about where the match starts.
export function sentenceParts (hit) {
  const sentence = hit.sentence || ''
  const at = Math.max(0, hit.sentenceOffset || 0)
  return {
    before: sentence.slice(0, at),
    match: sentence.slice(at, at + hit.span.length),
    after: sentence.slice(at + hit.span.length)
  }
}

export function scan (text) {
  const raw = String(text || '')
  const { source, origin } = collapse(raw)
  const hits = []

  for (const rule of RULES) {
    const pattern = new RegExp(rule.pattern.source, rule.pattern.flags)
    let match
    while ((match = pattern.exec(source)) !== null) {
      const start = match.index
      const end = start + match[0].length
      const context = source.slice(Math.max(0, start - CONTEXT_CHARS), Math.min(source.length, end + CONTEXT_CHARS))
      if (!rule.guard || rule.guard(context)) {
        const sentence = sentenceOf(raw, origin[start], origin[end - 1] + 1)
        hits.push({ ruleId: rule.id, span: match[0], start, end, context, ...sentence })
      }
    }
  }

  // Rules are walked in turn, so hits arrive in rule order, not reading order.
  return hits.sort((a, b) => a.start - b.start)
}

export function summarise (hits) {
  const counts = { banned: 0, 'needs-evidence': 0 }
  for (const hit of hits) counts[ruleById(hit.ruleId).severity] += 1
  return { total: hits.length, banned: counts.banned, needsEvidence: counts['needs-evidence'] }
}

export function verdictLine (summary) {
  if (summary.total === 0) return 'No banned or unsubstantiated environmental claims were found on this page.'
  const parts = []
  if (summary.banned) parts.push(`${summary.banned} banned ${summary.banned === 1 ? 'claim' : 'claims'}`)
  if (summary.needsEvidence) parts.push(`${summary.needsEvidence} needing evidence`)
  return `${parts.join(' and ')} found.`
}
