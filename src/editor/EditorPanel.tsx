import { Ellipsis, PanelLeftClose, PanelLeftOpen, Undo2, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useEditorStore } from '@/store/useEditorStore'
import { useWorldStore } from '@/store/useWorldStore'
import { PieceList, TabBar } from './Palette'
import { SelectionPanel } from './SelectionPanel'
import { ToolPanel } from './ToolPanel'
import { useEditorKeys } from './useEditorKeys'
import { WorldMenu } from './WorldMenu'

// ─────────────────────────────────────────────────────────────
// EL MENÚ DEL EDITOR (vertical, a un lado de la pantalla).
//
//  ┌ Encabezado ── título · deshacer · menú ⋯ · plegar
//  ├ Pestañas ──── Recuerdos · Naturaleza · Campamento · Construcciones
//  ├ Piezas ────── cuadrícula con la imagen de cada pieza (se desplaza)
//  └ Abajo ─────── lo que se está haciendo: colocar (Palette → ToolPanel)
//                  o el objeto seleccionado (SelectionPanel)
//
// En computadora va a la izquierda. En celular, a la derecha, porque a la izquierda
// está el joystick.
// ─────────────────────────────────────────────────────────────
export function EditorPanel() {
  const active = useEditorStore((state) => state.active)
  const placing = useEditorStore((state) => state.placing)
  const selected = useEditorStore((state) => state.selected)
  const canUndo = useEditorStore((state) => state.undoStack.length > 0)
  const saveError = useWorldStore((state) => state.saveError)
  const [collapsed, setCollapsed] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { undo, cancelPlacing } = useEditorStore.getState()
  useEditorKeys()

  if (!active) return null

  // Plegado: solo un botón para volver a abrirlo (y "Terminar" si estás colocando algo)
  if (collapsed) {
    return (
      <div className="fixed top-4 left-4 z-30 flex gap-2 pointer-coarse:top-16 pointer-coarse:right-4 pointer-coarse:left-auto">
        <Button variant="secondary" className="rounded-full shadow-md" onClick={() => setCollapsed(false)}>
          <PanelLeftOpen /> Paleta
        </Button>
        {placing && (
          <Button variant="secondary" className="rounded-full shadow-md" onClick={cancelPlacing}>
            <X /> Terminar
          </Button>
        )}
      </div>
    )
  }

  const moving = placing?.movingId !== undefined

  return (
    <aside className="fixed top-4 left-4 z-30 flex max-h-[calc(100%-2rem)] w-80 flex-col overflow-hidden rounded-2xl bg-background/95 shadow-lg ring-1 ring-foreground/10 select-none pointer-coarse:top-16 pointer-coarse:right-4 pointer-coarse:left-auto pointer-coarse:max-h-[calc(100%-5rem)] pointer-coarse:w-64">
      <header className="flex items-center gap-1 border-b py-1.5 pr-1.5 pl-3">
        <h2 className="flex-1 text-sm font-extrabold">Editar la isla</h2>
        <Button size="icon" variant="ghost" disabled={!canUndo} onClick={undo} aria-label="Deshacer (Ctrl+Z)" title="Deshacer (Ctrl+Z)">
          <Undo2 />
        </Button>
        <Button
          size="icon"
          variant={menuOpen ? 'secondary' : 'ghost'}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Exportar, importar, restaurar"
          title="Exportar, importar, restaurar"
        >
          <Ellipsis />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => setCollapsed(true)} aria-label="Ocultar paleta" title="Ocultar paleta">
          <PanelLeftClose />
        </Button>
      </header>

      {menuOpen && <WorldMenu />}

      {/* Mientras mueves algo que ya existía no hace falta la paleta */}
      {!moving && (
        <>
          <div className="p-2 pb-0">
            <TabBar />
          </div>
          <div className="min-h-0 flex-1 touch-pan-y overflow-y-auto p-2">
            <PieceList />
          </div>
        </>
      )}

      <footer className="max-h-[50vh] touch-pan-y overflow-y-auto border-t bg-muted/40 p-2.5">
        {placing ? (
          <ToolPanel />
        ) : selected ? (
          <SelectionPanel />
        ) : (
          <p className="text-xs text-muted-foreground">Elige una pieza para colocarla, o toca un objeto de la isla para editarlo.</p>
        )}
        {saveError && (
          <p className="mt-2 text-xs font-bold text-destructive">
            Este navegador no pudo guardar tus cambios (¿demasiadas fotos pesadas?). Usa Exportar para no perderlos.
          </p>
        )}
      </footer>
    </aside>
  )
}
