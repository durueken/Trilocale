import { Box3, MathUtils, Raycaster, Vector2, Vector3 } from 'three'
import CameraControlsImpl from 'camera-controls'
import { useStore } from '../store'
import { roomById, OVERVIEW } from '../data/rooms'
import { itemById } from '../data/catalog'
import { CEILING_CM, EYE_CM, S, dirToWorld, toWorld } from '../data/coords'

const { ACTION } = CameraControlsImpl

const EYE = EYE_CM * S
const LOOK_OFFSET = 0.05 // oda içinde hedef, kameranın 5 cm önünde tutulur
const BODY_RADIUS = 0.35 // duvara en fazla bu kadar yaklaşılır
const PROBE_HEIGHTS = [0.4, 1.0, EYE]

const nav = {
  walkLockUntil: 0, // dalış/oda geçişinden hemen sonra kaydırma ataletini yut
  controls: null,
  camera: null,
  colliders: [],
  bounds: new Box3(),
  prev: null,
}

const raycaster = new Raycaster()
raycaster.firstHitOnly = true
const v1 = new Vector3()
const v2 = new Vector3()
const v3 = new Vector3()

const getMode = () => useStore.getState().mode

export function registerControls(controls, camera) {
  nav.controls = controls
  nav.camera = camera
  if (controls) applyMode(getMode())
}

export function registerModel(colliders, bounds) {
  nav.colliders = colliders
  nav.bounds.copy(bounds)
  if (nav.controls) applyMode(getMode())
}

export const getNav = () => nav

function applyMode(mode, opts = {}) {
  const c = nav.controls
  if (!c) return
  c.smoothTime = opts.smoothTime ?? 0.45
  c.draggingSmoothTime = 0.12
  c.restThreshold = 0.002

  if (mode === 'overview') {
    c.minDistance = 3
    c.maxDistance = 24
    c.minPolarAngle = 0.05
    c.maxPolarAngle = Math.PI * 0.46
    c.azimuthRotateSpeed = 0.6
    c.polarRotateSpeed = 0.6
    c.dollySpeed = 0.8
    c.dollyToCursor = true
    c.infinityDolly = false
    c.mouseButtons.left = ACTION.ROTATE
    c.mouseButtons.right = ACTION.TRUCK
    c.mouseButtons.middle = ACTION.DOLLY
    c.mouseButtons.wheel = ACTION.DOLLY
    c.touches.one = ACTION.TOUCH_ROTATE
    c.touches.two = ACTION.TOUCH_DOLLY_TRUCK
    const b = nav.bounds.isEmpty() ? null : nav.bounds.clone().expandByScalar(1)
    c.setBoundary(b ?? undefined)
  } else if (mode === 'interior') {
    c.minDistance = LOOK_OFFSET
    c.maxDistance = LOOK_OFFSET
    c.minPolarAngle = 0.35
    c.maxPolarAngle = Math.PI - 0.35
    c.azimuthRotateSpeed = -0.35
    c.polarRotateSpeed = -0.35
    c.dollyToCursor = false
    c.infinityDolly = false
    c.mouseButtons.left = ACTION.ROTATE
    c.mouseButtons.right = ACTION.ROTATE
    c.mouseButtons.middle = ACTION.NONE
    c.mouseButtons.wheel = ACTION.NONE // tekerlek bizim yürüme işleyicimizde
    c.touches.one = ACTION.TOUCH_ROTATE
    c.touches.two = ACTION.NONE
    c.setBoundary(undefined)
  } else if (mode === 'focus') {
    c.minDistance = 0.35
    c.maxDistance = opts.maxDistance ?? 6
    c.minPolarAngle = 0.15
    c.maxPolarAngle = Math.PI * 0.62
    c.azimuthRotateSpeed = 0.5
    c.polarRotateSpeed = 0.5
    c.dollySpeed = 0.6
    c.dollyToCursor = false
    c.infinityDolly = false
    c.mouseButtons.left = ACTION.ROTATE
    c.mouseButtons.right = ACTION.NONE
    c.mouseButtons.middle = ACTION.DOLLY
    c.mouseButtons.wheel = ACTION.DOLLY
    c.touches.one = ACTION.TOUCH_ROTATE
    c.touches.two = ACTION.TOUCH_DOLLY
    c.setBoundary(undefined)
  }
}

// Bilgi kartı sağda açıkken eşyayı ekranın sol-ortasına kaydırmak için
function setPanelOffset(dist) {
  const wide = window.innerWidth > 760
  nav.controls.setFocalOffset(wide && dist ? dist * 0.22 : 0, 0, 0, true)
}

