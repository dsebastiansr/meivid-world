import * as THREE from 'three'
import { CURVE, ISLAND } from '@/config'
import { groundHeight } from '@/world/terrain/terrainData'

// ─────────────────────────────────────────────────────────────
// APUNTAR AL SUELO
//
// El mundo curvo dobla lo que se VE lejos de la cámara, pero no la física ni los
// datos. Así que si lanzáramos un rayo normal contra el suelo, lejos del centro
// el clic caería en un lugar distinto al que ves. Aquí corregimos eso:
//  1. buscamos dónde cae el rayo en el suelo "sin doblar"
//  2. calculamos dónde se vería ese punto en pantalla (doblado)
//  3. repetimos moviendo el punto hasta que se vea justo donde tocaste
// ─────────────────────────────────────────────────────────────

const raycaster = new THREE.Raycaster()
const point = new THREE.Vector3()
const view = new THREE.Vector3()

// Misma fórmula que el shader de mundo curvo (ver curvedWorld.ts)
function bend(viewPosition: THREE.Vector3) {
  const distance = Math.max(Math.hypot(viewPosition.x, viewPosition.z) - CURVE.start, 0)
  viewPosition.y -= distance * distance * CURVE.strength
}

// Coordenadas de pantalla (-1 a 1) en las que SE VE un punto del mundo
export function toScreen(camera: THREE.Camera, world: THREE.Vector3, out = new THREE.Vector2()) {
  view.copy(world).applyMatrix4(camera.matrixWorldInverse)
  bend(view)
  view.applyMatrix4(camera.projectionMatrix)
  return out.set(view.x, view.y)
}

// Dónde toca un rayo (sin curva) la superficie del terreno
function plainHit(camera: THREE.Camera, ndc: THREE.Vector2) {
  raycaster.setFromCamera(ndc, camera)
  const { origin, direction } = raycaster.ray
  const above = (t: number) => {
    point.copy(direction).multiplyScalar(t).add(origin)
    return point.y - Math.max(groundHeight(point.x, point.z), ISLAND.waterLevel)
  }

  // Avanzamos hasta pasar por debajo del suelo y afinamos con bisección
  let near = 0
  let far = 0
  for (let t = 0.5; t < 120; t += 0.5) {
    if (above(t) < 0) {
      far = t
      break
    }
    near = t
  }
  if (far === 0) return null
  for (let i = 0; i < 18; i++) {
    const middle = (near + far) / 2
    if (above(middle) < 0) far = middle
    else near = middle
  }
  above((near + far) / 2)
  return { x: point.x, z: point.z }
}

export function pickGround(camera: THREE.Camera, ndc: THREE.Vector2) {
  const target = plainHit(camera, ndc)
  if (!target) return null

  // Corregimos por la curva con unas pocas iteraciones
  const current = { ...target }
  const screen = new THREE.Vector2()
  const world = new THREE.Vector3()
  for (let i = 0; i < 4; i++) {
    world.set(current.x, groundHeight(current.x, current.z), current.z)
    toScreen(camera, world, screen)
    const seen = plainHit(camera, screen)
    if (!seen) break
    current.x += target.x - seen.x
    current.z += target.z - seen.z
  }
  return current
}
