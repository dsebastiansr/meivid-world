import { create } from 'zustand'

// Estado compartido entre el mundo 3D y la interfaz (botones, modal).
interface GameState {
  nearbyMemoryId: string | null // recuerdo al que estás cerca
  openMemoryId: string | null // recuerdo que se está mostrando en el modal
  setNearbyMemory: (id: string | null) => void
  openMemory: (id: string) => void
  closeMemory: () => void
}

export const useGameStore = create<GameState>((set) => ({
  nearbyMemoryId: null,
  openMemoryId: null,
  setNearbyMemory: (id) => set({ nearbyMemoryId: id }),
  openMemory: (id) => set({ openMemoryId: id }),
  closeMemory: () => set({ openMemoryId: null }),
}))
