import { useStore } from '../store'
import { catalog, itemById } from '../data/catalog'
import { roomById } from '../data/rooms'
import { exitFocus, focusItem } from '../three/nav'

export function ItemPanel() {
  const focused = useStore((s) => s.focused)
  const dims = useStore((s) => s.itemDims)
  const item = focused ? itemById[focused] : null
  if (!item) return <aside className="item-panel" aria-hidden />

  const siblings = catalog.filter((i) => i.room === item.room)
  const idx = siblings.findIndex((i) => i.id === item.id)
  const go = (d) => focusItem(siblings[(idx + d + siblings.length) % siblings.length].id)
  const dim = dims[item.id]

  return (
    <aside className="item-panel is-open" aria-label={item.name}>
      <button className="close" onClick={exitFocus} aria-label="Kapat">×</button>
      <p className="eyebrow">
        {roomById[item.room]?.name} · {item.category}
      </p>
      <h2>{item.name}</h2>
      <p className="desc">{item.description}</p>

      {item.materials?.length > 0 && (
        <>
          <h3>Malzeme &amp; Doku</h3>
          <ul className="chips">
            {item.materials.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </>
      )}

      {dim && (
        <>
          <h3>Yaklaşık ölçüler</h3>
          <dl className="dims">
            <div><dt>Genişlik</dt><dd>{dim.w} cm</dd></div>
            <div><dt>Derinlik</dt><dd>{dim.d} cm</dd></div>
            <div><dt>Yükseklik</dt><dd>{dim.h} cm</dd></div>
          </dl>
        </>
      )}

      {siblings.length > 1 && (
        <div className="panel-nav">
          <button onClick={() => go(-1)}>← Önceki</button>
          <span>{idx + 1} / {siblings.length}</span>
          <button onClick={() => go(1)}>Sonraki →</button>
        </div>
      )}
    </aside>
  )
}
