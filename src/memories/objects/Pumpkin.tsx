import { Shadowed } from '@/world/rendering/Shadowed'
import { ToonMaterial } from '@/world/rendering/ToonMaterial'

// Calabaza de relleno (se usa si falla la carga del GLB, ver src/data/models.ts).
// Una calabaza naranja con tallo y cara de jack-o'-lantern.
export function Pumpkin() {
  return (
    <Shadowed>
      {/* Cuerpo */}
      <mesh position={[0, 0.4, 0]} scale={[1, 0.85, 1]}>
        <sphereGeometry args={[0.45, 12, 10]} />
        <ToonMaterial color="#f08a24" />
      </mesh>
      {/* Tallo */}
      <mesh position={[0, 0.82, 0]}>
        <cylinderGeometry args={[0.05, 0.07, 0.14, 6]} />
        <ToonMaterial color="#5c7a2e" />
      </mesh>
      {/* Cara: ojos y boca */}
      {[-0.17, 0.17].map((x) => (
        <mesh key={x} position={[x, 0.5, 0.4]}>
          <boxGeometry args={[0.1, 0.1, 0.05]} />
          <meshBasicMaterial color="#3a1c05" />
        </mesh>
      ))}
      <mesh position={[0, 0.3, 0.41]}>
        <boxGeometry args={[0.32, 0.08, 0.05]} />
        <meshBasicMaterial color="#3a1c05" />
      </mesh>
    </Shadowed>
  )
}
