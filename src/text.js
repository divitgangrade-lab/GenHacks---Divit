// One definition of the text a reader sees. Two adapters implement the same
// contract — text(source) => string — so the bookmarklet (a live DOM)
// and the corpus (saved bytes) cannot disagree about what counts as page text:
//
//   domText(document).text(root)   walks the text nodes under root
//   bytesText().text(html)         strips a saved file down to the same thing
//
// Both are built from the one skip definition below, so a region the
// bookmarklet drops is a region the corpus drops too.

// A page that quotes banned phrases on purpose — this site's rule table, a news
// article, another checker — marks those regions with data-scan-skip. Off by
// default: on a real shop page nothing is marked, so everything is read.
export const SKIP_TAGS = ['script', 'style', 'noscript', 'template', 'svg', 'iframe']
export const SKIP_ATTRIBUTES = ['data-scan-skip', 'hidden']
export const SKIP_IDS = ['claim-check-panel']

export const SKIP_SELECTOR = [
  ...SKIP_ATTRIBUTES.map(attribute => `[${attribute}]`),
  ...SKIP_IDS.map(id => `#${id}`),
  ...SKIP_TAGS
].join(', ')

const ATTRIBUTE_MATCHERS = SKIP_ATTRIBUTES.map(
  attribute => new RegExp(`(?:^|\\s)${attribute}(?:\\s|=|/|$)`, 'i')
)
const ID_MATCHERS = SKIP_IDS.map(
  id => new RegExp(`(?:^|\\s)id\\s*=\\s*["']?${id}\\b`, 'i')
)

// The byte reader has no DOM to ask, so the same definition becomes tag and
// attribute matching. aria-hidden is deliberately not [hidden]: that text is
// visible on the page and must be read.
// <head> only exists in a saved file: the DOM walk starts at <body>, so its
// <title> is page metadata for the bookmarklet, not text a reader sees.
export function isSkippedElement (name, attrs) {
  return name === 'head' ||
    SKIP_TAGS.includes(name) ||
    ATTRIBUTE_MATCHERS.some(matcher => matcher.test(attrs)) ||
    ID_MATCHERS.some(matcher => matcher.test(attrs))
}

const VOID_ELEMENTS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'])

// Browsers ignore a trailing slash on an HTML element — <div/> opens a div —
// but honour it on <svg/>, which is foreign content. Getting this wrong makes
// the byte reader show text the live DOM hides, or hide text it shows.
function closesItself (name, attrs) {
  return VOID_ELEMENTS.has(name) || (name === 'svg' && /\/\s*$/.test(attrs))
}

const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  pound: '£', euro: '€', deg: '°', copy: '©', reg: '®', trade: '™',
  hellip: '…', mdash: '—', ndash: '–', rsquo: '’', lsquo: '‘',
  ldquo: '“', rdquo: '”', middot: '·', times: '×',
}

function decodeEntities (text) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, body) => {
    if (body[0] === '#') {
      const code = body[1] === 'x' || body[1] === 'X'
        ? Number.parseInt(body.slice(2), 16)
        : Number.parseInt(body.slice(1), 10)
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff
        ? String.fromCodePoint(code)
        : whole
    }
    return ENTITIES[body.toLowerCase()] ?? whole
  })
}

// NodeFilter.SHOW_TEXT. Inlined so a stub document can drive the adapter in the
// Node test run, where there is no browser global to lean on.
const SHOW_TEXT = 4

function readableText (doc, root) {
  // Not dead code: a bookmarklet injected before a body exists would otherwise
  // throw here and leave the reader with nothing at all.
  if (!root) return ''
  const walker = doc.createTreeWalker(root, SHOW_TEXT)
  const parts = []
  let node
  while ((node = walker.nextNode()) !== null) {
    if (!node.nodeValue.trim()) continue
    if (node.parentElement?.closest(SKIP_SELECTOR)) continue
    parts.push(node.nodeValue)
  }
  return parts.join(' ')
}

// Visible text from saved bytes: what a reader sees, not the markup around it.
// One pass over the tags emits the text between them and drops everything inside
// a skipped element, so the markup is never rebuilt and stripped again. Depth
// counting keeps a nested div inside a marked div from ending the region at the
// inner close tag.
//
// One thing this cannot match: HTML closes <p>, <li> and table cells at the
// next sibling, so a hand-broken save that leaves one open reads differently in
// a browser. A page saved by a browser already carries the closing tags, so the
// corpus does not meet that shape.
export function textFromSavedPage (raw) {
  const html = String(raw ?? '')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<![^>]*>|<\?[^>]*>/g, ' ')
  const tag = /<(\/?)([a-z][a-z0-9:-]*)\b([^>]*)>/gi
  let text = ''
  let last = 0
  let skip = ''
  let depth = 0
  let match

  while ((match = tag.exec(html)) !== null) {
    const [, closing, rawName, attrs] = match
    const name = rawName.toLowerCase()
    const between = html.slice(last, match.index)
    last = tag.lastIndex

    if (skip) {
      if (name !== skip) continue
      depth += closing ? -1 : (closesItself(name, attrs) ? 0 : 1)
      if (depth === 0) skip = ''
      continue
    }

    // A tag separates two text nodes, so it separates two words. The DOM
    // adapter joins its text nodes with a space, and this keeps the two equal.
    text += between + ' '
    if (closing || !isSkippedElement(name, attrs)) continue
    if (!closesItself(name, attrs)) {
      skip = name
      depth = 1
    }
  }

  return decodeEntities(skip ? text : text + html.slice(last))
    .replace(/\s+/g, ' ')
    .trim()
}

// The contract: both adapters answer text(source) and say what kind of source
// they read. Callers can swap one for the other without changing a rule.
export function domText (doc) {
  return {
    text (root) {
      return readableText(doc, root)
    }
  }
}

export function bytesText () {
  return {
    text (raw) {
      return textFromSavedPage(raw)
    }
  }
}
