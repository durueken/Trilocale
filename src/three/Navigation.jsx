import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { CameraControls } from '@react-three/drei'
import { useStore } from '../store'
import { roomAt } from '../data/rooms'
import { OVERVIEW } from '../data/rooms'
import { toModel } from '../data/coords'
import * as navApi from './nav'
import { back, diveAt, isAtOverviewMin, ndcFromEvent, registerControls, turn, walk } from './nav'

export function Navigation() {
  const ref = useRef()
  const camera = useThree((s) => s.camera)
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const frame = useRef(0)

  useEffect(() => {
    const c = ref.current
    if (!c) return
    const [px, py, pz] = OVERVIEW.position
    const [tx, ty, tz] = OVERVIEW.target
    c.setLookAt(px, py, pz, tx, ty, tz, false)
    registerControls(c, camera)
    if (import.meta.env.DEV) {
      window.__controls = c
      window.__nav = navApi
      window.__store = useStore
    }
    return () => registerControls(null, null)
  }, [camera])

  // Tekerlek: oda içinde yürüme, genel bakışta minimum mesafedeyken odaya dalma
  useEffect(() => {
    const el = gl.domElement
    let diveArmed = 0
    const onWheel = (e) => {
      const { mode } = useStore.getState()
      if (mode === 'interior') {
        e.preventDefault()
        const unit = e.deltaMode === 1 ? 0.12 : 0.0045
        const amount = Math.max(-0.8, Math.min(0.8, -e.deltaY * unit))
        walk(amount, ndcFromEvent(e, el))
      } else if (mode === 'overview' && e.deltaY < 0) {
        // Minimum mesafeye ulaşıldıktan sonra gelen ikinci kaydırma, imlecin altındaki noktaya dalar
        if (isAtOverviewMin()) {
          diveArmed += 1
          if (diveArmed >= 2) {
            diveArmed = 0
            const model = scene.getObjectByName('Sketchfab_Scene') ?? scene
            diveAt(ndcFromEvent(e, el), [model])
          }
        } else diveArmed = 0
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false, capture: true })
    return () => el.removeEventListener('wheel', onWheel, { capture: true })
  }, [gl, scene])

  // Dokunmatik: iki parmakla sıkıştırma oda içinde ileri/geri yürütür
  useEffect(() => {
    const el = gl.domElement
    let last = null
    const dist = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY)
    const onMove = (e) => {
      if (e.touches.length !== 2 || useStore.getState().mode !== 'interior') return (last = null)
      const d = dist(e.touches)
      if (last != null) walk((d - last) * 0.012)
      last = d
    }
    const onEnd = () => (last = null)
    el.addEventListener('touchmove', onMove, { passive: true })
    el.addEventListener('touchend', onEnd)
    return () => {
      el.removeEventListener('touchmove', onMove)
      el.removeEventListener('touchend', onEnd)
    }
  }, [gl])

  // Klavye: Esc geri, W/S ya da oklar ile yürü/dön
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea')) return
      const k = e.key
      if (k === 'Escape') return back()
      if (k === 'w' || k === 'W' || k === 'ArrowUp') walk(0.5)
      else if (k === 's' || k === 'S' || k === 'ArrowDown') walk(-0.5)
      else if (k === 'a' || k === 'A' || k === 'ArrowLeft') turn(0.3)
      else if (k === 'd' || k === 'D' || k === 'ArrowRight') turn(-0.3)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Kameranın bulunduğu odayı takip et
  useFrame(() => {
    if (++frame.current % 10) return
    const { mode, setRoom } = useStore.getState()
    if (mode === 'overview') return
    const m = toModel(camera.position)
    const room = roomAt(m.x, m.y)
    if (room) setRoom(room)
  })

  return <CameraControls ref={ref} makeDefault />
}
