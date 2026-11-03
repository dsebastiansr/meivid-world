// ─────────────────────────────────────────────────────────────
// Ajustes generales del mundo. Cambia estos números para
// personalizar la isla sin tener que tocar los componentes.
// ─────────────────────────────────────────────────────────────

// true en iPad / celular (se maneja con el dedo). Ahí se baja la calidad para que corra fluido.
export const TOUCH = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

export const ISLAND = {
  radius: 17, // radio promedio de la isla (el contorno real es irregular, ver coastRadius en terrainData.ts)
  waterLevel: -1, // altura del agua
}

// La playa: cómo baja el suelo desde el pasto hasta el fondo del mar.
// Con estos tres números se mueve todo lo demás (colinas, arena, caminos, paredes, reparto).
export const BEACH = {
  width: 8, // largo de la pendiente en metros: más = playa más ancha y menos empinada
  depth: 2.6, // qué tan profundo es el fondo del mar frente a la costa
  sand: 1, // cuánto de la pendiente se pinta de arena (0 a 1)
  walkLimit: -0.1, // hasta qué altura sobre el agua puedes caminar (negativo = entrar un poco al agua)
  placeLimit: 0.35, // altura mínima sobre el agua para colocar cosas con el editor
}

// Malla del terreno: un cuadrado de `size` metros dividido en `cells` x `cells` celdas.
// Más celdas = colinas y costa más suaves, pero más pesado.
export const TERRAIN = {
  size: 56,
  cells: 112,
}

export const PLAYER = {
  spawn: [-0.3, 1, 14] as [number, number, number], // dónde aparece el personaje
  walkSpeed: 3,
  runSpeed: 6, // se activa manteniendo Shift
  respawnBelowY: -8, // si cae más abajo de esto, vuelve al inicio
}

export const CAMERA = {
  offset: [0, 9, 10] as [number, number, number], // posición relativa al personaje
  fov: 40,
  followSpeed: 5, // qué tan rápido alcanza al personaje
  lookAtHeight: 0.6,
}

export const INTERACTION = {
  radius: 2.2, // distancia para que aparezca "Ver recuerdo"
}

export const COLORS = {
  sky: '#a8d4f2', // horizonte (y color de la niebla)
  skyTop: '#5fa8e8', // cielo arriba
  water: '#5b92e6', // agua cerca de la orilla
  waterDeep: '#2f5fc4', // agua lejos
  foam: '#ffffff', // líneas de espuma
  grass: '#ffffff', // el pasto se pinta con una textura (ver grassTexture.ts y GRASS)
  sand: '#ead590',
  sandWet: '#c9b27a', // arena mojada bajo el agua
  dirt: '#c49a62', // caminos de tierra
  player: '#ff5d8f',
  playerHead: '#ffd7b8',
  marker: '#ffc928',
  cloud: '#ffffff',
}

// Pasto: color de fondo y color de los trazos que lo texturizan
export const GRASS = {
  base: '#3da23f',
  blades: '#2b8a33',
  dark: '#246b2d', // color de las manchas de pasto más oscuro
  patches: 0, // cuánto se notan esas manchas: 0 = ninguna, 0.55 = marcadas
  repeat: 32, // cuántas veces se repite la textura en toda la isla (más = trazos más chicos)
}

// Luces. Las sombras son lo que queda cuando solo llega la luz de ambiente,
// así que: ambiente más baja = sombras más oscuras y más contraste.
export const LIGHTS = {
  ambient: 1.55, // luz pareja de cielo/suelo
  sky: '#b5ccff', // tinte frío de las sombras (viene del cielo)
  ground: '#6f9a55', // rebote verdoso desde el pasto
  sun: 2.3, // luz direccional del sol
  sunColor: '#fff1d6', // sol cálido
  sunOffset: [3, 13, 2] as [number, number, number], // de dónde viene el sol, relativo al personaje (las sombras caen al lado contrario)
}

// Toon shading: escalones de luz (0 = oscuro, 1 = luz completa).
// Muchos escalones juntos = degradado suave; pocos y separados = caricatura marcada.
export const TOON = {
  shades: [0.5, 0.66, 0.82, 0.93, 1],
}

// Mundo curvo: el suelo se "dobla" hacia abajo a partir de cierta distancia de la cámara.
export const CURVE = {
  strength: 0.008, // 0 = mundo plano. Más alto = se curva más rápido
  start: 12, // distancia a la que empieza a curvarse (el personaje está a ~13)
}

// Sombras reales. Si el celular va lento, pon enabled: false (queda una sombra falsa).
export const SHADOWS = {
  enabled: true,
  mapSize: TOUCH ? 1024 : 1536, // calidad (1024 = más rápido, 2048 = más nítido). En iPad/celular siempre más baja
  area: TOUCH ? 11 : 14, // mitad del cuadro (en metros) alrededor del personaje que recibe sombras
  softness: 2, // qué tan borrosa es la orilla de la sombra
}

// Resolución del render (1 = un píxel real por píxel de la pantalla de CSS). Un iPad tiene pantalla x2
// y dibujarla entera cuadruplica el trabajo, por eso el tope es menor ahí. Si el juego se
// ve lento, App.tsx baja `min..max` solo (PerformanceMonitor).
export const RESOLUTION = {
  min: 0.75,
  max: TOUCH ? 1.25 : 1.5,
}
