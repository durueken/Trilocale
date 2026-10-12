import { create } from 'zustand'

export const useStore = create((set) => ({
  ready: false,
  // 'overview' | 'interior' | 'focus'
  mode: 'overview',
  room: null,
  focused: null,
  hovered: null,
  drawerOpen: false,
  // Katalog eşyalarının mesh'leri ve hesaplanan ölçüleri (Apartment yüklenince dolar)
  itemMeshes: {},
  itemBoxes: {},
  itemDims: {},
  debugPoint: null,

  set,
  setHovered: (hovered) => set((s) => (s.hovered === hovered ? s : { hovered })),
  setRoom: (room) => set((s) => (s.room === room ? s : { room })),
  toggleDrawer: (open) => set((s) => ({ drawerOpen: open ?? !s.drawerOpen })),
}))
