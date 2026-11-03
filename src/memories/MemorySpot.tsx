import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { MathUtils } from 'three'
import { useGameStore } from '@/store/useGameStore'
import { groundHeight } from '@/world/terrain/terrainData'
import type { Memory } from '@/types'
import { MemoryMarker } from './MemoryMarker'
import { memoryObjects } from './objects'

// Un recuerdo en la isla: su objeto (con colisión) + el indicador flotante.
export function MemorySpot({ memory }: { memory: Memory }) {
  const { Model, markerHeight, collider } = memoryObjects[memory.tipo] ?? memoryObjects.banca
  const isNearby = useGameStore((state) => state.nearbyMemoryId === memory.id)
  const rotation: [number, number, number] = [0, MathUtils.degToRad(memory.rotacion ?? 0), 0]
  const [width, height, depth] = collider

  // La altura sale del terreno (en memories.json, y = 0 significa "sobre el suelo")
  const position: [number, number, number] = [
    memory.posicion[0],
    groundHeight(memory.posicion[0], memory.posicion[2]) + memory.posicion[1],
    memory.posicion[2],
  ]

  return (
    <>
      <RigidBody type="fixed" colliders={false} position={position} rotation={rotation}>
        {/* Caja de colisión invisible (el tamaño sale de memoryObjects) */}
        <CuboidCollider args={[width / 2, height / 2, depth / 2]} position={[0, height / 2, 0]} />
        <Model />
      </RigidBody>
      <group position={position}>
        <MemoryMarker height={markerHeight} active={isNearby} />
      </group>
    </>
  )
}
