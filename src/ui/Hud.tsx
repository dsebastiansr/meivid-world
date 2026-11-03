import { useGameAudio } from '@/audio/useGameAudio'
import { EditorPanel } from '@/editor/EditorPanel'
import { EditorToggle } from '@/editor/EditorToggle'
import { MemoryForm } from '@/editor/MemoryForm'
import { useEditorStore } from '@/store/useEditorStore'
import { ControlsHint } from './ControlsHint'
import { InteractButton } from './InteractButton'
import { MemoryModal } from './MemoryModal'
import { MobileJoystick } from './MobileJoystick'
import { MuteButton } from './MuteButton'
import { useIsTouchDevice } from './useIsTouchDevice'

// Capa de interfaz (HTML normal) que va encima del canvas 3D.
export function Hud() {
  const isTouch = useIsTouchDevice()
  const editing = useEditorStore((state) => state.active)
  useGameAudio()

  return (
    <>
      <MuteButton />
      {isTouch ? <MobileJoystick /> : !editing && <ControlsHint />}
      <InteractButton />
      <MemoryModal />
      <EditorToggle />
      <EditorPanel />
      <MemoryForm />
    </>
  )
}
