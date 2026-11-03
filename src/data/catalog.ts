import { NATURE_URL, PROPS_URL, PUMPKIN_1_URL, PUMPKIN_2_URL } from './models'

// ─────────────────────────────────────────────────────────────
// CATÁLOGO DE DECORACIÓN: todo lo que se puede colocar con el editor.
//
// Está organizado en FAMILIAS (Árbol, Pino, Cerca…) y cada familia tiene VARIANTES
// (Árbol: normal, grande, retorcido, seco…). En el editor eliges la familia y luego la variante.
//
// Para agregar una variante: una línea más en `variants` de su familia.
// Para agregar una familia: otra entrada con `family({...})`. Las piezas disponibles están
// en public/models/LEEME.md.
//
// Cada familia:
//  key / label / emoji  → identificador, nombre y icono de la paleta
//  category             → en qué pestaña aparece
//  url                  → naturaleza.glb o props.glb
//  clearance            → radio donde se quitan árboles y plantas repartidos solos
//  spacing              → al pintar arrastrando, cada cuántos metros se pone una
//                         (por defecto, según `clearance`)
//  collider             → caja con la que chocas: [ancho, alto, fondo] en metros (sin él, se atraviesa)
//  fire                 → true = lleva luz de fuego
//
// Cada variante:
//  key / label  → identificador y nombre
//  node         → la pieza dentro del GLB
//  url          → (opcional) otro archivo GLB, si esta variante no está en el de la familia
//  height       → altura en metros
//  (y puede cambiar clearance, spacing o collider de la familia; collider: null = sin colisión)
// ─────────────────────────────────────────────────────────────

export type CategoryKey = 'naturaleza' | 'campamento' | 'construcciones'

export interface CatalogVariant {
  key: string
  label: string
  node: string
  url?: string // otro archivo GLB para esta variante (por defecto, el de la familia)
  height: number
  clearance?: number
  spacing?: number
  collider?: [number, number, number] | null
}

export interface CatalogFamily {
  key: string
  label: string
  emoji: string
  category: CategoryKey
  url: string
  clearance: number
  spacing?: number
  collider?: [number, number, number]
  fire?: boolean
  variants: CatalogVariant[]
}

export const categories: { key: CategoryKey; label: string; emoji: string }[] = [
  { key: 'naturaleza', label: 'Naturaleza', emoji: '🌳' },
  { key: 'campamento', label: 'Campamento', emoji: '⛺' },
  { key: 'construcciones', label: 'Construcciones', emoji: '🚧' },
]

const nature = (family: Omit<CatalogFamily, 'url'>): CatalogFamily => ({ ...family, url: NATURE_URL })
const props = (family: Omit<CatalogFamily, 'url'>): CatalogFamily => ({ ...family, url: PROPS_URL })

const TREE_COLLIDER: [number, number, number] = [0.6, 2, 0.6]

