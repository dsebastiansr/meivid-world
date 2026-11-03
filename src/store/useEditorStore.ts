import { create } from 'zustand'
import { BEACH, ISLAND } from '@/config'
import { findFamily, resolveProp } from '@/data/catalog'
import { playerPosition } from '@/player/playerPosition'
import type { Memory, MemoryType, PlacedProp } from '@/types'
import { groundHeight } from '@/world/terrain/terrainData'
import { newId, useWorldStore } from './useWorldStore'

// ─────────────────────────────────────────────────────────────
// ESTADO DEL MODO EDITAR (temporal: no se guarda).
// Lo que sí queda guardado vive en useWorldStore.
//
// Cómo funciona la colocación: eliges una pieza en la paleta y esa "herramienta" se queda
// activa: cada clic coloca una (y arrastrando se colocan varias seguidas) hasta que
// pulses Esc o "Terminar". Así no hay que elegir y confirmar cada vez.
// ─────────────────────────────────────────────────────────────

export type Target = { type: 'memory' | 'prop'; id: string }

// Lo que se está colocando. `kind` es un tipo de recuerdo (banca, buzón…) o una clave del catálogo.
export interface Placing {
  category: 'memory' | 'prop'
  kind: string
  variant?: string // solo decoración: cuál variante de la familia (normal, grande, retorcido…)
  movingId?: string // si es un objeto que ya existía y lo estás moviendo (se coloca una sola vez)
}

export interface Ghost {
  x: number
  z: number
  rotation: number // grados
}

// Formulario de recuerdo: `isNew` = todavía no existe en la isla
export interface MemoryFormState {
  memory: Memory
  isNew: boolean
}

// Una "foto" del mundo para poder deshacer
interface Snapshot {
  memories: Memory[]
  props: PlacedProp[]
}

const UNDO_LIMIT = 40

interface EditorState {
  active: boolean
  placing: Placing | null
  ghost: Ghost
  selected: Target | null
  form: MemoryFormState | null
  undoStack: Snapshot[]
  tab: string // pestaña de la paleta que se está viendo
  lastVariants: Record<string, string> // la última variante que usaste de cada familia

  setActive: (active: boolean) => void
  setTab: (tab: string) => void
  startPlacing: (placing: Placing, ghost?: Partial<Ghost>) => void
  setPlacingVariant: (variant: string) => void
  setSelectedVariant: (variant: string) => void
  moveGhost: (x: number, z: number) => void
  rotateGhost: (degrees: number) => void
  cancelPlacing: () => void
  commitPlacing: (silent?: boolean) => boolean // devuelve si realmente se colocó algo
  select: (target: Target | null) => void
  moveSelected: () => void
  duplicateSelected: () => void
  rotateSelected: (degrees: number) => void
  deleteSelected: () => void
  editSelectedMemory: () => void
  closeForm: () => void
  saveForm: (memory: Memory) => void
  deleteFormMemory: () => void
  pushUndo: (snapshot?: Snapshot) => void
  undo: () => void
}

// ¿Se puede poner algo aquí? No en el agua ni pegado a la orilla (ver BEACH.placeLimit en config.ts)
export const isValidSpot = (x: number, z: number) => groundHeight(x, z) > ISLAND.waterLevel + BEACH.placeLimit

const today = () => new Date().toISOString().slice(0, 10)

// Qué tan separadas quedan las piezas al arrastrar para pintar varias (metros)
export function brushSpacing(placing: Placing) {
  const item = placing.category === 'prop' ? resolveProp(placing.kind, placing.variant) : null
  return item?.spacing ?? Math.max(0.6, (item?.clearance ?? 1) * 1.2)
}

