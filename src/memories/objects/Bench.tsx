import { Shadowed } from '@/world/rendering/Shadowed'
import { ToonMaterial } from '@/world/rendering/ToonMaterial'
const WOOD = '#c6834b'
const IRON = '#4f4a5c'

// (relleno: se usa si no existe el GLB, ver src/data/models.ts)
export function Bench() {
  return (
    <Shadowed>
      {/* Asiento */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[1.6, 0.1, 0.5]} />
        <ToonMaterial color={WOOD} />
      </mesh>
      {/* Respaldo */}
      <mesh position={[0, 0.8, -0.22]} rotation={[-0.15, 0, 0]}>
        <boxGeometry args={[1.6, 0.35, 0.08]} />
        <ToonMaterial color={WOOD} />
      </mesh>
      {/* Patas */}
      {[-0.65, 0.65].map((x) => (
        <mesh key={x} position={[x, 0.22, 0]}>
          <boxGeometry args={[0.1, 0.44, 0.45]} />
          <ToonMaterial color={IRON} />
        </mesh>
      ))}
    </Shadowed>
  )
}
