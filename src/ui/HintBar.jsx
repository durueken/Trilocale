import { useStore } from '../store'
import { back } from '../three/nav'

const HINTS = {
  overview: [
    ['Sürükle', 'döndür'],
    ['Kaydır', 'imlece yakınlaş, odaya dal'],
    ['Çift tık', 'odaya gir'],
    ['Sağ tık', 'kaydır'],
  ],
  interior: [
    ['Kaydır', 'imlecin yönünde ilerle'],
    ['Sürükle', 'etrafa bak'],
    ['Çift tık', 'oraya git'],
    ['●', 'eşyayı incele'],
  ],
  focus: [
    ['Sürükle', 'eşyanın etrafında dön'],
    ['Kaydır', 'yakınlaş'],
  ],
}

export function HintBar() {
  const mode = useStore((s) => s.mode)
  return (
    <div className="hint-bar">
      {HINTS[mode].map(([k, v]) => (
        <span key={k}>
          <kbd>{k}</kbd> {v}
        </span>
      ))}
      {mode !== 'overview' && (
        <button onClick={back}>
          <kbd>Esc</kbd> {mode === 'focus' ? 'geri' : 'genel bakış'}
        </button>
      )}
    </div>
  )
}
