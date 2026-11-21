// Entry point loaded by the bookmarklet. Reads the page the reader is on and
// leaves a panel behind. The scanner and the rules stay pure; page text comes
// from src/text.js, and this is the only module that writes to the DOM.

import { scan, summarise, verdictLine } from './src/scan.js'
import { TAG_LABEL, ruleById, SOURCES } from './src/rules.js'
import { escapeHtml } from './src/escape.js'
import { domText } from './src/text.js'

const HOST_ID = 'claim-check-panel'

const STYLES = `
  :host { all: initial; }
  .wrap {
    position: fixed; top: 16px; right: 16px; z-index: 2147483647;
    width: min(380px, calc(100vw - 32px)); max-height: calc(100vh - 32px);
    overflow: auto; background: #fffdf8; color: #191713;
    border: 1px solid #c2b8a3; border-radius: 2px;
    box-shadow: 0 12px 32px rgba(25, 23, 19, .18);
    font: 15px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    text-align: left;
  }
  header { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding: 14px 16px 10px; border-bottom: 1px solid #ded6c5; }
  h2 { margin: 0; font: 600 17px/1.2 "Iowan Old Style", Palatino, Georgia, serif; }
  button {
    font: inherit; background: none; border: 0; cursor: pointer; color: #6f6658;
    padding: 10px 10px; min-height: 44px; margin: -10px -10px -10px 0;
  }
  button:hover { color: #191713; }
  button:focus-visible { outline: 2px solid #14584b; outline-offset: 2px; }
  .body { padding: 12px 16px 16px; }
  .verdict { margin: 0 0 12px; font-size: 14px; color: #4a453c; }
  ul { list-style: none; margin: 0; padding: 0; }
  li { padding: 10px 0; border-top: 1px solid #ded6c5; }
  li:first-child { border-top: 0; }
  .span { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; background: #f1ece0; padding: 1px 4px; }
  .tag { display: inline-block; font-size: 11px; letter-spacing: .08em; text-transform: uppercase; padding: 1px 6px; border-radius: 2px; }
  .tag.banned { background: #f8ece8; color: #8a2f21; }
  .tag.needs-evidence { background: #f4efe2; color: #7c5310; }
  .rule { margin: 6px 0 0; font-size: 13px; color: #4a453c; }
  .cite { margin: 4px 0 0; font-size: 12px; color: #6f6658; }
  .cite--fix { color: #4a453c; }
  footer { padding: 10px 16px 14px; border-top: 1px solid #ded6c5; font-size: 12px; color: #7a7264; }
  a { color: #0e3d33; }
`

function renderPanel (doc, hits) {
  const summary = summarise(hits)

  const items = hits.map(hit => {
    const rule = ruleById(hit.ruleId)
    return `
      <li>
        <span class="span">${escapeHtml(hit.span)}</span>
        <span class="tag ${rule.severity}">${TAG_LABEL[rule.severity]}</span>
        <p class="rule">${escapeHtml(rule.says)}</p>
        <p class="cite">${escapeHtml(rule.citation)}</p>
        <p class="cite cite--fix">To satisfy it: ${escapeHtml(rule.evidence)}</p>
      </li>`
  }).join('')

  const host = doc.createElement('div')
  host.id = HOST_ID
  const root = host.attachShadow({ mode: 'open' })
  root.innerHTML = `
    <style>${STYLES}</style>
    <div class="wrap" role="dialog" aria-label="Claim Check results">
      <header>
        <h2>Claim Check</h2>
        <button type="button" data-close aria-label="Close">Close</button>
      </header>
      <div class="body">
        <p class="verdict">${escapeHtml(verdictLine(summary))}</p>
        ${hits.length ? `<ul>${items}</ul>` : ''}
      </div>
      <footer>
        Informational, not legal advice. Rules from
        <a href="${SOURCES.directive}" target="_blank" rel="noopener noreferrer">Directive (EU) 2024/825</a>,
        in force since 27 September 2026.
      </footer>
    </div>`

  root.querySelector('[data-close]').addEventListener('click', () => host.remove())
  doc.body.appendChild(host)
  return host
}

// The demo page names the product card as its scan subject, so the rule table
// above it — which quotes the banned phrases on purpose — is never counted. The
// #fixture fallback is what makes this survive a page served from an older
// cache, before the marker existed: the id was there from the first version.
document.getElementById(HOST_ID)?.remove()
const subject = document.querySelector('[data-scan-root], #fixture') ?? document.body
renderPanel(document, scan(domText(document).text(subject)))
