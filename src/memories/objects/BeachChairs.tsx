import { Shadowed } from '@/world/rendering/Shadowed'
import { ToonMaterial } from '@/world/rendering/ToonMaterial'

const FRAME = '#f4efe6'
const STRIPES = ['#ff6f91', '#ffffff']

// Una silla de playa reclinada: patas, asiento y respaldo de tela a rayas
function Chair({ x, rotation = 0 }: { x: number; rotation?: number }) {
  return (
    <group position={[x, 0, 0]} rotation={[0, rotation, 0]}>
      {/* Patas */}
      {[-0.28, 0.28].map((legX) => (
        <mesh key={legX} position={[legX, 0.25, 0.05]} rotation={[0.25, 0, 0]}>
          <boxGeometry args={[0.05, 0.5, 0.05]} />
          <ToonMaterial color={FRAME} />
        </mesh>
      ))}
      {/* Asiento */}
      <mesh position={[0, 0.3, 0.05]}>
        <boxGeometry args={[0.6, 0.05, 0.55]} />
        <ToonMaterial color={STRIPES[0]} />
      </mesh>
      {/* Respaldo (inclinado hacia atrás) con una franja blanca */}
      <mesh position={[0, 0.62, -0.3]} rotation={[-0.45, 0, 0]}>
        <boxGeometry args={[0.6, 0.65, 0.05]} />
        <ToonMaterial color={STRIPES[0]} />
      </mesh>
      <mesh position={[0, 0.64, -0.29]} rotation={[-0.45, 0, 0]}>
        <boxGeometry args={[0.2, 0.66, 0.055]} />
        <ToonMaterial color={STRIPES[1]} />
      </mesh>
    </group>
  )
}

// Dos sillas de playa y una sombrilla (relleno: se usa si no carga el GLB, ver src/data/models.ts)
export function BeachChairs() {
  return (
    <Shadowed>
      <Chair x={-0.45} />
      <Chair x={0.45} />
      {/* Sombrilla: palo y techo */}
      <mesh position={[0, 0.9, -0.6]}>
        <cylinderGeometry args={[0.025, 0.025, 1.8, 6]} />
        <ToonMaterial color={FRAME} />
      </mesh>
      <mesh position={[0, 1.85, -0.6]}>
        <coneGeometry args={[1.1, 0.4, 10]} />
        <ToonMaterial color={STRIPES[0]} />
      </mesh>
    </Shadowed>
  )
}
