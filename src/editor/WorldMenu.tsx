import { Download, History, Upload } from 'lucide-react'
import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { useEditorStore } from '@/store/useEditorStore'
import { useWorldStore } from '@/store/useWorldStore'

// Exportar / importar / restaurar la isla
export function WorldMenu() {
  const input = useRef<HTMLInputElement>(null)

  const exportWorld = () => {
    const blob = new Blob([useWorldStore.getState().exportData()], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'nuestra-isla.json'
    link.click()
    URL.revokeObjectURL(link.href)
  }

  const importWorld = async (file: File) => {
    useEditorStore.getState().pushUndo()
    const ok = useWorldStore.getState().importData(await file.text())
    if (!ok) {
      useEditorStore.getState().undo()
      window.alert('Ese archivo no es una isla válida.')
    }
  }

  const resetWorld = () => {
    if (window.confirm('¿Volver la isla a como venía de fábrica? (Puedes deshacerlo con el botón de deshacer.)')) {
      useEditorStore.getState().pushUndo()
      useWorldStore.getState().resetWorld()
    }
  }

  return (
    <div className="flex flex-col gap-1.5 border-b p-2">
      <Button size="sm" variant="outline" className="justify-start" onClick={exportWorld}>
        <Download /> Exportar isla
      </Button>
      <Button size="sm" variant="outline" className="justify-start" onClick={() => input.current?.click()}>
        <Upload /> Importar isla
      </Button>
      <Button size="sm" variant="outline" className="justify-start" onClick={resetWorld}>
        <History /> Restaurar isla de fábrica
      </Button>
      <input
        ref={input}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) importWorld(file)
          event.target.value = ''
        }}
      />
    </div>
  )
}
