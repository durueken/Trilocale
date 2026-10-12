import { useStore } from '../store'
import { rooms } from '../data/rooms'
import { goOverview, goToRoom } from '../three/nav'

export function RoomMenu() {
  const mode = useStore((s) => s.mode)
  const room = useStore((s) => s.room)
  return (
    <nav className="room-menu" aria-label="Odalar">
      <button className={mode === 'overview' ? 'is-active' : ''} onClick={goOverview}>
        <span className="idx">00</span> Genel Bakış
      </button>
      {rooms.map((r, i) => (
        <button key={r.id} className={mode !== 'overview' && room === r.id ? 'is-active' : ''} onClick={() => goToRoom(r.id)}>
          <span className="idx">{String(i + 1).padStart(2, '0')}</span> {r.name}
        </button>
      ))}
    </nav>
  )
}
