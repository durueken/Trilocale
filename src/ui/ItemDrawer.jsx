import { useStore } from '../store'
import { catalog } from '../data/catalog'
import { rooms } from '../data/rooms'
import { focusItem } from '../three/nav'

export function ItemDrawer() {
  const open = useStore((s) => s.drawerOpen)
  const toggle = useStore((s) => s.toggleDrawer)
  const focused = useStore((s) => s.focused)

  return (
    <>
      <button className="drawer-toggle" onClick={() => toggle()} aria-expanded={open}>
        Eşyalar <span>{catalog.length}</span>
      </button>
      <div className={`drawer ${open ? 'is-open' : ''}`}>
        {rooms.map((r) => {
          const items = catalog.filter((i) => i.room === r.id)
          if (!items.length) return null
          return (
            <section key={r.id}>
              <h3>{r.name}</h3>
              <ul>
                {items.map((i) => (
                  <li key={i.id}>
                    <button
                      className={focused === i.id ? 'is-active' : ''}
                      onClick={() => {
                        toggle(false)
                        focusItem(i.id)
                      }}
                    >
                      <span>{i.name}</span>
                      <small>{i.category}</small>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>
    </>
  )
}