export const catalog: CatalogFamily[] = [
  // ── Naturaleza ──
  nature({
    key: 'arbol', label: 'Árbol', emoji: '🌳', category: 'naturaleza', clearance: 1.7, collider: TREE_COLLIDER,
    variants: [
      { key: 'normal', label: 'Normal', node: 'CommonTree_1', height: 4.6 },
      { key: 'frondoso', label: 'Frondoso', node: 'CommonTree_2', height: 4.8 },
      { key: 'grande', label: 'Grande', node: 'CommonTree_3', height: 5.8 },
      { key: 'alto', label: 'Alto', node: 'CommonTree_4', height: 6.4 },
      { key: 'pequeno', label: 'Pequeño', node: 'CommonTree_5', height: 3.4 },
      { key: 'retorcido', label: 'Retorcido', node: 'TwistedTree_1', height: 5 },
      { key: 'retorcido-2', label: 'Retorcido 2', node: 'TwistedTree_2', height: 5 },
      { key: 'seco', label: 'Seco', node: 'DeadTree_1', height: 4 },
      { key: 'seco-2', label: 'Seco 2', node: 'DeadTree_2', height: 4.4 },
    ],
  }),
  nature({
    key: 'pino', label: 'Pino', emoji: '🌲', category: 'naturaleza', clearance: 1.7, collider: TREE_COLLIDER,
    variants: [
      { key: 'normal', label: 'Normal', node: 'Pine_1', height: 5.4 },
      { key: 'ancho', label: 'Ancho', node: 'Pine_2', height: 5 },
      { key: 'delgado', label: 'Delgado', node: 'Pine_3', height: 5.4 },
      { key: 'alto', label: 'Alto', node: 'Pine_4', height: 7 },
      { key: 'pequeno', label: 'Pequeño', node: 'Pine_5', height: 3.6 },
    ],
  }),
  nature({
    key: 'arbusto', label: 'Arbusto', emoji: '🌿', category: 'naturaleza', clearance: 0.9,
    variants: [
      { key: 'normal', label: 'Normal', node: 'Bush_Common', height: 1.1 },
      { key: 'flores', label: 'Con flores', node: 'Bush_Common_Flowers', height: 1.1 },
    ],
  }),
  nature({
    key: 'flores', label: 'Flores', emoji: '🌸', category: 'naturaleza', clearance: 0.5,
    variants: [
      { key: 'ramo-1', label: 'Ramo', node: 'Flower_3_Group', height: 0.6 },
      { key: 'ramo-2', label: 'Ramo 2', node: 'Flower_4_Group', height: 0.6 },
      { key: 'flor-1', label: 'Una flor', node: 'Flower_3_Single', height: 0.5 },
      { key: 'flor-2', label: 'Una flor 2', node: 'Flower_4_Single', height: 0.5 },
      { key: 'trebol', label: 'Trébol', node: 'Clover_1', height: 0.3 },
      { key: 'trebol-2', label: 'Trébol 2', node: 'Clover_2', height: 0.3 },
    ],
  }),
  nature({
    key: 'plantas', label: 'Plantas', emoji: '🌱', category: 'naturaleza', clearance: 0.6,
    variants: [
      { key: 'helecho', label: 'Helecho', node: 'Fern_1', height: 0.7 },
      { key: 'planta', label: 'Planta', node: 'Plant_1', height: 0.8 },
      { key: 'planta-2', label: 'Planta 2', node: 'Plant_7', height: 0.8 },
      { key: 'pasto-corto', label: 'Pasto corto', node: 'Grass_Common_Short', height: 0.4, clearance: 0.4 },
      { key: 'pasto-alto', label: 'Pasto alto', node: 'Grass_Common_Tall', height: 0.6, clearance: 0.4 },
      { key: 'pasto-fino', label: 'Pasto fino', node: 'Grass_Wispy_Short', height: 0.45, clearance: 0.4 },
      { key: 'pasto-fino-alto', label: 'Pasto fino alto', node: 'Grass_Wispy_Tall', height: 0.65, clearance: 0.4 },
    ],
  }),
  nature({
    key: 'hongos', label: 'Hongos', emoji: '🍄', category: 'naturaleza', clearance: 0.5,
    variants: [
      { key: 'comun', label: 'Común', node: 'Mushroom_Common', height: 0.3 },
      { key: 'naranja', label: 'Naranja', node: 'Mushroom_Laetiporus', height: 0.35 },
    ],
  }),
  nature({
    key: 'roca', label: 'Roca', emoji: '🪨', category: 'naturaleza', clearance: 1.1, collider: [1.3, 0.8, 1.2],
    variants: [
      { key: 'mediana', label: 'Mediana', node: 'Rock_Medium_1', height: 0.9 },
      { key: 'redonda', label: 'Redonda', node: 'Rock_Medium_2', height: 0.8, collider: [1.2, 0.75, 1.1] },
      { key: 'grande', label: 'Grande', node: 'Rock_Medium_3', height: 1.5, clearance: 1.5, collider: [2.1, 1.3, 1.9] },
      { key: 'pequena', label: 'Pequeña', node: 'Rock_Medium_1', height: 0.45, clearance: 0.7, collider: [0.65, 0.4, 0.6] },
    ],
  }),
  nature({
    key: 'piedritas', label: 'Piedritas', emoji: '⚪', category: 'naturaleza', clearance: 0.25, spacing: 0.5,
    variants: [
      { key: 'redonda-1', label: 'Redonda', node: 'Pebble_Round_1', height: 0.18 },
      { key: 'redonda-2', label: 'Redonda 2', node: 'Pebble_Round_2', height: 0.18 },
      { key: 'redonda-3', label: 'Redonda 3', node: 'Pebble_Round_3', height: 0.18 },
      { key: 'cuadrada-1', label: 'Cuadrada', node: 'Pebble_Square_1', height: 0.2 },
      { key: 'cuadrada-2', label: 'Cuadrada 2', node: 'Pebble_Square_2', height: 0.2 },
      { key: 'cuadrada-3', label: 'Cuadrada 3', node: 'Pebble_Square_3', height: 0.2 },
    ],
  }),

  // Calabazas: cada una es su propio archivo en public/models/ (la pieza dentro se llama "Pumpkin")
  {
    key: 'calabaza', label: 'Calabaza', emoji: '🎃', category: 'naturaleza', url: PUMPKIN_1_URL, clearance: 0.6, spacing: 0.8,
    variants: [
      { key: 'chica', label: 'Calabaza 1', node: 'Pumpkin', height: 0.45 },
      { key: 'grande', label: 'Calabaza 1 grande', node: 'Pumpkin', height: 0.9, clearance: 0.9, collider: [0.9, 0.9, 0.9] },
      { key: 'lisa', label: 'Calabaza 2', node: 'Pumpkin', url: PUMPKIN_2_URL, height: 0.6 },
      { key: 'lisa-grande', label: 'Calabaza 2 grande', node: 'Pumpkin', url: PUMPKIN_2_URL, height: 1.1, clearance: 1.2, collider: [1.8, 1.1, 1.8] },
    ],
  },

  // ── Campamento ──
  props({
    key: 'fogata', label: 'Fogata', emoji: '🔥', category: 'campamento', clearance: 2.2, collider: [0.9, 0.5, 0.9], fire: true,
    variants: [
      { key: 'troncos', label: 'Con troncos', node: 'campfire_logs', height: 0.5 },
      { key: 'piedras', label: 'Con piedras', node: 'campfire_stones', height: 0.5 },
    ],
  }),
  props({
    key: 'tienda', label: 'Tienda', emoji: '⛺', category: 'campamento', clearance: 2.2,
    variants: [
      { key: 'grande', label: 'Grande', node: 'tent_detailedOpen', height: 1.7, collider: [1.9, 1.7, 1.4] },
      { key: 'chica', label: 'Chica', node: 'tent_smallClosed', height: 1.3, clearance: 1.8, collider: [1.3, 1.3, 1.1] },
    ],
  }),
  props({
    key: 'madera', label: 'Troncos', emoji: '🪵', category: 'campamento', clearance: 1.2,
    variants: [
      { key: 'pila', label: 'Pila', node: 'log_stack', height: 0.8, clearance: 1.4, collider: [1.2, 0.8, 0.9] },
      { key: 'tronco-grande', label: 'Tronco grande', node: 'log_large', height: 0.6, clearance: 1.4, collider: [2, 0.6, 0.7] },
      { key: 'tronco', label: 'Tronco', node: 'log', height: 0.35, clearance: 0.9, collider: [0.5, 0.35, 1.45] },
      { key: 'tocon-redondo', label: 'Tocón', node: 'stump_round', height: 0.5, clearance: 0.8 },
      { key: 'tocon-viejo', label: 'Tocón viejo', node: 'stump_old', height: 0.55, clearance: 0.8 },
    ],
  }),

  // ── Construcciones ──
  props({
    key: 'cerca', label: 'Cerca', emoji: '🚧', category: 'construcciones', clearance: 1.4, spacing: 2.2, collider: [2.2, 0.8, 0.25],
    variants: [
      { key: 'simple', label: 'Simple', node: 'fence_simple', height: 0.75 },
      { key: 'tablones', label: 'Tablones', node: 'fence_planks', height: 0.75 },
      { key: 'puerta', label: 'Puerta', node: 'fence_gate', height: 0.75 },
      { key: 'diagonal', label: 'Diagonal', node: 'fence_simpleDiagonal', height: 0.75, collider: null },
    ],
  }),
  props({
    key: 'cartel', label: 'Cartel', emoji: '🪧', category: 'construcciones', clearance: 1,
    variants: [{ key: 'normal', label: 'Normal', node: 'sign', height: 1.2 }],
  }),
  props({
    key: 'canoa', label: 'Canoa', emoji: '🛶', category: 'construcciones', clearance: 1.4, collider: [0.9, 0.5, 3.4],
    variants: [{ key: 'normal', label: 'Normal', node: 'canoe', height: 0.55 }],
  }),
  props({
    key: 'torii', label: 'Torii', emoji: '⛩️', category: 'construcciones', clearance: 3,
    variants: [{ key: 'normal', label: 'Normal', node: 'Environment_ToriiGate', height: 3.4 }],
  }),
  props({
    key: 'obelisco', label: 'Obelisco', emoji: '🗿', category: 'construcciones', clearance: 1.2, collider: [0.5, 1.6, 0.5],
    variants: [{ key: 'normal', label: 'Normal', node: 'statue_obelisk', height: 1.6 }],
  }),
]

