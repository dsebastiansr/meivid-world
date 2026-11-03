import type { ModelConfig } from '@/data/models'
import { Shadowed } from '../rendering/Shadowed'
import { useModel } from './useModel'

// Muestra un modelo .glb ya normalizado (tamaño, pies en el suelo, toon, sombras).
//   <GlbModel config={MODELS.banca} />
// Normalmente no lo usas directo: usa <ModelOrFallback> (con forma de respaldo).
export function GlbModel({ config }: { config: ModelConfig }) {
  const { object } = useModel(config)
  return (
    <Shadowed>
      <primitive object={object} />
    </Shadowed>
  )
}
