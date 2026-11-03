import { useFrame } from '@react-three/fiber'
import { Suspense, useRef } from 'react'
import * as THREE from 'three'
import { resolveProp } from '@/data/catalog'
import { memoryObjects } from '@/memories/objects'
import { isValidSpot, useEditorStore } from '@/store/useEditorStore'
import { useWorldStore } from '@/store/useWorldStore'
import { PropView } from '@/world/scenery/PropView'
import { groundHeight } from '@/world/terrain/terrainData'
import { EditorController } from './EditorController'

// Anillo en el suelo que marca un lugar (verde = se puede, rojo = no, blanco = seleccionado)
function Ring({ x, z, radius, color, pulse = false }: { x: number; z: number; radius: number; color: string; pulse?: boolean }) {
  const mesh = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (pulse && mesh.current) mesh.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 5) * 0.06)
  })

  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} position={[x, groundHeight(x, z) + 0.08, z]} renderOrder={10}>
      <ringGeometry args={[radius * 0.88, radius, 48]} />
      <meshBasicMaterial color={color} transparent opacity={0.95} depthTest={false} depthWrite={false} />
    </mesh>
  )
}

// Vista previa de lo que estás colocando
function Ghost() {
  const placing = useEditorStore((state) => state.placing)
  const ghost = useEditorStore((state) => state.ghost)
  const formOpen = useEditorStore((state) => state.form !== null)
  if (!placing || formOpen) return null // con el formulario abierto, la vista previa se oculta

  const valid = isValidSpot(ghost.x, ghost.z)
  const radius = placing.category === 'prop' ? Math.max(0.7, (resolveProp(placing.kind, placing.variant)?.clearance ?? 1) * 0.6) : 1.1

  const MemoryModel = placing.category === 'memory' ? memoryObjects[placing.kind as keyof typeof memoryObjects]?.Model : null

  return (
    <>
      <Suspense fallback={null}>
        {placing.category === 'prop' ? (
          <PropView ghost prop={{ id: 'ghost', kind: placing.kind, variant: placing.variant, x: ghost.x, z: ghost.z, rotation: ghost.rotation }} />
        ) : (
          MemoryModel && (
            <group
              position={[ghost.x, groundHeight(ghost.x, ghost.z), ghost.z]}
              rotation={[0, THREE.MathUtils.degToRad(ghost.rotation), 0]}
            >
              <MemoryModel />
            </group>
          )
        )}
      </Suspense>
      <Ring x={ghost.x} z={ghost.z} radius={radius} color={valid ? '#4ade80' : '#f87171'} pulse />
    </>
  )
}

// Anillo alrededor del objeto seleccionado
function SelectionRing() {
  const selected = useEditorStore((state) => state.selected)
  const placing = useEditorStore((state) => state.placing)
  const memories = useWorldStore((state) => state.memories)
  const props = useWorldStore((state) => state.props)
  if (!selected || placing) return null

  if (selected.type === 'memory') {
    const memory = memories.find((m) => m.id === selected.id)
    return memory ? <Ring x={memory.posicion[0]} z={memory.posicion[2]} radius={1.1} color="#ffffff" pulse /> : null
  }
  const prop = props.find((p) => p.id === selected.id)
  if (!prop) return null
  return <Ring x={prop.x} z={prop.z} radius={Math.max(0.7, (resolveProp(prop.kind, prop.variant)?.clearance ?? 1) * 0.6)} color="#ffffff" pulse />
}

// Todo lo del editor que vive dentro del mundo 3D (solo existe con el modo editar activo)
export function EditorLayer() {
  const active = useEditorStore((state) => state.active)
  if (!active) return null

  return (
    <>
      <EditorController />
      <Ghost />
      <SelectionRing />
    </>
  )
}
