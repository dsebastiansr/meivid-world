import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type * as THREE from 'three'
import { COLORS } from '@/config'
import { ToonMaterial } from '../rendering/ToonMaterial'

// Nubes low poly que pasan despacito. Agrega o mueve las tuyas aquí:
// [x, y, z] y tamaño. Están lejos de la isla para no tapar la vista.
const clouds: { position: [number, number, number]; scale: number }[] = [
  { position: [-30, 13, -20], scale: 1.6 },
  { position: [26, 15, -34], scale: 2 },
  { position: [38, 12, 12], scale: 1.3 },
  { position: [-36, 14, 18], scale: 1.8 },
  { position: [4, 16, -46], scale: 2.2 },
]

const DRIFT_SPEED = 0.4 // metros por segundo
const WRAP = 60 // al llegar a esta distancia en x, la nube reaparece del otro lado

function Cloud({ position, scale }: { position: [number, number, number]; scale: number }) {
  const group = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    const cloud = group.current
    if (!cloud) return
    cloud.position.x += DRIFT_SPEED * delta
    if (cloud.position.x > WRAP) cloud.position.x = -WRAP
  })

  return (
    <group ref={group} position={position} scale={scale}>
      <mesh position={[0, 0, 0]}>
        <icosahedronGeometry args={[1.5, 1]} />
        <ToonMaterial color={COLORS.cloud} flatShading />
      </mesh>
      <mesh position={[1.6, -0.3, 0.2]}>
        <icosahedronGeometry args={[1.1, 1]} />
        <ToonMaterial color={COLORS.cloud} flatShading />
      </mesh>
      <mesh position={[-1.5, -0.4, -0.1]}>
        <icosahedronGeometry args={[1, 1]} />
        <ToonMaterial color={COLORS.cloud} flatShading />
      </mesh>
    </group>
  )
}

export function Clouds() {
  return (
    <>
      {clouds.map((cloud, i) => (
        <Cloud key={i} {...cloud} />
      ))}
    </>
  )
}
