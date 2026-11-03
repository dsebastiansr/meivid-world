import * as THREE from 'three'
import { toonGradient } from './toonGradient'

const cache = new WeakMap<THREE.Material, THREE.MeshToonMaterial>()

// Convierte el material que trae un modelo en uno toon, conservando su color y textura.
// Se guarda en una caché: todas las copias de un modelo comparten el mismo material
// (menos memoria y menos trabajo para la tarjeta gráfica).
export function toToonMaterial(source: THREE.Material): THREE.MeshToonMaterial {
  const cached = cache.get(source)
  if (cached) return cached

  const old = source as THREE.MeshStandardMaterial
  const material = new THREE.MeshToonMaterial({
    color: old.color ?? new THREE.Color('#ffffff'),
    map: old.map ?? null,
    vertexColors: old.vertexColors,
    transparent: old.transparent,
    opacity: old.opacity,
    alphaTest: old.alphaTest,
    side: old.side,
    gradientMap: toonGradient,
  })
  cache.set(source, material)
  return material
}

// Cambia todos los materiales de un modelo por materiales toon
export function toToon(root: THREE.Object3D) {
  root.traverse((object) => {
    const mesh = object as THREE.Mesh
    if (!mesh.isMesh) return
    mesh.material = Array.isArray(mesh.material) ? mesh.material.map(toToonMaterial) : toToonMaterial(mesh.material)
  })
}
