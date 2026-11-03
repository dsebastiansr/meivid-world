import type { ReactNode } from 'react'
import type { ModelConfig } from '@/data/models'
import { GlbModel } from './GlbModel'
import { ModelBoundary } from './ModelBoundary'

interface ModelOrFallbackProps {
  config: ModelConfig
  fallback: ReactNode // la forma simple (primitivas) que se usa si el GLB no carga
}

// Muestra el GLB; si el archivo falta o está dañado, muestra la forma simple de respaldo.
//   <ModelOrFallback config={MODELS.banca} fallback={<BenchPrimitive />} />
export function ModelOrFallback({ config, fallback }: ModelOrFallbackProps) {
  return (
    <ModelBoundary fallback={fallback}>
      <GlbModel config={config} />
    </ModelBoundary>
  )
}
