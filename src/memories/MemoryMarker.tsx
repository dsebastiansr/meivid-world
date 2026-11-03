import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { COLORS } from '@/config'

interface MemoryMarkerProps {
  height: number
  active: boolean // true cuando el personaje está cerca
}

// Diamante amarillo que flota y gira encima de cada recuerdo.
export function MemoryMarker({ height, active }: MemoryMarkerProps) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime
    ref.current.position.y = height + Math.sin(t * 2) * 0.1
    ref.current.rotation.y = t * 1.5
    const targetScale = active ? 1.4 : 1
    ref.current.scale.setScalar(THREE.MathUtils.lerp(ref.current.scale.x, targetScale, 0.15))
  })

  return (
    <mesh ref={ref} position={[0, height, 0]}>
      <octahedronGeometry args={[0.16, 0]} />
      <meshBasicMaterial color={active ? '#ffffff' : COLORS.marker} />
    </mesh>
  )
}
