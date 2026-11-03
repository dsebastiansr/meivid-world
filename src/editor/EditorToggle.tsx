import { Check, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEditorStore } from '@/store/useEditorStore'
import { useGameStore } from '@/store/useGameStore'

// Botón de arriba a la derecha para entrar y salir del modo editar
export function EditorToggle() {
  const active = useEditorStore((state) => state.active)
  const setActive = useEditorStore((state) => state.setActive)
  const reading = useGameStore((state) => state.openMemoryId !== null)

  if (reading) return null

  return (
    <Button
      variant={active ? 'default' : 'secondary'}
      className="fixed top-4 right-4 z-30 h-10 gap-2 rounded-full px-4 font-bold shadow-md"
      onClick={() => setActive(!active)}
    >
      {active ? <Check className="size-4" /> : <Pencil className="size-4" />}
      {active ? 'Listo' : 'Editar'}
    </Button>
  )
}