export const useEditorStore = create<EditorState>((set, get) => ({
  active: false,
  placing: null,
  ghost: { x: 0, z: 0, rotation: 0 },
  selected: null,
  form: null,
  undoStack: [],
  tab: 'recuerdos',
  lastVariants: {},

  setActive: (active) => set({ active, placing: null, selected: null, form: null, undoStack: [] }),
  setTab: (tab) => set({ tab }),

  // Si ya estabas colocando, la vista previa se queda donde estaba al cambiar de pieza.
  // Si no, aparece unos pasos delante del personaje (la cámara mira hacia -z).
  startPlacing: (placing, ghost) =>
    set((state) => {
      const keep = state.placing && !state.placing.movingId && !placing.movingId
      const base = keep ? state.ghost : { x: playerPosition.x, z: playerPosition.z - 3, rotation: 0 }
      // Una familia se abre con la última variante que usaste (si no, la primera)
      const variant = placing.category === 'prop' ? (placing.variant ?? state.lastVariants[placing.kind]) : undefined
      // La paleta salta a la pestaña de lo que vas a colocar
      const tab = placing.category === 'memory' ? 'recuerdos' : (findFamily(placing.kind)?.category ?? state.tab)
      return { placing: { ...placing, variant }, tab, selected: null, ghost: { ...base, ...ghost } }
    }),

  // Cambiar de variante sin soltar la herramienta (Árbol: normal → retorcido)
  setPlacingVariant: (variant) =>
    set((state) =>
      state.placing
        ? { placing: { ...state.placing, variant }, lastVariants: { ...state.lastVariants, [state.placing.kind]: variant } }
        : {},
    ),
  moveGhost: (x, z) => set((state) => ({ ghost: { ...state.ghost, x, z } })),
  rotateGhost: (degrees) => set((state) => ({ ghost: { ...state.ghost, rotation: state.ghost.rotation + degrees } })),
  cancelPlacing: () => set({ placing: null }),

  // `silent` = no guardar un punto para deshacer (lo usa el pincel: todo un trazo se deshace de una vez)
  commitPlacing: (silent = false) => {
    const { placing, ghost, form } = get()
    if (!placing || form || !isValidSpot(ghost.x, ghost.z)) return false
    const world = useWorldStore.getState()

    // Mover algo que ya existía: se hace una vez y termina
    if (placing.movingId) {
      if (!silent) get().pushUndo()
      if (placing.category === 'memory') {
        world.updateMemory(placing.movingId, { posicion: [ghost.x, 0, ghost.z], rotacion: ghost.rotation })
      } else {
        world.updateProp(placing.movingId, { x: ghost.x, z: ghost.z, rotation: ghost.rotation })
      }
      set({ placing: null, selected: { type: placing.category, id: placing.movingId } })
      return true
    }

    // Decoración nueva: se agrega y la herramienta SIGUE activa para poner otra
    if (placing.category === 'prop') {
      // Evita dos piezas iguales una encima de otra (un doble clic sin querer)
      const duplicated = world.props.some(
        (prop) => prop.kind === placing.kind && prop.variant === placing.variant && Math.hypot(prop.x - ghost.x, prop.z - ghost.z) < 0.25,
      )
      if (duplicated) return false
      if (!silent) get().pushUndo()
      world.addProp({ id: newId('prop'), kind: placing.kind, variant: placing.variant, x: ghost.x, z: ghost.z, rotation: ghost.rotation })
      return true
    }

    // Recuerdo nuevo: antes de guardarlo hay que escribirlo (título, foto…).
    // La herramienta también sigue activa para poner otro después.
    const memory: Memory = {
      id: newId('mem'),
      titulo: '',
      fecha: today(),
      texto: '',
      foto: '',
      fotos: [],
      posicion: [ghost.x, 0, ghost.z],
      rotacion: ghost.rotation,
      tipo: placing.kind as MemoryType,
    }
    set({ form: { memory, isNew: true } })
    return true
  },

  select: (selected) => set({ selected }),

  moveSelected: () => {
    const { selected } = get()
    if (!selected) return
    const world = useWorldStore.getState()
    if (selected.type === 'memory') {
      const memory = world.memories.find((m) => m.id === selected.id)
      if (!memory) return
      get().startPlacing(
        { category: 'memory', kind: memory.tipo, movingId: memory.id },
        { x: memory.posicion[0], z: memory.posicion[2], rotation: memory.rotacion ?? 0 },
      )
    } else {
      const prop = world.props.find((p) => p.id === selected.id)
      if (!prop) return
      get().startPlacing(
        { category: 'prop', kind: prop.kind, variant: prop.variant, movingId: prop.id },
        { x: prop.x, z: prop.z, rotation: prop.rotation },
      )
    }
    set({ selected }) // startPlacing la limpia; la dejamos para saber qué se está moviendo
  },

  // Poner otra igual: activa la herramienta con la misma pieza y el mismo giro
  duplicateSelected: () => {
    const { selected } = get()
    if (!selected) return
    const world = useWorldStore.getState()
    if (selected.type === 'memory') {
      const memory = world.memories.find((m) => m.id === selected.id)
      if (memory) get().startPlacing({ category: 'memory', kind: memory.tipo }, { rotation: memory.rotacion ?? 0 })
    } else {
      const prop = world.props.find((p) => p.id === selected.id)
      if (prop) get().startPlacing({ category: 'prop', kind: prop.kind, variant: prop.variant }, { rotation: prop.rotation })
    }
  },

  rotateSelected: (degrees) => {
    const { selected } = get()
    if (!selected) return
    get().pushUndo()
    const world = useWorldStore.getState()
    if (selected.type === 'memory') {
      const memory = world.memories.find((m) => m.id === selected.id)
      if (memory) world.updateMemory(memory.id, { rotacion: (memory.rotacion ?? 0) + degrees })
    } else {
      const prop = world.props.find((p) => p.id === selected.id)
      if (prop) world.updateProp(prop.id, { rotation: prop.rotation + degrees })
    }
  },

  // Cambiar la variante de algo que ya está colocado (un árbol normal → uno retorcido)
  setSelectedVariant: (variant) => {
    const { selected } = get()
    if (selected?.type !== 'prop') return
    get().pushUndo()
    const prop = useWorldStore.getState().props.find((p) => p.id === selected.id)
    useWorldStore.getState().updateProp(selected.id, { variant })
    if (prop) set((state) => ({ lastVariants: { ...state.lastVariants, [prop.kind]: variant } }))
  },

  deleteSelected: () => {
    const { selected } = get()
    if (!selected) return
    get().pushUndo()
    const world = useWorldStore.getState()
    if (selected.type === 'memory') world.removeMemory(selected.id)
    else world.removeProp(selected.id)
    set({ selected: null })
  },

  editSelectedMemory: () => {
    const { selected } = get()
    if (selected?.type !== 'memory') return
    const memory = useWorldStore.getState().memories.find((m) => m.id === selected.id)
    if (memory) set({ form: { memory, isNew: false } })
  },

  closeForm: () => set({ form: null }),

  saveForm: (memory) => {
    const { form, placing } = get()
    if (!form) return
    get().pushUndo()
    const world = useWorldStore.getState()
    if (form.isNew) world.addMemory(memory)
    else world.updateMemory(memory.id, memory)
    // Si seguías colocando, no seleccionamos nada para poder poner el siguiente
    set({ form: null, selected: placing ? null : { type: 'memory', id: memory.id } })
  },

  deleteFormMemory: () => {
    const { form } = get()
    if (form && !form.isNew) {
      get().pushUndo()
      useWorldStore.getState().removeMemory(form.memory.id)
    }
    set({ form: null, selected: null })
  },

  // Guarda cómo está el mundo ahora (o el `snapshot` que le pases), para poder volver con deshacer
  pushUndo: (snapshot) => {
    const { memories, props } = useWorldStore.getState()
    const saved = snapshot ?? { memories, props }
    set((state) => ({ undoStack: [...state.undoStack.slice(-(UNDO_LIMIT - 1)), saved] }))
  },

  undo: () => {
    const { undoStack } = get()
    const last = undoStack[undoStack.length - 1]
    if (!last) return
    useWorldStore.setState({ memories: last.memories, props: last.props })
    set({ undoStack: undoStack.slice(0, -1), selected: null })
  },
}))

// Nombre bonito de lo que se está colocando o seleccionando (para el panel)
export function labelFor(category: 'memory' | 'prop', kind: string, variant?: string) {
  if (category === 'prop') return resolveProp(kind, variant)?.label ?? kind
  return (
    { banca: 'Banca', buzon: 'Buzón', foto: 'Foto', flor: 'Flor', calabaza: 'Calabaza', calabaza2: 'Calabaza 2', sillas: 'Sillas de playa', tocadiscos: 'Tocadiscos', radio: 'Radio' }[
      kind as MemoryType
    ] ?? kind
  )
}
