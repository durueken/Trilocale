import { Suspense, useEffect, useMemo } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Bvh, Html } from '@react-three/drei'
import { EffectComposer, N8AO, Outline, SMAA } from '@react-three/postprocessing'
import { ACESFilmicToneMapping, PMREMGenerator, SRGBColorSpace } from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { useStore } from '../store'
import { rooms } from '../data/rooms'
import { toWorld } from '../data/coords'
import { Apartment } from './Apartment'
import { Navigation } from './Navigation'
import { ItemPins, RoomLabels } from './Hotspots'

// Modelde ışık yok: yumuşak bir iç mekân ortamı (PMREM) koddan üretilir
function Environment() {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  useEffect(() => {
    const pmrem = new PMREMGenerator(gl)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = env
    scene.environmentIntensity = 0.75
    return () => {
      scene.environment = null
      env.dispose()
      pmrem.dispose()
    }
  }, [gl, scene])
  return null
}

function Lights() {
  return (
    <>
      <hemisphereLight args={['#fffaf2', '#c9bfb2', 0.9]} />
      <directionalLight
        position={[6, 12, 4]}
        intensity={1.6}
        color="#fff3e2"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-camera-near={1}
        shadow-camera-far={30}
      />
    </>
  )
}

function Effects() {
  const hovered = useStore((s) => s.hovered)
  const focused = useStore((s) => s.focused)
  const itemMeshes = useStore((s) => s.itemMeshes)
  const selection = useMemo(() => {
    const ids = [...new Set([hovered, focused].filter(Boolean))]
    return ids.flatMap((id) => itemMeshes[id] ?? [])
  }, [hovered, focused, itemMeshes])

  return (
    <EffectComposer multisampling={0} enableNormalPass={false} autoClear={false}>
      <N8AO aoRadius={0.6} distanceFalloff={0.8} intensity={2.2} halfRes quality="medium" />
      <Outline selection={selection} edgeStrength={5} visibleEdgeColor={0xffffff} hiddenEdgeColor={0x000000} blur xRay={false} />
      <SMAA />
    </EffectComposer>
  )
}

// Html etiketleri model yüklendikten sonra, Suspense dışında bağlanır
function Overlays() {
  const ready = useStore((s) => s.ready)
  if (!ready) return null
  return (
    <>
      <ItemPins />
      <RoomLabels />
    </>
  )
}

function DebugHelpers() {
  const ready = useStore((s) => s.ready)
  const labels = useMemo(() => {
    const out = []
    for (let x = -8900; x <= -7900; x += 100) out.push({ text: String(x), p: toWorld(x, 560, 0).toArray() })
    for (let y = -100; y <= 500; y += 100) out.push({ text: String(y), p: toWorld(-8990, y, 0).toArray() })
    return out
  }, [])
  return (
    <>
      <gridHelper args={[16, 16, '#d33', '#999']} position={toWorld(-8400, 200, 1).toArray()} />
      {rooms.map((r) => {
        const [x0, y0, x1, y1] = r.box
        const a = toWorld(x0, y0, 0)
        const b = toWorld(x1, y1, 260)
        return (
          <mesh key={r.id} position={[(a.x + b.x) / 2, b.y / 2, (a.z + b.z) / 2]} raycast={() => null}>
            <boxGeometry args={[Math.abs(b.x - a.x), b.y, Math.abs(b.z - a.z)]} />
            <meshBasicMaterial color="#e33" wireframe />
          </mesh>
        )
      })}
      {/* Html kökleri, model yüklenirken sökülmesinler diye Overlays gibi hazır olunca bağlanır */}
      {ready && labels.map((l) => (
        <Html key={l.text + l.p} position={l.p} center>
          <span className="debug-tick">{l.text}</span>
        </Html>
      ))}
    </>
  )
}

export function Experience({ debug }) {
  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 1.75]}
      camera={{ fov: 55, near: 0.03, far: 120, position: [4.5, 13, 9.5] }}
      gl={{ antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: debug }}
      onCreated={({ gl }) => {
        gl.toneMapping = ACESFilmicToneMapping
        gl.toneMappingExposure = 1.05
        gl.outputColorSpace = SRGBColorSpace
      }}
    >
      <color attach="background" args={['#e9e4dc']} />
      <Environment />
      <Lights />
      <Suspense fallback={null}>
        <Bvh firstHitOnly>
          <Apartment debug={debug} />
        </Bvh>
      </Suspense>
      <Overlays />
      <Navigation />
      <Effects />
      {debug && <DebugHelpers />}
    </Canvas>
  )
}
