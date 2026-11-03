import { Shadowed } from '@/world/rendering/Shadowed'
import { ToonMaterial } from '@/world/rendering/ToonMaterial'
//  (relleno: se usa si no existe el GLB, ver src/data/models.ts)
export function Mailbox() {
  return (
    <Shadowed>
      {/* Poste */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[0.12, 0.9, 0.12]} />
        <ToonMaterial color="#9a6a3f" />
      </mesh>
      {/* Caja */}
      <mesh position={[0, 1.05, 0]}>
        <boxGeometry args={[0.4, 0.34, 0.6]} />
        <ToonMaterial color="#3d8bff" />
      </mesh>
      {/* Techo redondo */}
      <mesh position={[0, 1.22, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.6, 8, 1, false, Math.PI / 2, Math.PI]} />
        <ToonMaterial color="#3d8bff" flatShading />
      </mesh>
      {/* Banderita */}
      <mesh position={[0.23, 1.25, -0.1]}>
        <boxGeometry args={[0.04, 0.3, 0.06]} />
        <ToonMaterial color="#ff4757" />
      </mesh>
      <mesh position={[0.23, 1.36, -0.02]}>
        <boxGeometry args={[0.04, 0.1, 0.16]} />
        <ToonMaterial color="#ff4757" />
      </mesh>
    </Shadowed>
  )
}
