import { scan, sentenceParts, summarise, verdictLine } from './src/scan.js'
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
    const { before, match, after } = sentenceParts(hit)
    return `
      <li>
        <p class="findings__sentence">${escapeHtml(before)}<mark>${escapeHtml(match)}</mark>${escapeHtml(after)}</p>
        <p class="findings__head">
          <span class="tag ${rule.severity}">${TAG_LABEL[rule.severity]}</span>
          <span class="findings__rule">${escapeHtml(rule.title)}</span>
        </p>
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

    /* A dialog is used instead of a styled div because a strict page often
       blocks inline styles along with the module. showModal() puts the
       message in the browser's top layer with its own default styling, so
       the explanation is visible even when page CSS and inline styles are
       refused. */
    var dialog = document.createElement('dialog');
    dialog.id = NOTICE;
    dialog.setAttribute('aria-label', 'Claim Check could not load');

    var text = document.createElement('p');
    text.textContent = 'Claim Check could not load on this page. The site\u2019s security policy may be blocking its script.';

    var link = document.createElement('a');
    link.href = demoUrl;
    link.textContent = 'Open the demo instead';

    var close = document.createElement('button');
    close.type = 'button';
    close.textContent = 'Close';
    close.onclick = function () {
      if (typeof dialog.close === 'function') dialog.close(); else dialog.remove();
    };

    var actions = document.createElement('p');
    actions.appendChild(link);
    actions.appendChild(document.createTextNode(' '));
    actions.appendChild(close);

    dialog.appendChild(text);
    dialog.appendChild(actions);
    dialog.addEventListener('close', function () { dialog.remove(); });

    ;(document.body || document.documentElement).appendChild(dialog);
    if (typeof dialog.showModal === 'function') {
      try {
        dialog.showModal();
      } catch (e) {
        dialog.setAttribute('open', '');
      }
    } else {
      dialog.setAttribute('open', '');
    }

    /* The script may simply have been slow. Drop the notice if the panel
       arrives after all. */
    var poll = setInterval(function () {
      if (!document.getElementById(PANEL)) return;
      clearInterval(poll);
      if (typeof dialog.close === 'function') dialog.close(); else dialog.remove();
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
