import { RigidBody, TrimeshCollider } from '@react-three/rapier'
import { useMemo } from 'react'
import type * as THREE from 'three'
import { COLORS } from '@/config'
import { useWorldStore } from '@/store/useWorldStore'
import { grassTexture } from './grassTexture'
import { Shadowed } from '../rendering/Shadowed'
import { ToonMaterial } from '../rendering/ToonMaterial'
import { buildTerrain, pathSegmentsFor } from './terrainData'

// El color de cada vértice trae un cuarto valor (alfa) que dice cuánto reemplaza
// a la textura de pasto: 0 = pasto con sus trazos, 1 = color liso (arena, tierra…).
// El material normal solo sabe multiplicar, así que cambiamos esa línea del shader.
function mixVertexColor(shader: THREE.WebGLProgramParametersWithUniforms) {
  shader.fragmentShader = shader.fragmentShader.replace(
    '#include <color_fragment>',
    `#if defined( USE_COLOR_ALPHA )
       diffuseColor.rgb = mix( diffuseColor.rgb, vColor.rgb, vColor.a );
     #endif`,
  )
}

// El suelo de la isla: colinas, playa y caminos. Ver terrainData.ts para cambiar su forma.
export function Terrain() {
  const memories = useWorldStore((state) => state.memories)

  // Los caminos de tierra van del inicio a cada recuerdo: si mueves o agregas uno, se rehace el suelo
  const segments = useMemo(() => pathSegmentsFor(memories), [memories])
  const key = JSON.stringify(segments)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const { geometry, colliderVertices, colliderIndices } = useMemo(() => buildTerrain(segments), [key])

  return (
    <RigidBody key={key} type="fixed" colliders={false}>
      {/* La colisión usa la misma malla que se ve */}
      <TrimeshCollider args={[colliderVertices, colliderIndices]} />

      <Shadowed cast={false}>
        <mesh geometry={geometry}>
          <ToonMaterial color={COLORS.grass} map={grassTexture} vertexColors onBeforeCompile={mixVertexColor} />
        </mesh>
      </Shadowed>
    </RigidBody>
  )
}
