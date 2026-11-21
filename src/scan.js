// Pure functions: text in, findings out. No DOM, no network, so the whole
// decision layer can be tested without a browser.

import { RULES, ruleById } from './rules.js'

const CONTEXT_CHARS = 70

export function scan (text) {
  const source = String(text || '').replace(/\s+/g, ' ')
  const hits = []

  for (const rule of RULES) {
    const pattern = new RegExp(rule.pattern.source, rule.pattern.flags)
    let match
    while ((match = pattern.exec(source)) !== null) {
      const start = match.index
      const end = start + match[0].length
      const context = source.slice(Math.max(0, start - CONTEXT_CHARS), Math.min(source.length, end + CONTEXT_CHARS))
      if (!rule.guard || rule.guard(context)) {
        hits.push({ ruleId: rule.id, span: match[0], start, end, context })
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
