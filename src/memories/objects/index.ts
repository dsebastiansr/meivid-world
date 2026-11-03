import { createElement, type ComponentType } from 'react'
import { MODELS, type ModelConfig } from '@/data/models'
import type { MemoryType } from '@/types'
import { ModelOrFallback } from '@/world/models/ModelOrFallback'
import { BeachChairs } from './BeachChairs'
import { Bench } from './Bench'
import { Flower } from './Flower'
import { Mailbox } from './Mailbox'
import { PhotoFrame } from './PhotoFrame'
import { Pumpkin } from './Pumpkin'
import { RecordPlayer } from './RecordPlayer'

// Qué se dibuja para cada "tipo" de memories.json.
//  Model        → el GLB de src/data/models.ts, o la forma simple si no existe el archivo
//  markerHeight → a qué altura flota el diamante amarillo
//  collider     → caja de colisión invisible: [ancho, alto, fondo] en metros
//                 (no depende del modelo, así no cambia aunque cargue después)
interface MemoryObject {
  Model: ComponentType
  markerHeight: number
  collider: [number, number, number]
}

// Junta un GLB con su forma de respaldo en un solo componente
function withModel(config: ModelConfig, Fallback: ComponentType): ComponentType {
  return function Model() {
    return createElement(ModelOrFallback, { config, fallback: createElement(Fallback) })
  }
}

export const memoryObjects: Record<MemoryType, MemoryObject> = {
  banca: { Model: withModel(MODELS.banca, Bench), markerHeight: 1.7, collider: [1.05, 1.2, 0.55] },
  buzon: { Model: withModel(MODELS.buzon, Mailbox), markerHeight: 1.9, collider: [0.5, 1.4, 0.6] },
  foto: { Model: withModel(MODELS.foto, PhotoFrame), markerHeight: 1.7, collider: [0.95, 1.3, 0.3] },
  flor: { Model: withModel(MODELS.flor, Flower), markerHeight: 1.3, collider: [0.5, 0.9, 0.5] },
  calabaza: { Model: withModel(MODELS.calabaza, Pumpkin), markerHeight: 1.5, collider: [0.9, 0.9, 0.9] },
  calabaza2: { Model: withModel(MODELS.calabaza2, Pumpkin), markerHeight: 1.5, collider: [1.4, 0.9, 1.4] },
  // La sombrilla es alta pero su techo queda sobre la cabeza: la colisión solo cubre las sillas
  sillas: { Model: withModel(MODELS.sillas, BeachChairs), markerHeight: 2.7, collider: [1.9, 1.1, 1.9] },
  tocadiscos: { Model: withModel(MODELS.tocadiscos, RecordPlayer), markerHeight: 1.1, collider: [1.5, 0.5, 1.85] },
  radio: { Model: withModel(MODELS.radio, RecordPlayer), markerHeight: 1.2, collider: [1, 1, 1]}
}
