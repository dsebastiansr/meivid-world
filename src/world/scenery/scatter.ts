import { PLAYER } from '@/config'
import { resolveProp } from '@/data/catalog'
import { seedProps } from '@/data/decorations'
import { seedMemories } from '@/data/memories'
import { NATURE_URL } from '@/data/models'
import type { Memory, PlacedProp } from '@/types'
import type { Placement } from '../models/InstancedModel'
import { beachShift, groundHeight, insideDistance, pathSegmentsFor, pathStrength, type PathSegments } from '../terrain/terrainData'

// ─────────────────────────────────────────────────────────────
// REPARTO AUTOMÁTICO DE ÁRBOLES, ROCAS, FLORES, PASTO…
//
// Cada "tipo" (SPECS) dice qué piezas usar, cuántas poner y en qué zona.
// Se reparten con una semilla fija, así que la isla es SIEMPRE igual
// (mientras no cambies los números). Para otra isla: cambia SEED.
//
// Para modificarlo:
//  · más o menos de algo     → cambia `count`
//  · más variedad            → agrega piezas a `variants` (nombres en public/models/LEEME.md)
//  · zona (centro / orilla)  → `minInside` y `maxInside` (metros hacia adentro de la costa)
//  · tamaño                  → `height` de cada variante y `scale` (variación al azar)
// ─────────────────────────────────────────────────────────────

const SEED = 20240214

interface Variant {
  node: string
  height: number // altura base en metros
  weight?: number // qué tan común es frente a las otras variantes (por defecto 1)
}

interface Spec {
  name: string
  variants: Variant[]
  count: number
  minInside: number // mínimo de metros hacia adentro de la costa
  maxInside: number
  edgeBias: boolean // true = prefiere la zona cercana a la orilla
  scale: [number, number] // variación al azar del tamaño
  radius: number // espacio que ocupa (para que no se encimen)
  castShadow: boolean
  onPaths: boolean // ¿puede salir encima de los caminos de tierra?
  solid?: 'tree' | 'rock' // si tiene colisión
}

const SPECS: Spec[] = [
  {
    name: 'árboles',
    variants: [
      ...['Pine_1', 'Pine_2', 'Pine_3', 'Pine_5'].map((node) => ({ node, height: 5.4, weight: 1.4 })),
      { node: 'Pine_4', height: 7, weight: 0.7 },
      ...['CommonTree_1', 'CommonTree_2', 'CommonTree_5'].map((node) => ({ node, height: 4.6 })),
      ...['CommonTree_3', 'CommonTree_4'].map((node) => ({ node, height: 5.8, weight: 0.8 })),
      ...['TwistedTree_1', 'TwistedTree_2', 'TwistedTree_3'].map((node) => ({ node, height: 5, weight: 0.5 })),
      ...['DeadTree_1', 'DeadTree_2'].map((node) => ({ node, height: 4, weight: 0.3 })),
    ],
    count: 0,
    minInside: 3,
    maxInside: 9.5,
    edgeBias: true,
    scale: [0.85, 1.25],
    radius: 1.7,
    castShadow: true,
    onPaths: false,
    solid: 'tree',
  },
  {
    name: 'rocas',
    variants: [
      { node: 'Rock_Medium_1', height: 0.9 },
      { node: 'Rock_Medium_2', height: 0.8 },
      { node: 'Rock_Medium_3', height: 1 },
    ],
    count: 0,
    minInside: 1.8,
    maxInside: 9,
    edgeBias: true,
    scale: [0.6, 1.5],
    radius: 1.1,
    castShadow: true,
    onPaths: false,
    solid: 'rock',
  },
  {
    name: 'arbustos',
    variants: [
      { node: 'Bush_Common', height: 1.1, weight: 2 },
      { node: 'Bush_Common_Flowers', height: 1.1 },
    ],
    count: 0,
    minInside: 2.8,
    maxInside: 10,
    edgeBias: true,
    scale: [0.8, 1.4],
    radius: 0.9,
    castShadow: true,
    onPaths: false,
  },
  {
    name: 'hongos',
    variants: [
      { node: 'Mushroom_Common', height: 0.3 },
      { node: 'Mushroom_Laetiporus', height: 0.35 },
    ],
    count: 0,
    minInside: 3.5,
    maxInside: 10,
    edgeBias: true,
    scale: [0.8, 1.4],
    radius: 0.5,
    castShadow: false,
    onPaths: false,
  },
  {
    name: 'plantas',
    variants: [
      { node: 'Fern_1', height: 0.7 },
      { node: 'Plant_1', height: 0.8 },
      { node: 'Plant_7', height: 0.8 },
    ],
    count: 0,
    minInside: 2.5,
    maxInside: 12,
    edgeBias: false,
    scale: [0.7, 1.3],
    radius: 0.6,
    castShadow: false,
    onPaths: false,
  },
  {
    name: 'flores',
    variants: [
      { node: 'Flower_3_Group', height: 0.6 },
      { node: 'Flower_3_Single', height: 0.5 },
      { node: 'Flower_4_Group', height: 0.6 },
      { node: 'Flower_4_Single', height: 0.5 },
      { node: 'Clover_1', height: 0.3 },
      { node: 'Clover_2', height: 0.3 },
    ],
    count: 0,
    minInside: 2.6,
    maxInside: 12,
    edgeBias: false,
    scale: [0.7, 1.3],
    radius: 0.35,
    castShadow: false,
    onPaths: false,
  },
  {
    name: 'piedritas',
    variants: [
      ...['Pebble_Round_1', 'Pebble_Round_2', 'Pebble_Round_3'].map((node) => ({ node, height: 0.18 })),
      ...['Pebble_Square_1', 'Pebble_Square_2', 'Pebble_Square_3'].map((node) => ({ node, height: 0.2 })),
    ],
    count: 0,
    minInside: 0.9,
    maxInside: 4,
    edgeBias: false,
    scale: [0.6, 1.6],
    radius: 0.25,
    castShadow: false,
    onPaths: true,
  },
  {
    name: 'pasto',
    variants: [
      { node: 'Grass_Common_Short', height: 0.4 },
      { node: 'Grass_Common_Tall', height: 0.6 },
      { node: 'Grass_Wispy_Short', height: 0.45 },
      { node: 'Grass_Wispy_Tall', height: 0.65 },
    ],
    count: 0,
    minInside: 2.6,
    maxInside: 13,
    edgeBias: false,
    scale: [0.7, 1.3],
    radius: 0,
    castShadow: false,
    onPaths: false,
  },
]

