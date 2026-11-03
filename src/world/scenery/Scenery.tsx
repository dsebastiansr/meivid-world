import { CuboidCollider, CylinderCollider, RigidBody } from '@react-three/rapier'
import { Suspense, useMemo } from 'react'
import { useWorldStore } from '@/store/useWorldStore'
import { InstancedModel } from '../models/InstancedModel'
import { ModelBoundary } from '../models/ModelBoundary'
import { filterScenery } from './scatter'

// Todo lo que se reparte solo por la isla: árboles, rocas, arbustos, flores, pasto…
// (la lista y las zonas están en scatter.ts). Cada variante se dibuja con instancias.
export function Scenery() {
  const memories = useWorldStore((state) => state.memories)
  const props = useWorldStore((state) => state.props)

  // Si pones algo encima de un árbol o flor repartido, ese se quita (no se vuelve a repartir nada)
  const scenery = useMemo(() => filterScenery(memories, props), [memories, props])

  return (
    <>
      <ModelBoundary fallback={null}>
        {/* Suspense: si el GLB tarda en cargar, la isla aparece primero sin adornos */}
        <Suspense fallback={null}>
          {scenery.groups.map((group) => (
            <InstancedModel
              key={group.key}
              url={group.url}
              node={group.node}
              height={group.height}
              placements={group.placements}
              castShadow={group.castShadow}
            />
          ))}
        </Suspense>
      </ModelBoundary>

      {/* Colisiones: solo el tronco de los árboles y una caja por roca */}
      <RigidBody type="fixed" colliders={false}>
        {scenery.treeColliders.map((tree, i) => (
          <CylinderCollider
            key={`tree-${i}`}
            args={[tree.height / 2, tree.radius]}
            position={[tree.x, tree.y + tree.height / 2, tree.z]}
          />
        ))}
        {scenery.rockColliders.map((rock, i) => (
          <CuboidCollider
            key={`rock-${i}`}
            args={rock.half}
            position={[rock.x, rock.y + rock.half[1], rock.z]}
            rotation={[0, rock.rotY, 0]}
          />
        ))}
      </RigidBody>
    </>
  )
}
