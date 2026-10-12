import { Experience } from './three/Experience'
import { Loader } from './ui/Loader'
import { RoomMenu } from './ui/RoomMenu'
import { ItemPanel } from './ui/ItemPanel'
import { ItemDrawer } from './ui/ItemDrawer'
import { HintBar } from './ui/HintBar'
import { Credits } from './ui/Credits'
import { DebugPanel } from './ui/DebugPanel'
import { useEffect, useRef } from 'react'
import { useStore } from './store'
import { itemById } from './data/catalog'

const debug = new URLSearchParams(window.location.search).has('debug')

export default function App() {
  const hovered = useStore((s) => s.hovered)
  return (
    <div className="app">
      <div className="stage">
        <Experience debug={debug} />
      </div>

      <header className="brand">
        <p className="eyebrow">İç mimarlık vitrini</p>
        <h1>Trilocale</h1>
        <p className="brand-sub">Via Boncompagni · Milano</p>
      </header>

      <RoomMenu />
      <ItemDrawer />
      <ItemPanel />
      <HintBar />
      <Credits />
      <Loader />
      {hovered && <HoverTag id={hovered} />}
      {debug && <DebugPanel />}
    </div>
  )
}

// İmleci takip eden eşya adı etiketi
const pointer = { x: -999, y: -999 }
window.addEventListener('pointermove', (e) => Object.assign(pointer, { x: e.clientX, y: e.clientY }))
const tagTransform = (x, y) => `translate(${x + 16}px, ${y + 14}px)`

function HoverTag({ id }) {
  const ref = useRef()
  const mode = useStore((s) => s.mode)
  const focused = useStore((s) => s.focused)
  useEffect(() => {
    const move = (e) => ref.current && (ref.current.style.transform = tagTransform(e.clientX, e.clientY))
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [])
  const item = itemById[id]
  if (!item || focused === id) return null
  return (
    <div ref={ref} className="hover-tag" data-mode={mode} style={{ transform: tagTransform(pointer.x, pointer.y) }}>
      {item.name}
    </div>
  )
}
