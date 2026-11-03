import { Copy, Move, Pencil, RotateCcw, RotateCw, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { resolveProp } from '@/data/catalog'
import { labelFor, useEditorStore } from '@/store/useEditorStore'
import { useWorldStore } from '@/store/useWorldStore'
import { VariantGrid } from './PieceCard'
import { ROTATE_STEP } from './useEditorKeys'

// Abajo del menú cuando tocaste un objeto: mover, girar, duplicar, cambiar de variante, editar o borrar
export function SelectionPanel() {
  const selected = useEditorStore((state) => state.selected)!
  const memory = useWorldStore((state) =>
    selected.type === 'memory' ? state.memories.find((m) => m.id === selected.id) : undefined,
  )
  const prop = useWorldStore((state) =>
    selected.type === 'prop' ? state.props.find((p) => p.id === selected.id) : undefined,
  )
  const { moveSelected, duplicateSelected, rotateSelected, setSelectedVariant, editSelectedMemory, deleteSelected, select } =
    useEditorStore.getState()

  const resolved = prop ? resolveProp(prop.kind, prop.variant) : null
  const name = memory ? memory.titulo || labelFor('memory', memory.tipo) : (resolved?.label ?? '')

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <p className="min-w-0 flex-1 truncate text-sm font-extrabold">{name}</p>
        <Button size="icon" variant="ghost" onClick={() => select(null)} aria-label="Soltar selección" title="Soltar selección (Esc)">
          <X />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        <Button size="sm" variant="outline" onClick={moveSelected}>
          <Move /> Mover
        </Button>
        <Button size="sm" variant="outline" onClick={duplicateSelected}>
          <Copy /> Otra igual
        </Button>
        <Button size="sm" variant="outline" onClick={() => rotateSelected(-ROTATE_STEP)}>
          <RotateCcw /> Girar
        </Button>
        <Button size="sm" variant="outline" onClick={() => rotateSelected(ROTATE_STEP)}>
          <RotateCw /> Girar
        </Button>
        {memory && (
          <Button size="sm" className="col-span-2" onClick={editSelectedMemory}>
            <Pencil /> Editar recuerdo
          </Button>
        )}
        <Button size="sm" variant="destructive" className="col-span-2" onClick={deleteSelected}>
          <Trash2 /> Borrar
        </Button>
      </div>

      {resolved && <VariantGrid family={resolved.family} value={resolved.variant.key} onChange={setSelectedVariant} />}
    </div>
  )
}
