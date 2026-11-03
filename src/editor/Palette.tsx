import { Button } from '@/components/ui/button'
import { catalog, categories, resolveProp } from '@/data/catalog'
import { BEACH_CHAIRS_URL, NATURE_URL, PUMPKIN_1_URL, PUMPKIN_2_URL, RADIO_URL, RECORD_PLAYER_URL } from '@/data/models'
import { useEditorStore } from '@/store/useEditorStore'
import type { MemoryType } from '@/types'
import { PieceCard } from './PieceCard'
import type { PreviewSource } from './Preview'

// Los 4 tipos de recuerdo y cómo se ven en la paleta
const memoryTiles: { type: MemoryType; label: string; preview: PreviewSource }[] = [
  { type: 'banca', label: 'Banca', preview: { node: 'bench', emoji: '🪑' } },
  { type: 'buzon', label: 'Buzón', preview: { emoji: '📮' } },
  { type: 'foto', label: 'Foto', preview: { node: 'sign', emoji: '🖼️' } },
  { type: 'flor', label: 'Flor', preview: { url: NATURE_URL, node: 'Flower_3_Group', emoji: '🌷' } },
  { type: 'calabaza', label: 'Calabaza', preview: { url: PUMPKIN_1_URL, node: 'Pumpkin', emoji: '🎃' } },
  { type: 'calabaza2', label: 'Calabaza 2', preview: { url: PUMPKIN_2_URL, node: 'Pumpkin', emoji: '🎃' } },
  { type: 'sillas', label: 'Sillas de playa', preview: { url: BEACH_CHAIRS_URL, emoji: '🏖️' } },
  { type: 'tocadiscos', label: 'Tocadiscos', preview: { url: RECORD_PLAYER_URL, emoji: '🎵' } },
  { type: 'radio', label: 'Radio', preview: { url: RADIO_URL, emoji: '📻' } },
]

// Las pestañas: los recuerdos y las categorías de decoración
const tabs = [{ key: 'recuerdos', label: 'Recuerdos', emoji: '💌' }, ...categories]

// Pestañas en una cuadrícula de 2 columnas (así caben los nombres completos en un menú angosto)
export function TabBar() {
  const tab = useEditorStore((state) => state.tab)
  const setTab = useEditorStore((state) => state.setTab)

  return (
    <div className="grid grid-cols-2 gap-1 rounded-2xl bg-muted p-1">
      {tabs.map((item) => (
        <Button
          key={item.key}
          size="sm"
          variant={tab === item.key ? 'default' : 'ghost'}
          className="justify-start rounded-xl px-2"
          onClick={() => setTab(item.key)}
        >
          <span aria-hidden>{item.emoji}</span> {item.label}
        </Button>
      ))}
    </div>
  )
}

// La cuadrícula de piezas de la pestaña actual. Elegir otra cambia de herramienta sin salir;
// tocar la activa otra vez la suelta.
export function PieceList() {
  const tab = useEditorStore((state) => state.tab)
  const placing = useEditorStore((state) => state.placing)
  const lastVariants = useEditorStore((state) => state.lastVariants)
  const { startPlacing, cancelPlacing } = useEditorStore.getState()

  const active = placing && !placing.movingId ? placing : null
  const choose = (category: 'memory' | 'prop', kind: string) =>
    active?.category === category && active.kind === kind ? cancelPlacing() : startPlacing({ category, kind })

  return (
    <div className="grid grid-cols-2 gap-2">
      {tab === 'recuerdos'
        ? memoryTiles.map((item) => (
            <PieceCard
              key={item.type}
              label={item.label}
              preview={item.preview}
              active={active?.category === 'memory' && active.kind === item.type}
              onClick={() => choose('memory', item.type)}
            />
          ))
        : catalog
            .filter((family) => family.category === tab)
            .map((family) => {
              const isActive = active?.category === 'prop' && active.kind === family.key
              // La ficha muestra la variante que estás usando (o la última que usaste de esa familia)
              const shown = resolveProp(family.key, isActive ? active.variant : lastVariants[family.key])!
              return (
                <PieceCard
                  key={family.key}
                  label={family.label}
                  preview={{ url: shown.url, node: shown.node, emoji: family.emoji }}
                  active={isActive}
                  onClick={() => choose('prop', family.key)}
                />
              )
            })}
    </div>
  )
}
