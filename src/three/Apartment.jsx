import { useLayoutEffect, useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { Box3, DoubleSide, FrontSide, PlaneGeometry, Vector3 } from 'three'
import { Reflector } from 'three/examples/jsm/objects/Reflector.js'
import { useStore } from '../store'
import { catalog, meshToItem } from '../data/catalog'
import { CEILING_CM, MODEL_POSITION, S, toModel, toWorld } from '../data/coords'
import { diveAt, focusItem, registerModel, walkTo } from './nav'

const MODEL_URL = '/models/apartment.glb'

const GLASS = /^Glass/
const MIRROR = /^Mirror$/
const METAL = /Chrome|Stainless|Nickel|Tin_Polished|Aluminum|Brass|RUBINETTERIA|Appliance_Stainl|LAVABO_TAPPO/

// Sketchfab dışa aktarımında olmayan malzeme ayarlarını tamamlar
function fixMaterial(m) {
  if (!m || m.userData.fixed) return
  m.userData.fixed = true
  m.envMapIntensity = 1
  if (m.map) m.map.anisotropy = 8

  if (GLASS.test(m.name)) {
    m.transparent = true
    m.opacity = m.name.includes('Grey') ? 0.22 : 0.16
    m.depthWrite = false
    m.roughness = 0.05
    m.metalness = 0.2
    m.side = DoubleSide
  } else if (METAL.test(m.name)) {
    m.metalness = 0.85
    m.roughness = 0.28
  }
}

// Banyolardaki ayna panelleri (model cm): batı duvarında, doğuya bakıyor
const MIRRORS = [
  { x: -8571, y0: -72, y1: 17, z0: 91, z1: 211 },
  { x: -8571, y0: 325, y1: 424, z0: 91, z1: 211 },
]

function Mirror({ x, y0, y1, z0, z1 }) {
  const reflector = useMemo(() => {
    const w = (y1 - y0) * S
    const h = (z1 - z0) * S
    const r = new Reflector(new PlaneGeometry(w, h), {
      textureWidth: 1024,
      textureHeight: Math.round((1024 * h) / w),
      color: 0xc9cdd0,
      clipBias: 0.003,
    })
    r.raycast = () => null
    return r
  }, [y0, y1, z0, z1])
  const position = useMemo(() => toWorld(x + 0.4, (y0 + y1) / 2, (z0 + z1) / 2).toArray(), [x, y0, y1, z0, z1])
  return <primitive object={reflector} position={position} rotation={[0, Math.PI / 2, 0]} />
}

function isFloorHit(e) {
  if (!e.face) return false
  const n = e.face.normal.clone().transformDirection(e.object.matrixWorld)
  return n.y > 0.7 && e.point.y < 0.35
}

export function Apartment({ debug = false }) {
  const { scene } = useGLTF(MODEL_URL)
  const ring = useRef()

  const ceilingBox = useMemo(() => {
    // Dış duvarların kapladığı alan (model cm): tavan bu alanı örter
    const a = toWorld(-8941, 531, 0)
    const b = toWorld(-7839, -189, 0)
    return { width: b.x - a.x, depth: b.z - a.z, x: (a.x + b.x) / 2, z: (a.z + b.z) / 2 }
  }, [])

  useLayoutEffect(() => {
    scene.position.set(...MODEL_POSITION)
    scene.scale.setScalar(S)
    scene.updateMatrixWorld(true)

    const byName = {}
    const meshes = []
    scene.traverse((o) => {
      if (!o.isMesh) return
      byName[o.name] = o
      meshes.push(o)
      fixMaterial(o.material)
      // Modeldeki ayna yalnızca düz bir malzeme; yerine gerçek yansıma yapan <Mirror> konuyor
      if (MIRROR.test(o.material?.name)) o.visible = false
      const glass = GLASS.test(o.material?.name)
      o.castShadow = !glass
      o.receiveShadow = !glass
    })

    // Eşya mesh'leri ve otomatik ölçüler
    const itemMeshes = {}
    const itemBoxes = {}
    const itemDims = {}
    for (const item of catalog) {
      const list = item.meshes.map((n) => byName[n]).filter(Boolean)
      itemMeshes[item.id] = list
      let box
      if (item.box) {
        const [x0, y0, z0, x1, y1, z1] = item.box
        box = new Box3().setFromPoints([toWorld(x0, y0, z0), toWorld(x1, y1, z1)])
      } else {
        box = new Box3()
        list.forEach((m) => box.expandByObject(m))
      }
      if (box.isEmpty()) continue
      itemBoxes[item.id] = box
      const size = box.getSize(new Vector3()).divideScalar(S)
      const [w, d] = [size.x, size.z].sort((p, q) => q - p)
      const cm = (v) => Math.max(1, Math.round(v))
      itemDims[item.id] = { w: cm(w), d: cm(d), h: cm(size.y) }
    }

    const bounds = new Box3().setFromObject(scene)
    registerModel(meshes, bounds)
    useStore.setState({ ready: true, itemMeshes, itemBoxes, itemDims })

    if (debug || import.meta.env.DEV) window.__model = { scene, byName, bounds }
  }, [scene, debug])

  const itemFromEvent = (e) => meshToItem[e.object.name] ?? null

  const onPointerMove = (e) => {
    const r = ring.current
    const floor = isFloorHit(e)
    if (r) {
      r.visible = floor && useStore.getState().mode !== 'focus'
      if (floor) r.position.set(e.point.x, e.point.y + 0.01, e.point.z)
    }
    const id = itemFromEvent(e)
    useStore.getState().setHovered(id)
    document.body.style.cursor = id ? 'pointer' : ''
  }

  const onPointerOut = () => {
    if (ring.current) ring.current.visible = false
    useStore.getState().setHovered(null)
    document.body.style.cursor = ''
  }

  const onClick = (e) => {
    if (e.delta > 4) return // sürükleme sonu tıklama sayılmaz
    e.stopPropagation()
    if (debug) {
      const m = toModel(e.point)
      console.log(
        `[debug] ${e.object.name} (${e.object.material?.name}) model cm: [${m.x.toFixed(0)}, ${m.y.toFixed(0)}, ${m.z.toFixed(0)}]`,
        'world:', e.point.toArray().map((n) => +n.toFixed(2)),
      )
      useStore.setState({ debugPoint: { ...m, name: e.object.name, mat: e.object.material?.name } })
    }
    const id = itemFromEvent(e)
    if (id) focusItem(id)
  }

  const onDoubleClick = (e) => {
    e.stopPropagation()
    if (itemFromEvent(e)) return
    const { mode } = useStore.getState()
    if (mode === 'focus') return
    if (isFloorHit(e)) walkTo(e.point)
    else if (mode === 'overview') diveAt(e.pointer, [scene])
  }

  return (
    <group onPointerMove={onPointerMove} onPointerOut={onPointerOut} onClick={onClick} onDoubleClick={onDoubleClick}>
      <primitive object={scene} />

      {/* Modelde olmayan tavan: normali aşağı bakan tek yüzlü düzlem.
          İçeriden görünür, genel bakışta (yukarıdan) otomatik olarak görünmez. */}
      <mesh
        position={[ceilingBox.x, CEILING_CM * S - 0.003, ceilingBox.z]}
        rotation={[Math.PI / 2, 0, 0]}
        raycast={() => null}
      >
        <planeGeometry args={[ceilingBox.width, ceilingBox.depth]} />
        <meshStandardMaterial color="#f3f0ea" roughness={0.95} side={FrontSide} />
      </mesh>

      {MIRRORS.map((m) => (
        <Mirror key={m.y0} {...m} />
      ))}

      {/* Zemindeki imleç halkası */}
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} visible={false} raycast={() => null} renderOrder={10}>
        <ringGeometry args={[0.16, 0.2, 48]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.85} depthWrite={false} />
      </mesh>
    </group>
  )
}

useGLTF.preload(MODEL_URL)
