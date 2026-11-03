import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { seedMemories } from '@/data/memories'
import { seedProps } from '@/data/decorations'
import type { Memory, PlacedProp } from '@/types'

// ─────────────────────────────────────────────────────────────
// EL MUNDO: los recuerdos y la decoración que hay en la isla.
//
// Empieza con los datos de fábrica (memories.json y decorations.ts) y lo que
// cambies desde el modo editar se guarda en el navegador (localStorage), así
// que sobrevive al recargar. En la Fase 4 este guardado se cambia por Supabase:
// solo hay que tocar este archivo.
// ─────────────────────────────────────────────────────────────

interface WorldState {
  memories: Memory[]
  props: PlacedProp[]
  saveError: boolean // true si el navegador no pudo guardar (por ejemplo, fotos muy pesadas)

  addMemory: (memory: Memory) => void
  updateMemory: (id: string, changes: Partial<Memory>) => void
  removeMemory: (id: string) => void
  addProp: (prop: PlacedProp) => void
  updateProp: (id: string, changes: Partial<PlacedProp>) => void
  removeProp: (id: string) => void
  exportData: () => string
  importData: (json: string) => boolean
  resetWorld: () => void
}

// Guardado "a prueba de fallos": si el navegador está lleno o bloqueado, el juego sigue funcionando
const safeStorage = {
  getItem: (name: string) => {
    try {
      return localStorage.getItem(name)
    } catch {
      return null
    }
  },
  setItem: (name: string, value: string) => {
    try {
      localStorage.setItem(name, value)
      if (useWorldStore.getState().saveError) useWorldStore.setState({ saveError: false })
    } catch {
      useWorldStore.setState({ saveError: true })
    }
  },
  removeItem: (name: string) => {
    try {
      localStorage.removeItem(name)
    } catch {
      /* nada que hacer */
    }
  },
}

export const useWorldStore = create<WorldState>()(
  persist(
    (set, get) => ({
      memories: seedMemories,
      props: seedProps,
      saveError: false,

      addMemory: (memory) => set((state) => ({ memories: [...state.memories, memory] })),
      updateMemory: (id, changes) =>
        set((state) => ({ memories: state.memories.map((m) => (m.id === id ? { ...m, ...changes } : m)) })),
      removeMemory: (id) => set((state) => ({ memories: state.memories.filter((m) => m.id !== id) })),

      addProp: (prop) => set((state) => ({ props: [...state.props, prop] })),
      updateProp: (id, changes) =>
        set((state) => ({ props: state.props.map((p) => (p.id === id ? { ...p, ...changes } : p)) })),
      removeProp: (id) => set((state) => ({ props: state.props.filter((p) => p.id !== id) })),

      exportData: () => JSON.stringify({ memories: get().memories, props: get().props }, null, 2),
      importData: (json) => {
        try {
          const data = JSON.parse(json)
          if (!Array.isArray(data.memories) || !Array.isArray(data.props)) return false
          set({ memories: data.memories, props: data.props })
          return true
        } catch {
          return false
        }
      },
      resetWorld: () => set({ memories: seedMemories, props: seedProps }),
    }),
    {
      name: 'mei-david-world:v1',
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({ memories: state.memories, props: state.props }),
    },
  ),
)

// Un id corto y único para cosas nuevas
export const newId = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`
