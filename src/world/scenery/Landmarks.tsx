import { Suspense } from 'react'
import { useEditorStore } from '@/store/useEditorStore'
import { useWorldStore } from '@/store/useWorldStore'
import { ModelBoundary } from '../models/ModelBoundary'
import { PropView } from './PropView'

// Toda la decoración colocada a mano: fogata, tienda, cercas, árboles sueltos…
// Viene de useWorldStore (empieza con src/data/decorations.ts y el modo editar la cambia).
export function Landmarks() {
  const props = useWorldStore((state) => state.props)
  const movingId = useEditorStore((state) => state.placing?.movingId)

  return (
    <ModelBoundary fallback={null}>
      <Suspense fallback={null}>
        {props
          .filter((prop) => prop.id !== movingId)
          .map((prop) => (
            <PropView key={prop.id} prop={prop} />
          ))}
      </Suspense>
    </ModelBoundary>
  )
}
