import { useEffect } from 'react'
import { useEditorStore } from '@/store/useEditorStore'

export const ROTATE_STEP = 15 // grados por toque o por tecla

// Atajos de teclado del editor (en computadora):
//  R gira (Shift+R al revés) · Enter coloca · Esc termina · Supr borra lo seleccionado · Ctrl+Z deshace
export function useEditorKeys() {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const editor = useEditorStore.getState()
      if (!editor.active || editor.form) return
      if ((event.target as HTMLElement).closest('input, textarea')) return

      if ((event.ctrlKey || event.metaKey) && event.code === 'KeyZ') {
        event.preventDefault()
        editor.undo()
      } else if (event.code === 'KeyR') {
        const step = event.shiftKey ? -ROTATE_STEP : ROTATE_STEP
        if (editor.placing) editor.rotateGhost(step)
        else editor.rotateSelected(step)
      } else if (event.code === 'Enter' && editor.placing) {
        if ((event.target as HTMLElement).closest('button')) return
        editor.commitPlacing()
      } else if (event.code === 'Escape') {
        if (editor.placing) editor.cancelPlacing()
        else editor.select(null)
      } else if ((event.code === 'Delete' || event.code === 'Backspace') && editor.selected && !editor.placing) {
        editor.deleteSelected()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
