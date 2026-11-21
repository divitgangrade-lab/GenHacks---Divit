// Run with: npm run corpus -- path/to/saved-pages
// (or: node scripts/corpus.mjs corpus --json)
//
// It answers one question. Of the real product pages somebody saved, how many
// carry a claim the directive now bans? It reads the same src/rules.js and
// src/scan.js the bookmarklet runs, so the number it prints is the number the
// panel would show. Only the text extraction differs.
//
// Method, in short (the long version is in README.md):
//   1. Save pages by hand, one file each, before looking at the results.
//   2. This script reduces each file to visible text and feeds scan().
//   3. A page counts once, however many findings it has.
//
// What it deliberately does not do: render JavaScript, follow links, read
// attributes such as alt text, or fetch anything. It reads a saved snapshot,
// not the live site.

import { readdir, readFile } from 'node:fs/promises'
import { realpathSync } from 'node:fs'
import { execFile } from 'node:child_process'
import { join, basename } from 'node:path'
import { promisify } from 'node:util'
import { pathToFileURL } from 'node:url'
import { scan, summarise } from '../src/scan.js'
import { RULES, ruleById } from '../src/rules.js'

const run = promisify(execFile)

const PAGE_FILE = /\.(?:html?|txt)$/i

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

// Visible text: what a reader sees, not the markup around it. This is the one
// place the corpus run and the bookmarklet differ, because the bookmarklet has
// a real DOM to walk and this has only the bytes.
function textFromSavedPage (raw) {
  const html = raw
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|noscript|template|svg|iframe)\b[\s\S]*?<\/\1\s*>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
  return decodeEntities(html).replace(/\s+/g, ' ').trim()
}

async function commitHash () {
  try {
    const { stdout } = await run('git', ['rev-parse', '--short', 'HEAD'])
    return stdout.trim()
  } catch {
    return 'unknown'
  }
}

async function main () {
  const args = process.argv.slice(2)
  const asJson = args.includes('--json')
  const folder = args.find(arg => !arg.startsWith('--')) ?? 'corpus'

  let entries
  try {
    entries = await readdir(folder, { withFileTypes: true })
  } catch (error) {
    console.error(`Cannot read ${folder}: ${error.code === 'ENOENT' ? 'no such folder' : error.message}`)
    console.error('Save product pages into it first, one file per page. See README.md, section "Measuring it against real pages".')
    process.exit(1)
  }

  const files = entries
    .filter(entry => entry.isFile() && PAGE_FILE.test(entry.name))
    .map(entry => entry.name)
    .sort()

  if (files.length === 0) {
    console.error(`No .html, .htm or .txt files in ${folder}.`)
    process.exit(1)
  }

  const pages = []
  const rulePages = new Map(RULES.map(rule => [rule.id, 0]))
  let empty = 0
  let findings = 0

  for (const file of files) {
    const raw = await readFile(join(folder, file), 'utf8')
    const text = textFromSavedPage(raw)
    // A file with a handful of words is a consent wall or a failed save, not a
    // product page. Counting it as clean would flatter the hit rate.
    if (text.split(' ').length < 30) {
      empty += 1
      continue
    }
    const hits = scan(text)
    const summary = summarise(hits)
    findings += summary.total
    for (const id of new Set(hits.map(hit => hit.ruleId))) rulePages.set(id, rulePages.get(id) + 1)
    pages.push({ file: basename(file), summary, spans: [...new Set(hits.map(hit => hit.span))] })
  }

  const bannedPages = pages.filter(page => page.summary.banned > 0)
  const rate = pages.length ? (bannedPages.length / pages.length) * 100 : 0
  const commit = await commitHash()

  if (asJson) {
    console.log(JSON.stringify({
      folder,
      commit,
      pagesRead: pages.length,
      skipped: empty,
      pagesWithBannedClaim: bannedPages.length,
      bannedRate: Number(rate.toFixed(1)),
      findings,
      byRule: Object.fromEntries([...rulePages].map(([id, count]) => [id, count])),
      pages: pages.map(page => ({ file: page.file, ...page.summary })),
    }, null, 2))
    return
  }

  for (const page of pages) {
    const flag = page.summary.banned > 0 ? 'BANNED' : 'clean '
    const counts = `${String(page.summary.banned).padStart(2)} banned  ${String(page.summary.needsEvidence).padStart(2)} evidence`
    const spans = page.spans.length ? `  ${page.spans.slice(0, 4).join(', ')}${page.spans.length > 4 ? ', …' : ''}` : ''
    console.log(`${flag} ${counts}  ${page.file}${spans}`)
  }

  console.log(`\n${pages.length} pages read${empty ? `, ${empty} skipped as too short to be a page` : ''} · claim-check @ ${commit}`)
  console.log(`${bannedPages.length} carry at least one banned claim (${rate.toFixed(1)}%)`)
  console.log(`${findings} findings in total\n`)

  const rows = [...rulePages]
    .map(([id, count]) => ({ label: `${ruleById(id).severity === 'banned' ? 'banned ' : 'evidence'}  ${id}`, count }))
    .sort((a, b) => b.count - a.count)
  for (const row of rows) console.log(`${String(row.count).padStart(4)} pages  ${row.label}`)
}

// Comparing a raw path to a URL only works when the path has no spaces, no
// symlink and no drive letter. pathToFileURL plus realpath is what actually
// matches import.meta.url, so a folder called "saved pages" still runs.
function invokedDirectly () {
  if (!process.argv[1]) return false
  try {
    return pathToFileURL(realpathSync(process.argv[1])).href === import.meta.url
  } catch {
    return false
  }
}

if (invokedDirectly()) {
  main().catch(error => {
    console.error(error)
    process.exit(1)
  })
}
