import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useEditorStore } from '@/store/useEditorStore'
import { useGameStore } from '@/store/useGameStore'
import { useWorldStore } from '@/store/useWorldStore'
import { Heart } from 'lucide-react'
import { useEffect } from 'react'

// Botón "Ver recuerdo" que aparece cuando estás cerca de un objeto.
// En computadora también se puede abrir con la tecla E o Enter.
export function InteractButton() {
  const nearbyId = useGameStore((state) => state.nearbyMemoryId)
  const openId = useGameStore((state) => state.openMemoryId)
  const openMemory = useGameStore((state) => state.openMemory)
  const memory = useWorldStore((state) => state.memories.find((m) => m.id === nearbyId) ?? null)
  const editing = useEditorStore((state) => state.active)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'KeyE' && event.code !== 'Enter') return
      // Si estás en un botón o escribiendo en un campo, la tecla es para eso
      if ((event.target as HTMLElement).closest('button, input, textarea')) return
      if (useEditorStore.getState().active) return // en modo editar, Enter y E son del editor
      const { nearbyMemoryId, openMemoryId } = useGameStore.getState()
      if (nearbyMemoryId && !openMemoryId) openMemory(nearbyMemoryId)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [openMemory])

  if (!memory || openId || editing) return null

  return (
    <Button
      onClick={() => openMemory(memory.id)}
      className={cn(
        // Posición: abajo al centro…
        'fixed bottom-[max(2rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2',
        // …y en celular (pointer-coarse) a la derecha, lejos del joystick
        'pointer-coarse:right-4 pointer-coarse:left-auto pointer-coarse:translate-x-0',
        // Estilo: grande, redondo, con sombrita que se "aplasta" al tocarlo
        'h-12 gap-2 rounded-full px-7 text-lg font-extrabold',
        'shadow-[0_5px_0_var(--primary-shadow)] hover:bg-primary',
        'active:translate-y-[3px] active:shadow-[0_2px_0_var(--primary-shadow)]',
        // Animación de entrada
        'animate-in fade-in-0 zoom-in-90',
      )}
    >
      <Heart className="size-5 fill-current" />
      Ver recuerdo
    </Button>
  )
}
