import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type * as THREE from 'three'
import { LIGHTS, SHADOWS } from '@/config'
import { playerPosition } from '@/player/playerPosition'

const [ox, oy, oz] = LIGHTS.sunOffset

// El sol. Para que las sombras sean baratas (importante en celular), el
// "cuadro" de sombras es pequeño y viaja junto al personaje: solo se
// dibujan sombras en el área de alrededor (ver SHADOWS en config.ts).
export function Sun() {
  const light = useRef<THREE.DirectionalLight>(null)

  useFrame(() => {
    const sun = light.current
    if (!sun) return
    sun.position.set(playerPosition.x + ox, playerPosition.y + oy, playerPosition.z + oz)
    sun.target.position.copy(playerPosition)
    sun.target.updateMatrixWorld()
  })

  const { area } = SHADOWS

  return (
    <directionalLight
      ref={light}
      intensity={LIGHTS.sun}
      color={LIGHTS.sunColor}
      position={LIGHTS.sunOffset}
      castShadow={SHADOWS.enabled}
      shadow-mapSize={[SHADOWS.mapSize, SHADOWS.mapSize]}
      shadow-camera-left={-area}
      shadow-camera-right={area}
      shadow-camera-top={area}
      shadow-camera-bottom={-area}
      shadow-camera-near={1}
      shadow-camera-far={40}
      shadow-radius={SHADOWS.softness}
      shadow-bias={-0.0005}
      shadow-normalBias={0.04}
    />
  )
}
