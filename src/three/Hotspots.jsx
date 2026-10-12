import { useMemo } from 'react'
import { Html } from '@react-three/drei'
import { Vector3 } from 'three'
import { useStore } from '../store'
import { catalog } from '../data/catalog'
import { rooms, zoneOf } from '../data/rooms'
import { toWorld } from '../data/coords'
import { focusItem, goToRoom } from './nav'

// drei <Html> her örnek için ayrı bir React kökü açar; mod değişiminde bunları
// kaldırıp yeniden bağlamak yerine hep bağlı tutup yalnızca görünürlüğü değiştiriyoruz.

// Oda içindeyken o odanın eşyaları için pinler
export function ItemPins() {
  const mode = useStore((s) => s.mode)
  const room = useStore((s) => s.room)
  const itemBoxes = useStore((s) => s.itemBoxes)
  const hovered = useStore((s) => s.hovered)

  const pins = useMemo(
    () =>
      catalog
        .filter((i) => itemBoxes[i.id])
        .map((i) => {
          const b = itemBoxes[i.id]
          const p = i.pin ? toWorld(...i.pin) : b.getCenter(new Vector3()).setY(Math.min(b.max.y + 0.12, 2.3))
          return { item: i, position: p.toArray() }
        }),
    [itemBoxes],
  )

  return pins.map(({ item, position }) => {
    const visible = mode === 'interior' && room != null && zoneOf(item.room) === zoneOf(room)
    return (
      <Html key={item.id} position={position} center zIndexRange={[20, 0]} style={{ pointerEvents: visible ? 'auto' : 'none' }}>
        <button
          className={`pin ${visible ? 'is-visible' : ''} ${hovered === item.id ? 'is-hot' : ''}`}
          tabIndex={visible ? 0 : -1}
          onClick={() => focusItem(item.id)}
          onPointerEnter={() => useStore.getState().setHovered(item.id)}
          onPointerLeave={() => useStore.getState().setHovered(null)}
          aria-label={item.name}
        >
          <span className="pin-dot" />
          <span className="pin-label">{item.name}</span>
        </button>
      </Html>
    )
  })
}

// Genel bakışta oda etiketleri
export function RoomLabels() {
  const mode = useStore((s) => s.mode)
  const labels = useMemo(
    () =>
      rooms.map((r) => {
        const [x0, y0, x1, y1] = r.box
        return { room: r, position: toWorld((x0 + x1) / 2, (y0 + y1) / 2, 30).toArray() }
      }),
    [],
  )
  const visible = mode === 'overview'
  return labels.map(({ room, position }) => (
    <Html key={room.id} position={position} center zIndexRange={[20, 0]} style={{ pointerEvents: visible ? 'auto' : 'none' }}>
      <button className={`room-tag ${visible ? 'is-visible' : ''}`} tabIndex={visible ? 0 : -1} onClick={() => goToRoom(room.id)}>
        {room.name}
      </button>
    </Html>
  ))
}
