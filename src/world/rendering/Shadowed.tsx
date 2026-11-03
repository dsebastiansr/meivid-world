import { useLayoutEffect, useRef, type ReactNode } from 'react'
import type * as THREE from 'three'
import { SHADOWS } from '@/config'

interface ShadowedProps {
  cast?: boolean // ¿proyecta sombra?
  receive?: boolean // ¿recibe sombra de otros?
  children: ReactNode
}

// Envuelve cualquier objeto 3D para que sus mallas proyecten / reciban sombras,
// sin tener que marcar cada <mesh> a mano:
//   <Shadowed><Bench /></Shadowed>
export function Shadowed({ cast = true, receive = true, children }: ShadowedProps) {
  const group = useRef<THREE.Group>(null)

  useLayoutEffect(() => {
    group.current?.traverse((object) => {
      if (!(object as THREE.Mesh).isMesh) return
      object.castShadow = cast && SHADOWS.enabled
      object.receiveShadow = receive && SHADOWS.enabled
    })
  }, [cast, receive])

  return <group ref={group}>{children}</group>
}
