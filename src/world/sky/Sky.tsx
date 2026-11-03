import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { COLORS } from '@/config'

// Cielo: una esfera enorme (vista desde adentro) con degradado.
// En el horizonte tiene el mismo color que la niebla, así el agua lejana
// se funde con el cielo sin que se note el borde.
const vertexShader = /* glsl */ `
  varying vec3 vDirection;
  void main() {
    vDirection = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uHorizon;
  uniform vec3 uTop;
  varying vec3 vDirection;
  void main() {
    float height = clamp(vDirection.y, 0.0, 1.0);
    gl_FragColor = vec4(mix(uHorizon, uTop, pow(height, 0.6)), 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

export function Sky() {
  const mesh = useRef<THREE.Mesh>(null)
  const uniforms = useMemo(
    () => ({
      uHorizon: { value: new THREE.Color(COLORS.sky) },
      uTop: { value: new THREE.Color(COLORS.skyTop) },
    }),
    [],
  )

  // El cielo siempre acompaña a la cámara, así nunca te acercas a él
  useFrame(({ camera }) => mesh.current?.position.copy(camera.position))

  return (
    <mesh ref={mesh} renderOrder={-1} frustumCulled={false}>
      <sphereGeometry args={[400, 24, 12]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
        fog={false}
      />
    </mesh>
  )
}
