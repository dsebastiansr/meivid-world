import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { BEACH, ISLAND } from '@/config'
import { coastPoint, insideAtHeight } from './terrainData'

const WALLS = 72 // cuántas paredes forman el contorno (más = sigue mejor las curvas)
// Dónde está la pared: donde el suelo llega a la altura BEACH.walkLimit sobre el agua (config.ts)
const INSET = insideAtHeight(ISLAND.waterLevel + BEACH.walkLimit)

// Paredes invisibles siguiendo la costa para que el personaje no se caiga al agua.
export function IslandBounds() {
  const points = Array.from({ length: WALLS }, (_, i) => coastPoint((i / WALLS) * 360, INSET))

  return (
    <RigidBody type="fixed" colliders={false}>
      {points.map((from, i) => {
        const to = points[(i + 1) % WALLS]
        const dx = to.x - from.x
        const dz = to.z - from.z
        return (
          <CuboidCollider
            key={i}
            // Mitad del largo del tramo (+ un poco para que no queden huecos), alto y grosor
            args={[Math.hypot(dx, dz) / 2 + 0.1, 3, 0.3]}
            position={[(from.x + to.x) / 2, 0.5, (from.z + to.z) / 2]}
            // Gira la pared para que quede alineada con el tramo de costa
            rotation={[0, Math.atan2(-dz, dx), 0]}
          />
        )
      })}
    </RigidBody>
  )
}
