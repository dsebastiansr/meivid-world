import { Shadowed } from '@/world/rendering/Shadowed'
import { ToonMaterial } from '@/world/rendering/ToonMaterial'

// Tocadiscos (relleno: se usa si no carga el GLB, ver src/data/models.ts):
// una caja de madera con el disco negro encima y el brazo con la aguja.
export function RecordPlayer() {
  return (
    <Shadowed>
      {/* Caja */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[1.5, 0.4, 1.8]} />
        <ToonMaterial color="#b9794a" />
      </mesh>
      {/* Disco */}
      <mesh position={[-0.1, 0.43, 0]}>
        <cylinderGeometry args={[0.65, 0.65, 0.04, 20]} />
        <ToonMaterial color="#24212b" />
      </mesh>
      {/* Etiqueta del centro */}
      <mesh position={[-0.1, 0.46, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.02, 14]} />
        <ToonMaterial color="#ff6f91" />
      </mesh>
      {/* Brazo con la aguja */}
      <mesh position={[0.55, 0.5, -0.5]} rotation={[0, 0.6, 0]}>
        <boxGeometry args={[0.06, 0.05, 0.9]} />
        <ToonMaterial color="#d9d4cc" />
      </mesh>
    </Shadowed>
  )
}
