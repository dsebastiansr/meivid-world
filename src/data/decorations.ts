import type { PlacedProp } from '@/types'
import { coastPoint } from '@/world/terrain/terrainData'
import propsJson from './props.json'

// ─────────────────────────────────────────────────────────────
// DECORACIÓN DE FÁBRICA: lo que trae la isla al empezar.
//
// Viene de props.json, que es lo que exporta el editor (Editar → ⋯ → Exportar isla). Para cambiar la
// isla de fábrica: arma tu isla en el editor, expórtala, y copia sus `memories` a memories.json y sus
// `props` a props.json (las fotos, mejor como archivos en public/memories/ y no incrustadas).
// Abajo, `items` es una lista opcional para agregar cosas a mano.
// (Desde la página puedes mover, borrar y agregar más con el modo editar;
// esos cambios se guardan aparte y tienen prioridad sobre esta lista.)
//
// Cada pieza:
//  kind      → la familia (clave de src/data/catalog.ts: fogata, tienda, cerca…)
//  variant   → cuál variante de esa familia (opcional; por defecto, la primera)
//  x, z      → posición. El centro de la isla es (0, 0). La altura se calcula sola.
//  rotation  → giro en grados
// ─────────────────────────────────────────────────────────────

type Item = { kind: string; variant?: string; x: number; z: number; rotation?: number }

// Una pieza puesta en la orilla: `angle` en grados (0 = hacia +z), `inset` = metros hacia adentro de la costa.
// Por defecto queda mirando hacia el mar.
export function onCoast(kind: string, angle: number, inset: number, rotation = angle, variant?: string): Item {
  const point = coastPoint(angle, inset)
  return { kind, variant, x: point.x, z: point.z, rotation }
}

const items: Item[] = [
  // Campamento al norte
  // { kind: 'fogata', x: 1.5, z: -6.5 },
  // { kind: 'madera', variant: 'tocon-redondo', x: 3.4, z: -5.7, rotation: 20 },
  // { kind: 'madera', variant: 'tocon-viejo', x: -0.4, z: -5.5, rotation: -40 },
  // { kind: 'tienda', x: -2.6, z: -8.6, rotation: 25 },
  // { kind: 'madera', variant: 'pila', x: 4.6, z: -8.2, rotation: -15 },

  // // Cartel cerca de donde apareces
  // { kind: 'cartel', x: 2.2, z: 6.4, rotation: -25 },

  // // Cerca en el lado oeste
  // ...[-9.4, -7.2, -5.0].map((x) => ({ kind: 'cerca', x, z: 5.2 })),

  // // En la orilla
  // onCoast('canoa', 235, 1.6, 235 + 90),
  // onCoast('torii', 95, 3.6),
]

// Lo de props.json + lo de `items`
export const seedProps: PlacedProp[] = [
  ...(propsJson as PlacedProp[]),
  ...items.map((item, index) => ({
    id: `base-${index}`,
    kind: item.kind,
    variant: item.variant,
    x: item.x,
    z: item.z,
    rotation: item.rotation ?? 0,
  })),
]
