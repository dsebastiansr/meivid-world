import { sfx } from '@/audio/sfx'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { useGameStore } from '@/store/useGameStore'
import { useWorldStore } from '@/store/useWorldStore'
import { useState } from 'react'
import { Book } from './book/Book'

// La ventana del recuerdo: un libro grande con portada de cuero (ver ui/book/).
// El fondo café NO es de este diálogo: es el marco del libro (`frame` en Book.tsx), que se anima al abrirse.
// Usa el Dialog de shadcn: ya trae cerrar con Esc y clic afuera.
export function MemoryModal() {
  const openId = useGameStore((state) => state.openMemoryId)
  const closeMemory = useGameStore((state) => state.closeMemory)
  const memory = useWorldStore((state) => state.memories.find((m) => m.id === openId) ?? null)

  // Guardamos el último recuerdo mostrado para que no se vacíe
  // mientras corre la animación de cierre.
  const [shown, setShown] = useState(memory)
  if (memory && memory !== shown) setShown(memory)

  // Al cerrar (Esc, clic afuera) primero corre la animación de salida del libro y recién después se cierra el diálogo
  const [closing, setClosing] = useState(false)
  const requestClose = () => {
    if (closing) return
    setClosing(true)
    sfx.bookClose()
  }
  const finishClose = () => {
    closeMemory()
    setClosing(false)
  }

  return (
    <Dialog open={memory !== null} onOpenChange={(open) => !open && requestClose()}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[min(92vh,720px)] w-[min(97vw,1100px)] max-w-none touch-pan-y flex-col gap-0 rounded-3xl border-0 bg-transparent p-3 shadow-none ring-0 select-text sm:max-w-none"
      >
        {/* Para lectores de pantalla (no se ven: el título está dentro del libro) */}
        <DialogTitle className="sr-only">{shown?.titulo}</DialogTitle>
        <DialogDescription className="sr-only">Recuerdo con fotos y texto, en forma de libro.</DialogDescription>
        {/* key: al abrir otro recuerdo, el libro vuelve a la primera hoja */}
        {shown && <Book key={shown.id} memory={shown} closing={closing} onExited={finishClose} />}
      </DialogContent>
    </Dialog>
  )
}
