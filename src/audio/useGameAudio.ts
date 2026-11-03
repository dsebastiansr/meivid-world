import { useEffect } from 'react'
import { useEditorStore } from '@/store/useEditorStore'
import { useGameStore } from '@/store/useGameStore'
import { useWorldStore } from '@/store/useWorldStore'
import { applyMuted, playTrack, startMusic } from './music'
import { sfx, unlockSfx } from './sfx'
import { HOME_SONG, trackFor } from './songs'
import { useAudioStore } from './useAudioStore'

// Conecta el sonido con el resto del juego SIN tocar esos módulos: escucha sus stores y
// reacciona. Se usa una sola vez (en Hud). Los pasos van en player/Player.tsx y el pase de hoja en ui/book/Book.tsx.
export function useGameAudio() {
  useEffect(() => {
    startMusic()
    playTrack({ src: HOME_SONG, start: 0 })

    // El primer toque/tecla desbloquea el sonido del navegador
    const unlock = () => unlockSfx()
    window.addEventListener('pointerdown', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })

    // Clic en cualquier botón de la interfaz
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement
      if (target.closest?.('button, [role="button"]')) sfx.click()
    }
    window.addEventListener('pointerdown', onPointerDown, true)

    const unsubscribers = [
      // Silencio
      useAudioStore.subscribe((state, prev) => {
        if (state.muted !== prev.muted) applyMuted(state.muted)
      }),

      // Recuerdo abierto: su canción y el libro. Cerrado: vuelve la de la isla
      useGameStore.subscribe((state, prev) => {
        if (state.openMemoryId !== prev.openMemoryId) {
          if (state.openMemoryId) {
            const memory = useWorldStore.getState().memories.find((m) => m.id === state.openMemoryId)
            playTrack(trackFor(memory))
            sfx.bookOpen()
          } else {
            playTrack({ src: HOME_SONG, start: 0 }) // el sonido de cerrar suena al empezar la animación (MemoryModal)
          }
        }
        if (state.nearbyMemoryId && state.nearbyMemoryId !== prev.nearbyMemoryId && !state.openMemoryId) sfx.near()
      }),

      // Editor: colocar / borrar (también cubre deshacer)
      useWorldStore.subscribe((state, prev) => {
        if (!useEditorStore.getState().active) return
        const before = prev.props.length + prev.memories.length
        const after = state.props.length + state.memories.length
        if (after > before) sfx.place()
        else if (after < before) sfx.remove()
      }),
      useEditorStore.subscribe((state, prev) => {
        if (state.active !== prev.active) sfx.toggle(state.active)
        else if (state.selected && state.selected.id !== prev.selected?.id) sfx.select()
        else if (state.ghost.rotation !== prev.ghost.rotation) sfx.rotate()
      }),
    ]

    return () => {
      window.removeEventListener('pointerdown', onPointerDown, true)
      unsubscribers.forEach((off) => off())
    }
  }, [])
}