const familyByKey = new Map(catalog.map((family) => [family.key, family]))

// Las piezas que ya habías guardado con las claves de antes (cuando no había variantes)
// siguen funcionando: cada clave vieja apunta a su familia y variante.
const legacy: Record<string, [family: string, variant: string]> = {
  'tienda-chica': ['tienda', 'chica'],
  puerta: ['cerca', 'puerta'],
  troncos: ['madera', 'pila'],
  tronco: ['madera', 'tronco-grande'],
  tocon: ['madera', 'tocon-redondo'],
  'tocon-viejo': ['madera', 'tocon-viejo'],
  'pino-alto': ['pino', 'alto'],
  'arbol-grande': ['arbol', 'grande'],
  'arbol-retorcido': ['arbol', 'retorcido'],
  'arbol-seco': ['arbol', 'seco'],
  'arbusto-flores': ['arbusto', 'flores'],
  'flores-rosas': ['flores', 'ramo-2'],
  'roca-grande': ['roca', 'grande'],
  helecho: ['plantas', 'helecho'],
}

export function findFamily(kind: string) {
  return familyByKey.get(kind) ?? familyByKey.get(legacy[kind]?.[0] ?? '')
}

// Todo lo que hace falta saber de una pieza ya elegida (familia + variante), con los ajustes de la variante aplicados
export interface ResolvedProp {
  family: CatalogFamily
  variant: CatalogVariant
  label: string // "Árbol · Retorcido"
  url: string
  node: string
  height: number
  clearance: number
  spacing?: number
  collider?: [number, number, number]
  fire?: boolean
}

export function resolveProp(kind: string, variantKey?: string): ResolvedProp | null {
  const family = findFamily(kind)
  if (!family) return null
  const wanted = variantKey ?? legacy[kind]?.[1]
  const variant = family.variants.find((v) => v.key === wanted) ?? family.variants[0]
  return {
    family,
    variant,
    label: family.variants.length > 1 ? `${family.label} · ${variant.label}` : family.label,
    url: variant.url ?? family.url,
    node: variant.node,
    height: variant.height,
    clearance: variant.clearance ?? family.clearance,
    spacing: variant.spacing ?? family.spacing,
    collider: variant.collider === null ? undefined : (variant.collider ?? family.collider),
    fire: family.fire,
  }
}
