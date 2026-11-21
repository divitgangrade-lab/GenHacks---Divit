// Pure functions: text in, findings out. No DOM, no network, so the whole
// decision layer can be tested without a browser.

import { RULES, ruleById } from './rules.js'

const CONTEXT_CHARS = 70

export function scan (text) {
  const source = String(text || '').replace(/\s+/g, ' ')
  const hits = []

  for (const rule of RULES) {
    const pattern = new RegExp(rule.pattern.source, rule.pattern.flags)
    pattern.lastIndex = 0
    let match
    while ((match = pattern.exec(source)) !== null) {
      const start = match.index
      const end = start + match[0].length
      const context = source.slice(Math.max(0, start - CONTEXT_CHARS), Math.min(source.length, end + CONTEXT_CHARS))

      if (rule.guard && !rule.guard(context)) {
        if (match[0].length === 0) pattern.lastIndex += 1
        continue
      }

      hits.push({ ruleId: rule.id, span: match[0], start, end, context })
      if (match[0].length === 0) pattern.lastIndex += 1
    }
  }

  return dedupe(hits)
}

// "net zero by 2040" matches both the offset rule and the future-promise rule.
// Keep the longer, more specific match and drop the overlap.
function dedupe (hits) {
  const byLength = [...hits].sort((a, b) => (b.end - b.start) - (a.end - a.start))
  const kept = []
  for (const hit of byLength) {
    const overlaps = kept.some(other => hit.start < other.end && other.start < hit.end)
    if (!overlaps) kept.push(hit)
  }
  return kept.sort((a, b) => a.start - b.start)
}

export function summarise (hits) {
  const counts = { banned: 0, 'needs-evidence': 0 }
  for (const hit of hits) {
    const rule = ruleById(hit.ruleId)
    if (!rule) continue
    counts[rule.severity] += 1
  }
  return { total: hits.length, banned: counts.banned, needsEvidence: counts['needs-evidence'] }
}

export function verdictLine (summary) {
  if (summary.total === 0) return 'No banned or unsubstantiated environmental claims were found on this page.'
  const parts = []
  if (summary.banned) parts.push(`${summary.banned} banned ${summary.banned === 1 ? 'claim' : 'claims'}`)
  if (summary.needsEvidence) parts.push(`${summary.needsEvidence} needing evidence`)
  return `${parts.join(' and ')} found.`
}
