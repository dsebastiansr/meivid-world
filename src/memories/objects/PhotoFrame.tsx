import { Shadowed } from '@/world/rendering/Shadowed'
import { ToonMaterial } from '@/world/rendering/ToonMaterial'
//  (relleno: se usa si no existe el GLB, ver src/data/models.ts)
export function PhotoFrame() {
  return (
    <Shadowed>
      {[-0.6, 0.6].map((x) => (
        <mesh key={x} position={[x, 0.7, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 1.4, 6]} />
          <ToonMaterial color="#9a6a3f" />
        </mesh>
      ))}
      {/* Marco */}
      <mesh position={[0, 0.95, 0]}>
        <boxGeometry args={[0.9, 0.7, 0.06]} />
        <ToonMaterial color="#fff3e0" />
      </mesh>
      {/* "Foto" */}
      <mesh position={[0, 0.95, 0.035]}>
        <planeGeometry args={[0.75, 0.55]} />
        <ToonMaterial color="#ff8fab" />
      </mesh>
    </Shadowed>
  )
}
