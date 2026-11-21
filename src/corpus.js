// The counting rules for a corpus run, kept pure so they can be tested without
// a filesystem. scripts/corpus.mjs reads the files and prints the result;
// everything that decides what counts lives here.

import { scan, summarise } from './scan.js'
import { RULES } from './rules.js'

export const MIN_WORDS = 30

// A file with a handful of words is a consent wall or a failed save, not a
// product page. Counting it as clean would flatter the hit rate, so it is
// reported separately instead.
function countWords (text) {
  return text.split(/\s+/).filter(Boolean).length
}

export function countPages (documents) {
  const pages = []
  const byRule = new Map(RULES.map(rule => [rule.id, 0]))
  let skipped = 0
  let findings = 0

  for (const { file, text } of documents) {
    if (countWords(text) < MIN_WORDS) {
      skipped += 1
      continue
    }
    const hits = scan(text)
    const summary = summarise(hits)
    findings += summary.total
    // A page counts once per rule, not once per mention.
    for (const id of new Set(hits.map(hit => hit.ruleId))) byRule.set(id, byRule.get(id) + 1)
    pages.push({ file, summary, spans: [...new Set(hits.map(hit => hit.span))] })
  }

  // The rate is over pages read, never over files saved.
  const pagesWithBannedClaim = pages.filter(page => page.summary.banned > 0).length
  const bannedRate = pages.length
    ? Number(((pagesWithBannedClaim / pages.length) * 100).toFixed(1))
    : 0

  return { pages, skipped, findings, byRule, pagesWithBannedClaim, bannedRate }
}
