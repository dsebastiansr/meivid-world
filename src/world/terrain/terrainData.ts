import * as THREE from 'three'
import { BEACH, COLORS, GRASS, ISLAND, PLAYER, TERRAIN } from '@/config'
import { seedMemories } from '@/data/memories'

// ─────────────────────────────────────────────────────────────
// TERRENO
// Todo sale de unas pocas funciones matemáticas (sin imágenes):
//  · coastRadius()   → la forma irregular de la costa
//  · groundHeight()  → la altura del suelo en cualquier punto (x, z)
//  · pathStrength()  → qué tan "camino de tierra" es un punto (0 a 1)
// La malla que se ve, la colisión con la que caminas y la posición de
// los objetos usan las MISMAS funciones, así que siempre coinciden.
// ─────────────────────────────────────────────────────────────

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

// Ángulo de un punto visto desde el centro (0 = hacia +z)
export const angleOf = (x: number, z: number) => Math.atan2(x, z)

// Radio de la costa en cada dirección. Suma de tres ondas = contorno irregular.
// Cambia los números (amplitud, frecuencia, fase) para otra forma de isla.
export function coastRadius(angle: number) {
  return (
    ISLAND.radius +
    1.7 * Math.sin(2 * angle + 0.8) +
    1.1 * Math.sin(3 * angle + 2.1) +
    0.7 * Math.sin(5 * angle + 4.0)
  )
}

// Cuántos metros hacia adentro de la costa está un punto (negativo = en el mar)
export const insideDistance = (x: number, z: number) => coastRadius(angleOf(x, z)) - Math.hypot(x, z)

// Un punto sobre la costa, metido `inset` metros hacia adentro. Útil para poner cosas en la orilla.
export function coastPoint(angleDeg: number, inset: number) {
  const angle = THREE.MathUtils.degToRad(angleDeg)
  const radius = coastRadius(angle) - inset
  return { x: Math.sin(angle) * radius, z: Math.cos(angle) * radius, angle }
}

// Perfil de la playa. `inside` = metros hacia adentro de la costa. La pendiente empieza
// bajo el agua (BEACH_START) y termina donde empieza el pasto plano (GRASS_START).
// Se ajusta con BEACH en config.ts.
const BEACH_START = -3.5
export const GRASS_START = BEACH_START + BEACH.width
const beach = (inside: number) => -BEACH.depth + BEACH.depth * smoothstep(BEACH_START, GRASS_START, inside)

// Cuánto se corrió el pasto respecto a la playa original de 5.7 m. El reparto de árboles
// lo usa para que sus zonas se muevan junto con la playa.
export const beachShift = GRASS_START - 2.2

// A cuántos metros hacia adentro de la costa llega el suelo a cierta altura (se busca por bisección)
export function insideAtHeight(height: number) {
  let low = BEACH_START
  let high = GRASS_START
  for (let i = 0; i < 30; i++) {
    const middle = (low + high) / 2
    if (beach(middle) < height) low = middle
    else high = middle
  }
  return (low + high) / 2
}

// Colinas suaves (solo tierra adentro)
const hills = (x: number, z: number) =>
  0.3 * Math.sin(x * 0.31 + 1.3) * Math.cos(z * 0.27) +
  0.2 * Math.sin((x + z) * 0.19 + 0.5) +
  0.1 * Math.sin(x * 0.7) * Math.sin(z * 0.6 + 2)

export function groundHeight(x: number, z: number) {
  const inside = insideDistance(x, z)
  return beach(inside) + hills(x, z) * smoothstep(GRASS_START - 0.2, GRASS_START + 3.8, inside)
}

// ── Caminos de tierra: del punto de inicio a cada recuerdo ──
export type PathSegments = [number, number, number, number][]

export const pathSegmentsFor = (list: { posicion: [number, number, number] }[]): PathSegments =>
  list.map((memory) => [PLAYER.spawn[0], PLAYER.spawn[2], memory.posicion[0], memory.posicion[2]])

// Los caminos de los recuerdos de fábrica (se usan al repartir árboles)
const seedSegments = pathSegmentsFor(seedMemories)

function distanceToSegment(px: number, pz: number, [ax, az, bx, bz]: [number, number, number, number]) {
  const dx = bx - ax
  const dz = bz - az
  const t = Math.min(1, Math.max(0, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz || 1)))
  return Math.hypot(px - (ax + t * dx), pz - (az + t * dz))
}

export function pathStrength(x: number, z: number, segments: PathSegments = seedSegments) {
  // El borde se ondula un poco para que no parezca una línea recta
  const wobble = 0.25 * Math.sin(x * 1.7) * Math.sin(z * 1.3)
  let strength = 0
  for (const segment of segments) {
    const distance = distanceToSegment(x, z, segment) + wobble
    strength = Math.max(strength, 1 - smoothstep(0.55, 1.15, distance))
  }
  return strength * smoothstep(GRASS_START - 0.7, GRASS_START + 0.8, insideDistance(x, z))
}

