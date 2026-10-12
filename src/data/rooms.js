// Oda sınırları ve giriş pozları model koordinatlarında (cm, z yukarı).
// box: [x0, y0, x1, y1] · entry.at: göz noktası [x, y] · entry.look: bakılan nokta [x, y, z]
export const rooms = [
  {
    id: 'salon',
    name: 'Salon',
    zone: 'yasam',
    box: [-8193, -175, -7869, 502],
    entry: { at: [-8090, -120], look: [-8010, 300, 70] },
  },
  {
    id: 'yemek',
    name: 'Yemek Alanı',
    zone: 'yasam',
    box: [-8383, -175, -8193, 100],
    entry: { at: [-8212, 88], look: [-8269, -61, 45] },
  },
  {
    id: 'mutfak',
    name: 'Mutfak',
    zone: 'yasam',
    box: [-8383, 100, -8193, 502],
    entry: { at: [-8330, 110], look: [-8235, 360, 85] },
  },
  {
    id: 'hol',
    name: 'Hol',
    box: [-8583, 40, -8383, 262],
    entry: { at: [-8565, 150], look: [-8100, 150, 100] },
  },
  {
    id: 'banyo',
    name: 'Banyo',
    box: [-8583, -175, -8383, 40],
    entry: { at: [-8430, 20], look: [-8550, -110, 80] },
  },
  {
    id: 'banyo2',
    name: 'İkinci Banyo',
    box: [-8583, 262, -8383, 522],
    entry: { at: [-8505, 300], look: [-8540, 420, 75] },
  },
  {
    id: 'yatak1',
    name: 'Yatak Odası I',
    box: [-8931, -175, -8583, 85],
    entry: { at: [-8630, 50], look: [-8800, -120, 50] },
  },
  {
    id: 'yatak2',
    name: 'Yatak Odası II',
    box: [-8931, 85, -8583, 502],
    entry: { at: [-8700, 200], look: [-8860, 420, 60] },
  },
]

export const roomById = Object.fromEntries(rooms.map((r) => [r.id, r]))

// Aynı bölgedeki (açık plan) odaların eşya pinleri birlikte gösterilir
export const zoneOf = (id) => roomById[id]?.zone ?? id

export function roomAt(x, y) {
  return rooms.find((r) => x >= r.box[0] && x <= r.box[2] && y >= r.box[1] && y <= r.box[3])?.id ?? null
}

// Genel bakış (bebek evi) kamera pozu, dünya koordinatlarında metre
export const OVERVIEW = { position: [3.2, 11.5, 8.6], target: [0, 0, 0.2] }
