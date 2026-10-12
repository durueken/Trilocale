import { useProgress } from '@react-three/drei'
import { useStore } from '../store'

export function Loader() {
  const { progress } = useProgress()
  const ready = useStore((s) => s.ready)
  return (
    <div className={`loader ${ready ? 'is-done' : ''}`} aria-hidden={ready}>
      <div className="loader-inner">
        <p className="eyebrow">Daire hazırlanıyor</p>
        <h2>Trilocale</h2>
        <div className="loader-bar">
          <span style={{ transform: `scaleX(${Math.max(progress, 4) / 100})` }} />
        </div>
        <p className="loader-pct">{Math.round(progress)}%</p>
      </div>
    </div>
  )
}
