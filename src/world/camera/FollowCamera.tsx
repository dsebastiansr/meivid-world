import { useFrame, useThree } from '@react-three/fiber'
import { useMemo } from 'react'
import * as THREE from 'three'
import { CAMERA } from '@/config'
import { playerPosition } from '@/player/playerPosition'

// Cámara en tercera persona: siempre mira al personaje desde el mismo ángulo
// (arriba y un poco atrás) y lo sigue suavemente.
export function FollowCamera() {
  const camera = useThree((state) => state.camera)
  const target = useMemo(() => playerPosition.clone(), [])
  const offset = useMemo(() => new THREE.Vector3(...CAMERA.offset), [])

  useFrame((_, delta) => {
    // "lerp" = acercarse un porcentaje cada frame → movimiento suave
    const smoothing = 1 - Math.exp(-CAMERA.followSpeed * delta)
    target.lerp(playerPosition, smoothing)

    camera.position.copy(target).add(offset)
    camera.lookAt(target.x, target.y + CAMERA.lookAtHeight, target.z)
  })

  return null
}