function setMode(mode, opts) {
  if (mode !== 'focus') setPanelOffset(0)
  applyMode(mode, opts)
  useStore.setState({ mode, ...(mode === 'overview' ? { room: null } : null) })
}

/* ---------- çarpışma ---------- */

// Verilen noktadan yatay yönde ilk engele kadar olan mesafe
function freeDistance(origin, dir, far = 6) {
  let min = Infinity
  raycaster.far = far
  for (const h of PROBE_HEIGHTS) {
    v3.set(origin.x, h, origin.z)
    raycaster.set(v3, dir)
    const hit = raycaster.intersectObjects(nav.colliders, false)[0]
    if (hit && hit.distance < min) min = hit.distance
  }
  return min
}

// Duvara/eşyaya gömülü bir noktayı en yakın açık alana doğru iter
function standingSpot(p) {
  const out = p.clone()
  out.y = EYE
  for (let iter = 0; iter < 3; iter++) {
    const push = new Vector3()
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2
      const dir = v2.set(Math.cos(a), 0, Math.sin(a))
      const d = freeDistance(out, dir, BODY_RADIUS * 1.5)
      if (d < BODY_RADIUS) push.addScaledVector(dir, -(BODY_RADIUS - d))
    }
    if (push.lengthSq() < 1e-6) break
    out.add(push)
  }
  const b = nav.bounds
  if (!b.isEmpty()) {
    out.x = MathUtils.clamp(out.x, b.min.x + BODY_RADIUS, b.max.x - BODY_RADIUS)
    out.z = MathUtils.clamp(out.z, b.min.z + BODY_RADIUS, b.max.z - BODY_RADIUS)
  }
  return out
}

// Bir noktadan en açık yönü seçer (tercih edilen yöne hafif ağırlık vererek)
function bestLookDir(eye, preferred) {
  let best = null
  let bestScore = -Infinity
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2
    const dir = new Vector3(Math.cos(a), 0, Math.sin(a))
    const free = Math.min(freeDistance(eye, dir, 8), 8)
    const score = free * (1 + 0.35 * dir.dot(preferred))
    if (score > bestScore) {
      bestScore = score
      best = dir
    }
  }
  return best ?? preferred.clone()
}

function horizontalViewDir(out = new Vector3()) {
  nav.camera.getWorldDirection(out)
  out.y = 0
  if (out.lengthSq() < 1e-6) out.set(0, 0, -1)
  return out.normalize()
}

function lookFrom(eye, dir, transition = true) {
  const t = v1.copy(dir).normalize().multiplyScalar(LOOK_OFFSET).add(eye)
  return nav.controls.setLookAt(eye.x, eye.y, eye.z, t.x, t.y, t.z, transition)
}

/* ---------- genel API ---------- */

export function goOverview() {
  if (!nav.controls) return
  nav.prev = null
  useStore.setState({ focused: null })
  setMode('overview', { smoothTime: 0.6 })
  const [px, py, pz] = OVERVIEW.position
  const [tx, ty, tz] = OVERVIEW.target
  nav.controls.setLookAt(px, py, pz, tx, ty, tz, true)
}

export function goToRoom(id) {
  const room = roomById[id]
  if (!room || !nav.controls) return
  nav.prev = null
  useStore.setState({ focused: null, room: id })
  setMode('interior', { smoothTime: 0.6 })
  nav.walkLockUntil = performance.now() + 900
  const eye = toWorld(room.entry.at[0], room.entry.at[1], EYE_CM)
  const look = toWorld(...room.entry.look)
  lookFrom(eye, look.sub(eye))
}

// Zemindeki bir noktaya git (gerekirse genel bakıştan oda içine geç)
export function walkTo(point) {
  if (!nav.controls) return
  const mode = getMode()
  const eye = standingSpot(point)
  // Oda içindeyken bakış yönü korunur; dışarıdan girerken odanın en açık yönüne dönülür
  const dir = mode === 'interior' ? horizontalViewDir() : bestLookDir(eye, horizontalViewDir())
  dir.y = -0.12
  if (mode !== 'interior') {
    setMode('interior', { smoothTime: 0.6 })
    nav.walkLockUntil = performance.now() + 900
  } else applyMode('interior', { smoothTime: 0.4 })
  lookFrom(eye, dir)
}

