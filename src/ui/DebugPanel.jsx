import { useStore } from '../store'

export function DebugPanel() {
  const p = useStore((s) => s.debugPoint)
  const mode = useStore((s) => s.mode)
  const room = useStore((s) => s.room)
  return (
    <div className="debug-panel">
      <div>mode: {mode} · room: {room ?? '-'}</div>
      {p && (
        <div>
          {p.name} ({p.mat})<br />
          model cm: [{p.x.toFixed(0)}, {p.y.toFixed(0)}, {p.z.toFixed(0)}]
        </div>
      )}
    </div>
  )
}
