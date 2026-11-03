import { useFrame } from '@react-three/fiber'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { resolveProp } from '@/data/catalog'
import type { PlacedProp } from '@/types'
import { InstancedModel } from '../models/InstancedModel'
import { groundHeight } from '../terrain/terrainData'

// Luz de fogata: parpadea un poquito
function Fire({ position }: { position: [number, number, number] }) {
  const light = useRef<THREE.PointLight>(null)

  useFrame(({ clock }) => {
    if (!light.current) return
    const t = clock.elapsedTime
    light.current.intensity = 9 + Math.sin(t * 9) * 1.2 + Math.sin(t * 23) * 0.8
  })

  return <pointLight ref={light} position={position} color="#ff9a3c" distance={9} decay={2} />
}

interface PropViewProps {
  prop: PlacedProp
  ghost?: boolean // true = solo se ve (sin colisión ni luz): lo usa la vista previa del editor
}

// Una pieza de decoración colocada: modelo + colisión + luz (si tiene)
export function PropView({ prop, ghost = false }: PropViewProps) {
  const item = resolveProp(prop.kind, prop.variant)
  const y = groundHeight(prop.x, prop.z)
  const rotY = THREE.MathUtils.degToRad(prop.rotation)
  const placements = useMemo(
    () => [{ x: prop.x, y, z: prop.z, rotY, scale: 1 }],
    [prop.x, y, prop.z, rotY],
  )

  if (!item) return null

  return (
    <>
      <InstancedModel url={item.url} node={item.node} height={item.height} placements={placements} castShadow />
      {!ghost && item.collider && (
        <RigidBody type="fixed" colliders={false} position={[prop.x, y, prop.z]} rotation={[0, rotY, 0]}>
          <CuboidCollider
            args={[item.collider[0] / 2, item.collider[1] / 2, item.collider[2] / 2]}
            position={[0, item.collider[1] / 2, 0]}
          />
        </RigidBody>
      )}
      {!ghost && item.fire && <Fire position={[prop.x, y + 0.9, prop.z]} />}
    </>
  )
}
