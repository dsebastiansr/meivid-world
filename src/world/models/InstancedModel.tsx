import { useGLTF } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { toToonMaterial } from '../rendering/toonify'
import { findNode } from './useModel'

export interface Placement {
  x: number
  y: number
  z: number
  rotY: number // giro en radianes
  scale: number // multiplicador sobre la altura base
}

interface InstancedModelProps {
  url: string
  node: string // la pieza dentro del GLB
  height: number // altura base en metros
  placements: Placement[]
  castShadow?: boolean
}

// Dibuja MUCHAS copias de una pieza con un solo "dibujo" de la tarjeta gráfica
// (se llama instanciado). Es lo que permite llenar la isla de árboles, flores y pasto
// sin que el celular sufra: 100 pastos cuestan casi lo mismo que 1.
export function InstancedModel({ url, node, height, placements, castShadow = false }: InstancedModelProps) {
  const gltf = useGLTF(url) as unknown as GLTF

  const meshes = useMemo(() => {
    const root = findNode(gltf, node)
    root.updateWorldMatrix(true, true)

    // Medimos la pieza para escalarla a `height`, apoyarla en el suelo y centrarla
    const box = new THREE.Box3().setFromObject(root)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const factor = size.y > 0 ? height / size.y : 1
    const normalize = new THREE.Matrix4()
      .makeScale(factor, factor, factor)
      .multiply(new THREE.Matrix4().makeTranslation(-center.x, -box.min.y, -center.z))

    const placement = new THREE.Matrix4()
    const rotation = new THREE.Quaternion()
    const result: THREE.InstancedMesh[] = []

    root.traverse((child) => {
      const source = child as THREE.Mesh
      if (!source.isMesh) return

      const material = Array.isArray(source.material) ? source.material[0] : source.material
      const instanced = new THREE.InstancedMesh(source.geometry, toToonMaterial(material), placements.length)
      const base = normalize.clone().multiply(source.matrixWorld)

      placements.forEach((item, index) => {
        rotation.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, item.rotY)
        placement.compose(
          new THREE.Vector3(item.x, item.y, item.z),
          rotation,
          new THREE.Vector3(item.scale, item.scale, item.scale),
        )
        instanced.setMatrixAt(index, placement.clone().multiply(base))
      })

      instanced.instanceMatrix.needsUpdate = true
      instanced.castShadow = castShadow
      instanced.receiveShadow = true
      instanced.frustumCulled = false // el área de las copias no es la de la pieza original
      result.push(instanced)
    })

    return result
  }, [gltf, node, height, placements, castShadow])

  return (
    <group>
      {meshes.map((mesh) => (
        <primitive key={mesh.uuid} object={mesh} />
      ))}
    </group>
  )
}