// İmlecin gösterdiği yönde ileri/geri yürü (metre)
export function walk(amount, ndc) {
  const c = nav.controls
  if (!c || getMode() !== 'interior' || performance.now() < nav.walkLockUntil) return
  const dir = new Vector3()
  if (amount > 0 && ndc) {
    raycaster.setFromCamera(ndc, nav.camera)
    dir.copy(raycaster.ray.direction)
    dir.y = 0
    if (dir.lengthSq() < 1e-6) horizontalViewDir(dir)
    dir.normalize()
  } else {
    horizontalViewDir(dir)
    if (amount < 0) dir.negate()
  }
  const pos = c.getPosition(new Vector3(), true)
  const free = freeDistance(pos, dir) - BODY_RADIUS
  const step = Math.min(Math.abs(amount), Math.max(0, free))
  if (step < 0.005) return
  const target = c.getTarget(new Vector3(), true)
  c.smoothTime = 0.3
  c.moveTo(target.x + dir.x * step, target.y, target.z + dir.z * step, true)
}

// Yerinde dön (radyan)
export function turn(angle) {
  const c = nav.controls
  if (!c || getMode() !== 'interior') return
  c.rotate(angle, 0, true)
}

// Genel bakışta imlecin altındaki noktaya "dal"
export function diveAt(ndc, objects) {
  raycaster.setFromCamera(ndc, nav.camera)
  raycaster.far = Infinity
  const hit = raycaster.intersectObjects(objects, true)[0]
  if (!hit) return false
  // İmleç duvar tepesine ya da eşyaya denk geldiyse, ışın boyunca geriye doğru
  // ilerleyip altında açık zemin olan ilk noktayı ara
  const back = v2.copy(raycaster.ray.direction).setY(0).normalize().negate()
  const down = new Vector3(0, -1, 0)
  let target = null
  for (let i = 0; i <= 10 && !target; i++) {
    const probe = hit.point.clone().addScaledVector(back, i * 0.25).setY(2.3)
    raycaster.set(probe, down)
    raycaster.far = 3
    const h = raycaster.intersectObjects(nav.colliders, false)[0]
    if (h && h.point.y < 0.05) target = h.point
  }
  walkTo(target ?? hit.point)
  return true
}

export function isAtOverviewMin() {
  const c = nav.controls
  if (!c || getMode() !== 'overview') return false
  const d = c.getPosition(v1, true).distanceTo(c.getTarget(v2, true))
  return d <= c.minDistance + 0.05
}

export function focusItem(id) {
  const c = nav.controls
  const item = itemById[id]
  const { itemBoxes } = useStore.getState()
  const box = itemBoxes?.[id]
  if (!c || !item || !box) return

  const mode = getMode()
  if (mode !== 'focus') {
    nav.prev = {
      mode,
      position: c.getPosition(new Vector3(), true),
      target: c.getTarget(new Vector3(), true),
    }
  }

  const center = box.getCenter(new Vector3())
  const radius = Math.max(box.getSize(new Vector3()).length() / 2, 0.15)

  const dir = item.view
    ? dirToWorld(item.view[0], item.view[1], item.view[2] ?? 0.55)
    : nav.camera.position.clone().sub(center).setY(0).normalize().setY(0.55)
  dir.normalize()

  const cam = nav.camera
  const vFov = MathUtils.degToRad(cam.fov)
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * cam.aspect)
  const fitDist = (radius / Math.sin(Math.min(vFov, hFov) / 2)) * 1.2

  // Kamera duvarın arkasına düşmesin
  const own = new Set(useStore.getState().itemMeshes[id] ?? [])
  raycaster.set(center, dir)
  raycaster.far = fitDist + 1
  raycaster.firstHitOnly = false
  const wall = raycaster
    .intersectObjects(nav.colliders, false)
    .find((h) => !own.has(h.object) && h.distance > radius * 0.6)
  raycaster.firstHitOnly = true
  const dist = MathUtils.clamp(Math.min(fitDist, wall ? wall.distance - 0.15 : fitDist), 0.5, 7)

  const pos = center.clone().addScaledVector(dir, dist)
  pos.y = Math.min(pos.y, CEILING_CM * S - 0.15)

  useStore.setState({ focused: id, mode: 'focus', room: item.room })
  applyMode('focus', { maxDistance: Math.max(dist * 1.8, 1.5), smoothTime: 0.55 })
  c.setLookAt(pos.x, pos.y, pos.z, center.x, center.y, center.z, true)
  setPanelOffset(dist)
}

export function exitFocus() {
  const c = nav.controls
  if (!c) return
  const prev = nav.prev
  nav.prev = null
  useStore.setState({ focused: null })
  if (!prev) return goOverview()
  setMode(prev.mode, { smoothTime: 0.5 })
  const { position: p, target: t } = prev
  c.setLookAt(p.x, p.y, p.z, t.x, t.y, t.z, true)
}

export function back() {
  const { mode } = useStore.getState()
  if (mode === 'focus') exitFocus()
  else if (mode === 'interior') goOverview()
}

export const ndcFromEvent = (e, el) => {
  const r = el.getBoundingClientRect()
  return new Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
}

