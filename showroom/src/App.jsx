import { Component, useEffect, useRef, useState } from 'react'
import * as RB from './components/index.js'

// ---------------------------------------------------------------------------
// Every component below is fetched source from reactbits.dev, not re-written.
// Fifteen of them are text effects; the rest wrap children, fill a canvas, or
// take over the cursor. Wrapping each in its own error boundary keeps one
// broken component from taking the page down.
// ---------------------------------------------------------------------------

// Some components expect image URLs, not colours. A one-pixel-free SVG swatch
// keeps the demo self-contained with no external requests.
const swatch = color => `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="${color}"/></svg>`
)}`

class Boundary extends Component {
  constructor (props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError () {
    return { failed: true }
  }

  render () {
    if (this.state.failed) {
      return <p className="tile__fail">{this.props.name} could not mount here</p>
    }
    return this.props.children
  }
}

function Tile ({ name, tall, children }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (shown || !ref.current) return
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setShown(true)
        observer.disconnect()
      }
    }, { rootMargin: '250px' })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [shown])

  return (
    <div ref={ref} className={`tile${tall ? ' tile--tall' : ''}`}>
      <div className="tile__stage">
        {shown ? <Boundary name={name}>{children}</Boundary> : <span className="tile__idle">·</span>}
      </div>
      <span className="tile__name">{name}</span>
    </div>
  )
}

// RubberSegment and SquishSwitch are controlled; give them somewhere to put
// their state so they are not frozen on first paint.
function Segmented () {
  const [value, setValue] = useState('One')
  return (
    <RB.RubberSegment
      items={['One', 'Two', 'Three']}
      value={value}
      onChange={setValue}
    />
  )
}

function Switch () {
  const [on, setOn] = useState(true)
  return <RB.SquishSwitch checked={on} onChange={setOn} label="On" />
}

const TEXT_TILES = [
  { name: 'BlurText', node: <RB.BlurText text="Claim Check" animateBy="words" direction="top" /> },
  { name: 'CircularText', node: <RB.CircularText text="CLAIM CHECK · " size={170} fontSize={19} /> },
  { name: 'CountUp', node: <RB.CountUp to={2026} from={1990} duration={3} className="big" /> },
  { name: 'DecryptedText', node: <RB.DecryptedText text="ECO-FRIENDLY?" sequential speed={40} /> },
  { name: 'FoldText', node: <RB.FoldText text="Unfolding" /> },
  { name: 'MaskedHeading', node: <RB.MaskedHeading text="Behind the claim" /> },
  { name: 'RotatingText', node: <RB.RotatingText texts={['Banned', 'Unproven', 'Offset', 'Generic']} /> },
  { name: 'ScrambledText', node: <RB.ScrambledText radius={140}>Hover to scramble</RB.ScrambledText> },
  { name: 'ScrollFloat', node: <RB.ScrollFloat>Floating words</RB.ScrollFloat> },
  { name: 'Shuffle', node: <RB.Shuffle text="Shuffle me" /> },
  { name: 'SplitText', node: <RB.SplitText text="Split apart" splitType="chars" /> },
  { name: 'StrokeText', node: <RB.StrokeText text="Outline" /> },
  { name: 'TextLoop', node: <RB.TextLoop text="Looping ribbon" /> },
  { name: 'TextType', node: <RB.TextType text={['Typing…', 'the verdict', 'four claims']} /> },
  { name: 'TrueFocus', node: <RB.TrueFocus sentence="Focus the claim" /> },
  { name: 'WarpText', node: <RB.WarpText text="Bend the claim" /> },
]

const SCROLL_TILES = [
  { name: 'AnimatedContent', node: <RB.AnimatedContent><p className="demo">Revealed on scroll</p></RB.AnimatedContent> },
  { name: 'FadeContent', node: <RB.FadeContent><p className="demo">Fades in</p></RB.FadeContent> },
  { name: 'ScrollReveal', node: <RB.ScrollReveal><p className="demo">Words rise as you scroll</p></RB.ScrollReveal> },
  { name: 'ScrollVelocity', node: <RB.ScrollVelocity texts={['scroll faster', 'and this speeds up']} /> }
]

const SURFACE_TILES = [
  { name: 'ClickSpark', node: <RB.ClickSpark><button className="demo demo--button" type="button">Click anywhere</button></RB.ClickSpark> },
  { name: 'Dock', node: <RB.Dock items={[{ label: 'One' }, { label: 'Two' }, { label: 'Three' }]} /> },
  { name: 'ElectricBorder', node: <RB.ElectricBorder><div className="demo demo--box">Live border</div></RB.ElectricBorder> },
  { name: 'FlexCarousel', node: <RB.FlexCarousel /> },
  { name: 'GlareHover', node: <RB.GlareHover height="120px" width="180px"><div className="demo demo--box">Glare</div></RB.GlareHover> },
  { name: 'GradualBlur', node: <div className="demo demo--blur">Blurred edge</div> },
  { name: 'ImageTrail', node: <RB.ImageTrail items={[swatch('#7df9ff'), swatch('#f4a261'), swatch('#e76f51')]} /> },
  { name: 'LogoLoop', node: <RB.LogoLoop logos={[{ src: swatch('#7df9ff'), alt: 'One' }, { src: swatch('#f4a261'), alt: 'Two' }, { src: swatch('#e76f51'), alt: 'Three' }]} /> },
  { name: 'Magnet', node: <RB.Magnet><span className="demo demo--chip">Magnet</span></RB.Magnet> },
  { name: 'MorphSlider', node: <RB.MorphSlider /> },
  { name: 'MicroSlats', node: <RB.MicroSlats /> },
  { name: 'RubberSegment', node: <Segmented /> },
  { name: 'Shredder', node: <RB.Shredder items={['One', 'Two', 'Three']} renderItem={item => <div className="demo demo--sheet">{item}</div>} /> },
  { name: 'SquishSwitch', node: <Switch /> },
  { name: 'Stack', node: <RB.Stack cards={['#7df9ff', '#f4a261', '#e76f51', '#f4f1ea'].map((color, index) => (
    <div key={color} className="demo demo--sheet" style={{ background: color, color: '#0c0b0f', fontSize: '1.6rem' }}>{index + 1}</div>
  ))} /> },
  { name: 'WarmTooltip', node: <RB.WarmTooltip content="Every claim needs a citation"><button className="demo demo--button" type="button">Hover me</button></RB.WarmTooltip> }
]

const CANVAS_TILES = [
  { name: 'CrystalizedBall', node: <RB.CrystalizedBall /> },
  { name: 'Cubes', node: <RB.Cubes /> },
  { name: 'DitherVeil', node: <RB.DitherVeil /> },
  { name: 'DomeGallery', node: <RB.DomeGallery /> },
  { name: 'ElectricLogo', node: <RB.ElectricLogo /> },
  { name: 'EvilEye', node: <RB.EvilEye /> },
  { name: 'MetaBalls', node: <RB.MetaBalls /> },
  { name: 'PatternWaves', node: <RB.PatternWaves /> },
  { name: 'RippleDistortion', node: <RB.RippleDistortion /> },
  { name: 'ScrubField', node: <RB.ScrubField /> }
]

const CURSOR_TILES = [
  { name: 'Crosshair', node: <RB.Crosshair /> },
  { name: 'GhostCursor', node: <RB.GhostCursor /> },
  { name: 'GlowCursor', node: <RB.GlowCursor /> },
  { name: 'TargetCursor', node: <RB.TargetCursor /> }
]

function Section ({ title, count, children }) {
  return (
    <section className="section">
      <div className="section__head">
        <h2>{title}</h2>
        <span>{count} components</span>
      </div>
      <div className="grid">{children}</div>
    </section>
  )
}

function Cursors () {
  const [active, setActive] = useState(null)
  const chosen = CURSOR_TILES.find(tile => tile.name === active)

  return (
    <section className="section">
      <div className="section__head">
        <h2>Cursors</h2>
        <span>4 components, one at a time</span>
      </div>
      <p className="cursor-hint">
        These replace the pointer for the whole page, so mounting all four at once would draw four cursors on top of each other. Pick one.
      </p>
      <div className="cursor-bar">
        {CURSOR_TILES.map(tile => (
          <button
            key={tile.name}
            type="button"
            aria-pressed={active === tile.name}
            onClick={() => setActive(current => current === tile.name ? null : tile.name)}
          >
            {tile.name}
          </button>
        ))}
      </div>
      {chosen ? <Boundary name={chosen.name}>{chosen.node}</Boundary> : <p className="cursor-hint">No cursor mounted.</p>}
    </section>
  )
}

export default function App () {
  return (
    <main className="wrap">
      <p className="kicker">Claim Check · supporting page</p>
      <div className="top">
        <h1>Motion showroom</h1>
        <a className="back" href="../">Back to Claim Check</a>
      </div>
      <p className="lede">
        Fifty components from <a href="https://reactbits.dev" rel="noopener noreferrer">React Bits</a>, fetched as source from its registry and
        wired in without edits. Each tile mounts only when it scrolls into view, so the page does not open fifty canvases at once.
      </p>

      <Section title="Text" count={TEXT_TILES.length}>
        {TEXT_TILES.map(({ name, node }) => <Tile key={name} name={name}>{node}</Tile>)}
      </Section>

      <Section title="Scroll" count={SCROLL_TILES.length}>
        {SCROLL_TILES.map(({ name, node }) => <Tile key={name} name={name}>{node}</Tile>)}
      </Section>

      <Section title="Surfaces" count={SURFACE_TILES.length}>
        {SURFACE_TILES.map(({ name, node }) => <Tile key={name} name={name}>{node}</Tile>)}
      </Section>

      <Section title="Canvas" count={CANVAS_TILES.length}>
        {CANVAS_TILES.map(({ name, node }) => <Tile key={name} name={name} tall>{node}</Tile>)}
      </Section>

      <Cursors />

      <p className="foot">
        50 components · fetched from reactbits.dev/r/ · MIT + Commons Clause, by David Haz.
      </p>
    </main>
  )
}
