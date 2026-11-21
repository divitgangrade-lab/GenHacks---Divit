// Pulls real component source from the React Bits registry.
// Nothing here is written from memory: every file comes from
// https://reactbits.dev/r/<Name>-JS-CSS.json
//
//   node scripts/rb-fetch.mjs          # fetch the selection
//   node scripts/rb-fetch.mjs --list   # print the selection
//
// JS-CSS is used, not JS-TW, because this repo has no Tailwind. The CSS
// variants ship a sibling stylesheet that Vite bundles on import.

import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

const OUT = 'showroom/src/components'
const REGISTRY = 'https://reactbits.dev/r/registry.json'

// Heavy 3D stacks (three, r3f, drei) are excluded: 50 live WebGL scenes on one
// page is a fan heater, not a demo.
const HEAVY = /three@|@react-three|@hugeicons|matter-js|vgpu/

export async function choose (count = 50) {
  const response = await fetch(REGISTRY)
  const registry = await response.json()
  const items = registry.items.filter(item => item.name.endsWith('-JS-CSS'))
  const light = items.filter(item => !(item.dependencies || []).some(dep => HEAVY.test(dep)))
  // Spread the pick across dependencies so the page is not all one library.
  const byDep = new Map()
  for (const item of light) {
    const key = (item.dependencies || ['none']).join('+')
    if (!byDep.has(key)) byDep.set(key, [])
    byDep.get(key).push(item)
  }
  const picked = []
  while (picked.length < count) {
    let added = false
    for (const bucket of byDep.values()) {
      const next = bucket.shift()
      if (!next) continue
      picked.push(next)
      added = true
      if (picked.length >= count) break
    }
    if (!added) break
  }
  return picked
}

async function fetchOne (item) {
  const url = `https://reactbits.dev/r/${item.name}.json`
  const response = await fetch(url)
  const json = await response.json()
  if (!Array.isArray(json.files) || !json.files.length) throw new Error(`no files for ${item.name}`)
  const written = []
  for (const file of json.files) {
    const target = join(OUT, file.path)
    await mkdir(dirname(target), { recursive: true })
    await writeFile(target, file.content)
    written.push(file.path)
  }
  return { name: item.title, files: written, dependencies: json.dependencies || [] }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const list = await choose(50)
  if (process.argv.includes('--list')) {
    console.log(list.map(item => item.title).join('\n'))
    console.log(`\n${list.length} components`)
    process.exit(0)
  }
  const deps = new Set()
  const done = []
  for (const item of list) {
    const result = await fetchOne(item)
    result.dependencies.forEach(dep => deps.add(dep))
    done.push(result)
    console.log(`ok  ${result.name.padEnd(22)} ${result.files.join(', ')}`)
  }
  console.log(`\n${done.length} components written to ${OUT}`)
  console.log(`dependencies: ${[...deps].join(' ')}`)
}
