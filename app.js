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

// Runs inside the shop page, from a javascript: URL. Everything it needs is
// passed in, so its source can be serialised into the link. A page with a strict
// Content-Security-Policy blocks the module script we inject, and that used to
// look like nothing happened at all; script.onerror and a short timer now leave
// a message with a way back to the demo.
// This function is serialised into a javascript: URL, where the browser strips
// newlines. It is written with semicolons on every statement and block comments
// only, so flattening it cannot merge two statements or comment out the rest.
function bootBookmarklet (reportUrl, demoUrl) {
  var PANEL = 'claim-check-panel';
  var NOTICE = 'claim-check-fallback';
  if (document.getElementById(PANEL) || document.getElementById(NOTICE)) return;

  var script = document.createElement('script');
  script.type = 'module';
  script.src = reportUrl + '?t=' + Date.now();

  function fallback () {
    if (document.getElementById(PANEL)) {
      var stale = document.getElementById(NOTICE);
      if (stale) stale.remove();
      return;
    }
    if (document.getElementById(NOTICE)) return;

    var box = document.createElement('div');
    box.id = NOTICE;
    box.setAttribute('role', 'status');
    box.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:2147483647;max-width:320px;padding:12px 34px 12px 14px;background:#fff;color:#111;font:14px/1.45 system-ui,-apple-system,sans-serif;border:1px solid #c9c5ba;border-radius:3px;box-shadow:0 8px 30px rgba(0,0,0,.25)';

    var close = document.createElement('button');
    close.type = 'button';
    close.textContent = '\u00d7';
    close.setAttribute('aria-label', 'Close');
    close.style.cssText = 'position:absolute;top:2px;right:6px;border:0;background:none;font-size:18px;line-height:1;cursor:pointer;color:#555';
    close.onclick = function () { box.remove(); };

    var text = document.createElement('p');
    text.style.margin = '0';
    text.textContent = 'Claim Check could not load on this page. The site\u2019s security policy may be blocking its script.';

    var link = document.createElement('a');
    link.href = demoUrl;
    link.textContent = 'Try the demo instead';
    link.style.cssText = 'display:inline-block;margin-top:6px;color:#0e3d33;font-weight:600';

    box.appendChild(close);
    box.appendChild(text);
    box.appendChild(link);
    ;(document.body || document.documentElement).appendChild(box);

    /* The script may simply have been slow. Drop the notice if the panel
       arrives after all. */
    var poll = setInterval(function () {
      if (!document.getElementById(PANEL)) return;
      clearInterval(poll);
      box.remove();
    }, 250);
    setTimeout(function () { clearInterval(poll); }, 15000);
  }

  script.onerror = fallback;
  setTimeout(fallback, 2500);
  ;(document.head || document.documentElement).appendChild(script);
}

// The bookmarklet has to be a javascript: URL, so it is assembled here from the
// address the site is actually served from, and imports the same scanner the
// page just ran.
function buildBookmarklet () {
  // GitHub Pages serves these files with a ten-minute cache, so a reader who
  // clicked an hour ago can still be running yesterday's scanner. Stamping the
  // URL with the click time makes the bookmarklet always fetch the current one.
  const report = new URL('./report.js', window.location.href).href
  const demo = new URL('./', window.location.href).href
  // The browser strips newlines from a javascript: URL, so flatten the function
  // before serialising it. No // comments inside it, or flattening would comment
  // out the rest of the bookmarklet.
  const boot = bootBookmarklet.toString().replace(/\s*\n\s*/g, ' ')
  const code = `javascript:(${boot})(${JSON.stringify(report)},${JSON.stringify(demo)})`
  el.bookmarklet.setAttribute('href', code)
  el.bookmarklet.title = 'Drag this to your bookmarks bar'
}

renderRules()
renderFindings()
buildBookmarklet()
