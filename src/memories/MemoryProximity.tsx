import { useFrame } from '@react-three/fiber'
import { INTERACTION } from '@/config'
import { playerPosition } from '@/player/playerPosition'
import { useGameStore } from '@/store/useGameStore'
import type { Memory } from '@/types'

// Cada frame revisa cuál recuerdo está más cerca del personaje
// y lo guarda en el store (así la interfaz sabe si mostrar "Ver recuerdo").
export function MemoryProximity({ memories }: { memories: Memory[] }) {
  useFrame(() => {
    let nearestId: string | null = null
    let nearestDistance: number = INTERACTION.radius

    for (const memory of memories) {
      const [x, , z] = memory.posicion
      const distance = Math.hypot(playerPosition.x - x, playerPosition.z - z)
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestId = memory.id
      }
    }

    const { nearbyMemoryId, setNearbyMemory } = useGameStore.getState()
    if (nearbyMemoryId !== nearestId) setNearbyMemory(nearestId)
  })

  return null
}
