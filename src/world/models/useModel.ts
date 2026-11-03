import { useGLTF } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'
import type { ModelConfig } from '@/data/models'
import { toToon } from '../rendering/toonify'

type Gltf = GLTF

// Busca una pieza por nombre dentro de un GLB que trae varias (ver `node` en models.ts)
export function findNode(gltf: Gltf, name: string) {
  for (const scene of gltf.scenes) {
    const found = scene.getObjectByName(name)
    if (found) return found
  }
  console.warn(`No se encontró la pieza "${name}" dentro del modelo`)
  return gltf.scene
}

// Carga un GLB, hace una copia propia (se puede usar el mismo archivo muchas veces)
// y lo normaliza: escala a `height` metros, pies en y = 0 y centrado en x / z.
// Esto es lo que hace que modelos con tamaños raros "simplemente funcionen".
export function useModel(config: ModelConfig) {
  const gltf = useGLTF(config.url) as unknown as Gltf
  const { animations } = gltf

  const object = useMemo(() => {
    const copy = clone(config.node ? findNode(gltf, config.node) : gltf.scene)
    if (config.material !== 'original') toToon(copy)

    // Los modelos con esqueleto (personajes) se miden usando la posición de sus huesos,
    // y una copia recién clonada todavía no la tiene calculada: sin esto la medida sale
    // absurda y el modelo queda gigante o diminuto (se vería como "no aparece").
    copy.updateMatrixWorld(true)
    copy.traverse((child) => {
      // El área visible de un modelo animado cambia al moverse: mejor no recortarlo por cámara
      if ((child as THREE.SkinnedMesh).isSkinnedMesh) child.frustumCulled = false
    })

    // Medimos el modelo tal como viene…
    const box = new THREE.Box3().setFromObject(copy)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const valid = Number.isFinite(size.y) && size.y > 0
    if (!valid) console.warn(`No se pudo medir el modelo ${config.url}: se usa su tamaño original`)
    const factor = valid ? (config.height / size.y) * (config.scale ?? 1) : 1

    // …y lo acomodamos dentro de un grupo
    copy.scale.multiplyScalar(factor)
    copy.position.set(valid ? -center.x * factor : 0, valid ? -box.min.y * factor : 0, valid ? -center.z * factor : 0)

    const wrapper = new THREE.Group()
    wrapper.rotation.y = THREE.MathUtils.degToRad(config.rotationY ?? 0)
    wrapper.add(copy)
    return wrapper
  }, [gltf, config])

  return { object, animations }
}
