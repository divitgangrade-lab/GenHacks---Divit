// Entry point loaded by the bookmarklet. Runs on whatever page the reader is
// looking at, reads its visible text, and leaves a panel behind.

import { scan } from './src/scan.js'
import { renderPanel } from './src/panel.js'

// A page that talks about banned phrases (this site's own rule table, a news
// article, another checker) can mark those regions so a scan reports the
// product, not the commentary. Off by default: on a real shop page nothing is
// marked, so everything is read.
const SKIP = '[data-scan-skip], #claim-check-panel, script, style, noscript, svg, template, [hidden]'

export function readableText (doc) {
  if (!doc.body) return ''
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT)
  const parts = []
  let node
  while ((node = walker.nextNode()) !== null) {
    const text = node.nodeValue
    if (!text || !text.trim()) continue
    const parent = node.parentElement
    if (!parent || parent.closest(SKIP)) continue
    parts.push(text)
  }
  return parts.join(' ')
}

renderPanel(document, scan(readableText(document)))
