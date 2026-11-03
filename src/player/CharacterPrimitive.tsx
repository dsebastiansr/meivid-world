import { ToonMaterial } from '@/world/rendering/ToonMaterial'
import { COLORS, SHADOWS } from '@/config'
import { Shadowed } from '@/world/rendering/Shadowed'

// Personaje de relleno hecho con primitivas (se usa si no existe public/models/personaje.glb). Su "frente" mira hacia +Z.
// El origen (0, 0, 0) está en los pies.
// 
export function CharacterPrimitive() {
  return (
    <group>
      {/* Sombra falsa (solo si apagas las sombras reales en config.ts) */}
      {!SHADOWS.enabled && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <circleGeometry args={[0.38, 16]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.15} depthWrite={false} />
        </mesh>
      )}

      <Shadowed>
      {/* Cuerpo */}
      <mesh position={[0, 0.45, 0]}>
        <capsuleGeometry args={[0.28, 0.3, 4, 10]} />
        <ToonMaterial color={COLORS.player} flatShading />
      </mesh>

      {/* Cabeza */}
      <mesh position={[0, 1.08, 0]}>
        <sphereGeometry args={[0.36, 12, 10]} />
        <ToonMaterial color={COLORS.playerHead} flatShading />
      </mesh>

      {/* Ojos */}
      <mesh position={[-0.12, 1.12, 0.32]}>
        <sphereGeometry args={[0.045, 6, 6]} />
        <meshBasicMaterial color="#3b2a2a" />
      </mesh>
      <mesh position={[0.12, 1.12, 0.32]}>
        <sphereGeometry args={[0.045, 6, 6]} />
        <meshBasicMaterial color="#3b2a2a" />
      </mesh>

      {/* Cachetes */}
      <mesh position={[-0.2, 1.0, 0.28]}>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshBasicMaterial color="#ff7a95" />
      </mesh>
      <mesh position={[0.2, 1.0, 0.28]}>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshBasicMaterial color="#ff7a95" />
      </mesh>
      </Shadowed>
    </group>
  )
}
