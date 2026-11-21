// Readability scoring, implemented here rather than imported, so the numbers on
// screen can be traced to code a reader can check.

// Words the heuristic gets wrong often enough to be worth listing.
const ONE_SYLLABLE = new Set([
  'you','your','yours','are','the','a','an','of','to','and','is','in','on','or','if','it','be','do','go','no','so',
  'we','he','she','they','them','take','took','day','days','week','weeks','night','time','times','blood','heart','pain',
  'fever','chest','nurse','doctor','twice','once','three','four','five','six','eight','twelve','call','walk','food',
  'diet','water','sleep','work','home','back','head','leg','arm','skin','mouth','eyes','ears','test','scan','dose',
  'pill','pills','change','check','stop','start','hold','avoid','limit','drink','eat','wash','move','up','down','out',
  'off','not','new','old','same','more','less','than','then','that','this','with','from','for','but','all','any','can',
  'may','must','will','was','were','been','has','have','had','as','at','by','my','me','us','our','their','his','her',
  'its','use','used','side','sign','signs','care','keep','kept','feel','felt','need','help','room','bed','rest','sit',
  'stand','lift','bend','drive','sex','bath','shower','dress','wound','cut','stitch','stitches','scar','bruise','dizzy',
])

export function syllables (word) {
  const w = String(word).toLowerCase().replace(/[^a-z]/g, '')
  if (!w) return 0
  if (ONE_SYLLABLE.has(w)) return 1
  if (w.length <= 3) return 1

  // Drop a silent final e, and -ed / -es endings that carry no syllable.
  const stripped = w
    .replace(/(?:[^laeiouy]e)$/, '')
    .replace(/(?:[^laeiouy]es|ed)$/, '')
    .replace(/^y/, '')

  const groups = stripped.match(/[aeiouy]{1,2}/g)
  return Math.max(1, groups ? groups.length : 1)
}

function round (n) {
  return Number.isFinite(n) ? Math.round(n * 10) / 10 : 0
}

export function analyse (text) {
  const source = String(text || '')

  const sentences = (source.match(/[^.!?\n]+[.!?]*/g) || [])
    .map(s => s.trim())
    .filter(s => /[A-Za-z0-9]/.test(s))

  const words = source.match(/[A-Za-z][A-Za-z'-]*/g) || []
  const wordCount = words.length || 1
  const sentenceCount = Math.max(1, sentences.length)
  const syllableCount = words.reduce((sum, w) => sum + syllables(w), 0)
  const polysyllables = words.filter(w => syllables(w) >= 3).length

  const wordsPerSentence = wordCount / sentenceCount
  const syllablesPerWord = syllableCount / wordCount

  const fkgl = 0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59
  const fre = 206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord
  const smog = 1.043 * Math.sqrt(polysyllables * (30 / sentenceCount)) + 3.1291

  return {
    words: wordCount,
    sentences: sentenceCount,
    syllables: syllableCount,
    polysyllables,
    fkgl: round(Math.max(0, fkgl)),
    fre: round(Math.min(100, Math.max(0, fre))),
    smog: round(smog),
  }
}