// ── Malla ──

// Mezcla `top` (con opacidad `alpha`) encima de `bottom`. Los colores van como [r, g, b, a].
type Layer = [number, number, number, number]
function over(bottom: Layer, top: THREE.Color, alpha: number): Layer {
  const a = alpha + bottom[3] * (1 - alpha)
  if (a <= 0) return bottom
  const mix = (b: number, t: number) => (b * bottom[3] * (1 - alpha) + t * alpha) / a
  return [mix(bottom[0], top.r), mix(bottom[1], top.g), mix(bottom[2], top.b), a]
}

const grassDark = new THREE.Color(GRASS.dark)
const sand = new THREE.Color(COLORS.sand)
const sandWet = new THREE.Color(COLORS.sandWet)
const dirt = new THREE.Color(COLORS.dirt)

// Color de cada vértice. El material mezcla este color con la textura de pasto
// usando el cuarto valor (alfa) como cantidad: alfa 0 = solo pasto, 1 = solo este color.
function vertexColor(x: number, z: number, height: number, segments: PathSegments): Layer {
  const inside = insideDistance(x, z)
  let layer: Layer = [0, 0, 0, 0]

  // Manchas de pasto más oscuro
  const noise = 0.5 + 0.5 * Math.sin(x * 0.9 + Math.sin(z * 0.7) * 1.8) * Math.sin(z * 0.8 + Math.sin(x * 0.6) * 1.5)
  layer = over(layer, grassDark, smoothstep(0.5, 0.85, noise) * GRASS.patches)

  // Camino de tierra
  layer = over(layer, dirt, pathStrength(x, z, segments) * 0.8)

  // Arena en la orilla y arena mojada bajo el agua
  // La arena cubre `BEACH.sand` de la pendiente, difuminándose en sus últimos 1.3 m
  const sandEnd = BEACH_START + BEACH.width * BEACH.sand
  layer = over(layer, sand, 1 - smoothstep(sandEnd - 1.3, sandEnd, inside))
  layer = over(layer, sandWet, smoothstep(ISLAND.waterLevel + 0.3, ISLAND.waterLevel - 0.1, height))
  return layer
}

export interface TerrainData {
  geometry: THREE.BufferGeometry
  colliderVertices: Float32Array
  colliderIndices: Uint32Array
}

export function buildTerrain(segments: PathSegments = seedSegments): TerrainData {
  const { size, cells } = TERRAIN
  const count = cells + 1
  const positions = new Float32Array(count * count * 3)
  const colors = new Float32Array(count * count * 4)
  const uvs = new Float32Array(count * count * 2)
  const heights = new Float32Array(count * count)

  for (let j = 0; j < count; j++) {
    for (let i = 0; i < count; i++) {
      const index = j * count + i
      const x = (i / cells - 0.5) * size
      const z = (j / cells - 0.5) * size
      const height = groundHeight(x, z)
      heights[index] = height
      positions.set([x, height, z], index * 3)
      colors.set(vertexColor(x, z, height, segments), index * 4)
      uvs.set([i / cells, j / cells], index * 2)
    }
  }

  const indices: number[] = []
  const walkable: number[] = []
  for (let j = 0; j < cells; j++) {
    for (let i = 0; i < cells; i++) {
      const a = j * count + i
      const b = a + 1
      const c = a + count
      const d = c + 1
      for (const triangle of [[a, c, b], [b, c, d]]) {
        indices.push(...triangle)
        // Para colisiones solo guardamos lo que está sobre el fondo del mar
        if (triangle.some((vertex) => heights[vertex] > ISLAND.waterLevel - 1.2)) walkable.push(...triangle)
      }
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 4))
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
  geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1))
  geometry.computeVertexNormals()

  return { geometry, colliderVertices: positions, colliderIndices: new Uint32Array(walkable) }
}

// Textura con la altura del terreno, para que el agua sepa dónde está la costa
// (el shader del agua dibuja la espuma en las curvas de nivel).
export const HEIGHT_TEXTURE_SIZE = 256

export function buildHeightTexture() {
  const n = HEIGHT_TEXTURE_SIZE
  const data = new Uint16Array(n * n)
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const x = (i / (n - 1) - 0.5) * TERRAIN.size
      const z = (j / (n - 1) - 0.5) * TERRAIN.size
      data[j * n + i] = THREE.DataUtils.toHalfFloat(groundHeight(x, z))
    }
  }
  const texture = new THREE.DataTexture(data, n, n, THREE.RedFormat, THREE.HalfFloatType)
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping
  texture.needsUpdate = true
  return texture
}
