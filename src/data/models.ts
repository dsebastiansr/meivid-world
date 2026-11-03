// ─────────────────────────────────────────────────────────────
// REGISTRO DE MODELOS 3D (.glb)
//
// Aquí le dices al juego qué archivo usar para cada cosa.
// Si el archivo NO existe en public/models/, el juego usa la forma
// simple de relleno, así que puedes ir agregando modelos uno por uno.
//
//  url        → ruta dentro de /public
//  node       → si el GLB trae varias piezas juntas (naturaleza.glb, props.glb),
//               el nombre de la que quieres (ver LEEME.md para la lista)
//  height     → altura final en metros. El modelo se escala solo a esta
//               altura, no importa en qué tamaño lo haya exportado el autor
//  rotationY  → giro en grados si el modelo mira para el lado equivocado
//  material   → 'toon'     = se pinta con la iluminación de la isla (recomendado)
//               'original' = conserva el material que trae el GLB
//  scale      → multiplicador extra (normalmente 1)
// ─────────────────────────────────────────────────────────────

export interface ModelConfig {
  url: string
  node?: string
  height: number
  rotationY?: number
  material?: 'toon' | 'original'
  scale?: number
}

export type CharacterAnimation = 'IDLE' | 'WALK' | 'RUN'

export interface CharacterModelConfig extends ModelConfig {
  // Nombre exacto de cada animación dentro del GLB. Si no lo pones, se busca
  // por palabra: "idle" / "walk" / "run" (sin importar mayúsculas).
  animations?: Partial<Record<CharacterAnimation, string>>
}

// El panda del pack "sushi-restaurant". Trae 30 animaciones; usamos estas tres.
const CLIP = 'CharacterArmature|CharacterArmature|CharacterArmature|'

export const CHARACTER: CharacterModelConfig = {
  url: '/models/personaje.glb',
  height: 1.5,
  animations: { IDLE: CLIP + 'Idle', WALK: CLIP + 'Walk', RUN: CLIP + 'Run' },
}

// Los dos GLB con muchas piezas (cada pieza se pide por su `node`)
export const NATURE_URL = '/models/naturaleza.glb' // Quaternius: árboles, arbustos, flores, pasto, rocas…
export const PROPS_URL = '/models/props.glb' // Kenney + torii: fogata, tienda, cercas, troncos, canoa…

// Las calabazas: dos archivos sueltos (la pieza dentro de cada uno se llama "Pumpkin")
export const PUMPKIN_1_URL = '/models/pumpkin-1.glb'
export const PUMPKIN_2_URL = '/models/pumpkin-2.glb'

// Dos conjuntos completos (sin `node`: se usa toda la escena del archivo)
export const BEACH_CHAIRS_URL = '/models/beach-chairs.glb' // dos sillas de playa y una sombrilla
export const RECORD_PLAYER_URL = '/models/record-player.glb'

export const RADIO_URL = '/models/radio.glb'

// Los objetos de recuerdo (ver src/memories/objects/index.ts)
export const MODELS = {
  banca: { url: '/models/banca.glb', height: 1.2 },
  buzon: { url: '/models/buzon.glb', height: 1.4 },
  foto: { url: PROPS_URL, node: 'sign', height: 1.3 },
  flor: { url: NATURE_URL, node: 'Flower_3_Group', height: 0.9 },
  calabaza: { url: PUMPKIN_1_URL, node: 'Pumpkin', height: 0.9 },
  calabaza2: { url: PUMPKIN_2_URL, node: 'Pumpkin', height: 0.9 },
  sillas: { url: BEACH_CHAIRS_URL, height: 2.2 },
  tocadiscos: { url: RECORD_PLAYER_URL, height: 0.5 },
  radio: {url: RADIO_URL, height: 1},
} satisfies Record<string, ModelConfig>