// Número al azar repetible (el mismo SEED da siempre la misma isla)
function createRandom(seed: number) {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

export interface SceneryGroup {
  key: string
  url: string
  node: string
  height: number
  castShadow: boolean
  placements: Placement[]
}

export interface TreeCollider {
  x: number
  y: number
  z: number
  radius: number
  height: number
}

export interface RockCollider {
  x: number
  y: number
  z: number
  rotY: number
  half: [number, number, number]
}

// Lugares donde no debe haber árboles ni plantas: los recuerdos y la decoración
function exclusionsFor(memories: Memory[], props: PlacedProp[]) {
  return [
    ...memories.map((memory) => ({ x: memory.posicion[0], z: memory.posicion[2], radius: 2.2 })),
    ...props.map((prop) => ({ x: prop.x, z: prop.z, radius: resolveProp(prop.kind, prop.variant)?.clearance ?? 1 })),
  ]
}

function generate() {
  const random = createRandom(SEED)
  const groups = new Map<string, SceneryGroup>()
  const treeColliders: TreeCollider[] = []
  const rockColliders: RockCollider[] = []

  // Lugares ocupados: no se pone nada encima. Empieza con lo que ya está fijo.
  const occupied: { x: number; z: number; radius: number }[] = [
    { x: PLAYER.spawn[0], z: PLAYER.spawn[2], radius: 2.5 },
    ...exclusionsFor(seedMemories, seedProps),
  ]

  for (const spec of SPECS) {
    const totalWeight = spec.variants.reduce((sum, variant) => sum + (variant.weight ?? 1), 0)
    let placed = 0

    for (let attempt = 0; attempt < spec.count * 60 && placed < spec.count; attempt++) {
      const x = (random() - 0.5) * 36
      const z = (random() - 0.5) * 36
      // Las zonas se miden desde el pasto, no desde la costa: se mueven solas si cambias BEACH
      const inside = insideDistance(x, z) - beachShift
      if (inside < spec.minInside || inside > spec.maxInside) continue

      // Cerca de la orilla es más probable que salga (bosque en el borde, claro en el centro)
      if (spec.edgeBias && random() > 0.15 + 0.85 * smoothstep(10, 4, inside)) continue
      if (!spec.onPaths && pathStrength(x, z) > 0.02) continue

      const scale = spec.scale[0] + random() * (spec.scale[1] - spec.scale[0])
      const radius = spec.radius * scale
      if (occupied.some((spot) => Math.hypot(x - spot.x, z - spot.z) < spot.radius + radius)) continue

      // Elegir una variante según su peso
      let roll = random() * totalWeight
      const variant = spec.variants.find((candidate) => (roll -= candidate.weight ?? 1) < 0) ?? spec.variants[0]

      const y = groundHeight(x, z)
      const rotY = random() * Math.PI * 2
      const key = `${spec.name}:${variant.node}`
      if (!groups.has(key)) {
        groups.set(key, {
          key,
          url: NATURE_URL,
          node: variant.node,
          height: variant.height,
          castShadow: spec.castShadow,
          placements: [],
        })
      }
      groups.get(key)!.placements.push({ x, y, z, rotY, scale })
      if (spec.radius > 0) occupied.push({ x, z, radius })
      placed++

      if (spec.solid === 'tree') {
        treeColliders.push({ x, y, z, radius: 0.3 * scale, height: 2 * scale })
      } else if (spec.solid === 'rock') {
        const size = variant.height * scale
        rockColliders.push({ x, y, z, rotY, half: [0.6 * size, 0.42 * size, 0.55 * size] })
      }
    }
  }

  return { groups: [...groups.values()], treeColliders, rockColliders }
}

export const scenery = generate()

// Quita de lo repartido lo que quede encima de algo que agregaste con el editor
// (o encima de un camino nuevo). No vuelve a repartir nada: lo demás se queda igual.
export function filterScenery(memories: Memory[], props: PlacedProp[]) {
  const blocked = exclusionsFor(memories, props)
  const segments: PathSegments = pathSegmentsFor(memories)
  const free = (x: number, z: number, radius: number, allowPath: boolean) =>
    !blocked.some((spot) => Math.hypot(x - spot.x, z - spot.z) < spot.radius + radius) &&
    (allowPath || pathStrength(x, z, segments) < 0.02)

  return {
    groups: scenery.groups.map((group) => ({
      ...group,
      // Las piedritas y el pasto pueden quedar sobre caminos; lo demás no
      placements: group.placements.filter((item) =>
        free(item.x, item.z, group.node.startsWith('Pebble') ? 0 : 0.3, group.node.startsWith('Pebble')),
      ),
    })),
    treeColliders: scenery.treeColliders.filter((tree) => free(tree.x, tree.z, 0.3, false)),
    rockColliders: scenery.rockColliders.filter((rock) => free(rock.x, rock.z, 0.3, false)),
  }
}
