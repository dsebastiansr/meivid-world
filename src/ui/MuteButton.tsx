import { Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAudioStore } from '@/audio/useAudioStore'
import { useGameStore } from '@/store/useGameStore'

// Botón para silenciar / activar la música y los efectos (arriba a la izquierda)
export function MuteButton() {
  const muted = useAudioStore((state) => state.muted)
  const toggleMuted = useAudioStore((state) => state.toggleMuted)
  const reading = useGameStore((state) => state.openMemoryId !== null)

  if (reading) return null

  return (
    <Button
      size="icon"
      variant="secondary"
      className="fixed top-4 left-4 z-30 size-10 rounded-full shadow-md"
      onClick={toggleMuted}
      aria-label={muted ? 'Activar sonido' : 'Silenciar'}
      title={muted ? 'Activar sonido' : 'Silenciar'}
    >
      {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
    </Button>
  )
}
