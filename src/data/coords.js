import { Vector3 } from 'three'

// Model koordinatları: Sketchfab/3ds kaynağındaki santimetre değerleri, Z yukarı.
// Dünya koordinatları: metre, Y yukarı, daire planı orijinde ortalanmış.
export const CX = -8390
export const CY = 173
export const S = 0.01
export const CEILING_CM = 245
export const EYE_CM = 160

export const MODEL_POSITION = [-CX * S, 0, CY * S]

export const toWorld = (x, y, z = 0, out = new Vector3()) => out.set((x - CX) * S, z * S, -(y - CY) * S)

export const toModel = (v) => ({ x: v.x / S + CX, y: -v.z / S + CY, z: v.y / S })

// Model düzlemindeki bir yön (dx, dy) -> dünya yönü
export const dirToWorld = (dx, dy, dz = 0, out = new Vector3()) => out.set(dx, dz, -dy)
