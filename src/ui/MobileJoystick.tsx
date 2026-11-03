import { Joystick } from 'ecctrl/input'

// Joystick virtual de ecctrl (abajo a la izquierda). El personaje lo lee
// en src/player/Player.tsx a través de useJoystickStore.
export function MobileJoystick() {
  return (
    <Joystick
      joystickWrapperStyle={{ left: '8px', bottom: '8px' }}
      joystickBaseStyle={{ background: 'rgba(255, 255, 255, 0.25)', border: '3px solid rgba(255, 255, 255, 0.9)' }}
      joystickKnobStyle={{ background: 'rgba(255, 182, 201, 0.95)' }}
    />
  )
}
