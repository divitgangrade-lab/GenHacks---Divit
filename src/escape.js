// One escaping rule for both renderers: the demo page and the bookmarklet
// panel build HTML strings from page text, so the same five characters have to
// be neutralised in the same order in both places.

export function escapeHtml (value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
