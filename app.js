import { scan, summarise, verdictLine } from './src/scan.js'
import { RULES, TAG_LABEL, ruleById } from './src/rules.js'
import { escapeHtml } from './src/escape.js'

const el = {
  fixture: document.getElementById('fixture'),
  verdict: document.getElementById('verdict'),
  findings: document.getElementById('findings'),
  scanned: document.getElementById('scanned'),
  rulesList: document.getElementById('rules-list'),
  bookmarklet: document.getElementById('bookmarklet'),
}

function renderRules () {
  el.rulesList.innerHTML = RULES.map(rule => `
    <li>
      <h3>${escapeHtml(rule.title)}</h3>
      <p class="rule__citation"><span class="tag ${rule.severity}">${TAG_LABEL[rule.severity]}</span><span>${escapeHtml(rule.citation)}</span></p>
      <p>${escapeHtml(rule.says)}</p>
      <p class="rule__evidence">What would satisfy it: ${escapeHtml(rule.evidence)}</p>
    </li>
  `).join('')
}

function renderFindings () {
  const text = el.fixture.innerText
  const hits = scan(text)
  const summary = summarise(hits)

  el.verdict.textContent = verdictLine(summary)
  el.verdict.className = `verdict ${summary.banned ? 'verdict--banned' : 'verdict--clear'}`

  el.findings.innerHTML = hits.map(hit => {
    const rule = ruleById(hit.ruleId)
    return `
      <li>
        <p class="findings__head">
          <span class="findings__span">${escapeHtml(hit.span)}</span>
          <span class="tag ${rule.severity}">${TAG_LABEL[rule.severity]}</span>
        </p>
        <p class="findings__rule">${escapeHtml(rule.title)}</p>
        <p class="findings__cite">${escapeHtml(rule.citation)}</p>
      </li>`
  }).join('')

  el.scanned.textContent = `${text.split(/\s+/).filter(Boolean).length} words scanned in this browser. Nothing was uploaded.`
}

// The bookmarklet has to be a javascript: URL, so it is assembled here from the
// address the site is actually served from, and imports the same scanner the
// page just ran.
function buildBookmarklet () {
  // GitHub Pages serves these files with a ten-minute cache, so a reader who
  // clicked an hour ago can still be running yesterday's scanner. Stamping the
  // URL with the click time makes the bookmarklet always fetch the current one.
  const target = new URL('./report.js', window.location.href).href
  const code = `javascript:(function(){var s=document.createElement('script');s.type='module';s.src='${target}?t='+Date.now();document.head.appendChild(s);})()`
  el.bookmarklet.setAttribute('href', code)
  el.bookmarklet.title = 'Drag this to your bookmarks bar'
}

renderRules()
renderFindings()
buildBookmarklet()
