import { Check, RotateCcw, RotateCw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { findFamily, resolveProp } from '@/data/catalog'
import { isValidSpot, labelFor, useEditorStore } from '@/store/useEditorStore'
import { VariantGrid } from './PieceCard'
import { ROTATE_STEP } from './useEditorKeys'

// Abajo del menú mientras colocas algo: su nombre, las variantes y los controles.
// (Moviendo algo que ya existía: sin variantes y con "Cancelar".)
export function ToolPanel() {
  const placing = useEditorStore((state) => state.placing)!
  const ghost = useEditorStore((state) => state.ghost)
  const { rotateGhost, commitPlacing, cancelPlacing, setPlacingVariant } = useEditorStore.getState()
  const valid = isValidSpot(ghost.x, ghost.z)
  const moving = placing.movingId !== undefined
  const family = placing.category === 'prop' ? findFamily(placing.kind) : undefined
  const variantKey = placing.category === 'prop' ? resolveProp(placing.kind, placing.variant)?.variant.key : undefined

  return (
    <div className="flex flex-col gap-2">
      <div>
        <p className="truncate text-sm font-extrabold">
          {moving ? 'Moviendo' : 'Colocando'}: {labelFor(placing.category, placing.kind, placing.variant)}
        </p>
        <p className={valid ? 'text-xs text-muted-foreground' : 'text-xs font-bold text-destructive'}>
          {!valid ? (
            'Muy cerca del agua: elige otro lugar'
          ) : (
            <>
              <span className="pointer-coarse:hidden">
                {moving
                  ? 'Clic donde lo quieras · rueda o R gira · Esc cancela'
                  : 'Clic coloca · mantén y arrastra para pintar · rueda o R gira · clic derecho o Esc termina'}
              </span>
              <span className="hidden pointer-coarse:inline">
                {moving ? 'Toca o arrastra y pulsa Colocar' : 'Toca o arrastra, pulsa Colocar. Sigues hasta Terminar'}
              </span>
            </>
          )}
        </p>
      </div>

      {!moving && family && variantKey && <VariantGrid family={family} value={variantKey} onChange={setPlacingVariant} />}

      <div className="flex flex-wrap gap-2">
        <Button size="icon" variant="outline" onClick={() => rotateGhost(-ROTATE_STEP)} aria-label="Girar a la izquierda">
          <RotateCcw />
        </Button>
        <Button size="icon" variant="outline" onClick={() => rotateGhost(ROTATE_STEP)} aria-label="Girar a la derecha">
          <RotateCw />
        </Button>
        {/* Con ratón no hace falta: el clic en el suelo coloca. Con el dedo sí. */}
        <Button className="hidden pointer-coarse:inline-flex" disabled={!valid} onClick={() => commitPlacing()}>
          <Check /> Colocar
        </Button>
        <Button size="sm" className="ml-auto h-8" variant={moving ? 'ghost' : 'secondary'} onClick={cancelPlacing}>
          <X /> {moving ? 'Cancelar' : 'Terminar'}
        </Button>
      </div>
    </div>
  )
}
