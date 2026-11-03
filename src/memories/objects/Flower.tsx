import { Shadowed } from '@/world/rendering/Shadowed'
import { ToonMaterial } from '@/world/rendering/ToonMaterial'
const PETALS = 5

//  (relleno: se usa si no existe el GLB, ver src/data/models.ts)
export function Flower() {
  return (
    <Shadowed>
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.03, 0.04, 0.7, 5]} />
        <ToonMaterial color="#3f9d3c" />
      </mesh>
      {Array.from({ length: PETALS }, (_, i) => {
        const angle = (i / PETALS) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(angle) * 0.14, 0.75, Math.sin(angle) * 0.14]}>
            <sphereGeometry args={[0.1, 6, 5]} />
            <ToonMaterial color="#ff5c8a" flatShading />
          </mesh>
        )
      })}
      <mesh position={[0, 0.77, 0]}>
        <sphereGeometry args={[0.08, 6, 5]} />
        <ToonMaterial color="#ffc928" />
      </mesh>
    </Shadowed>
  )
}
