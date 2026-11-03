import type { KeyboardControlsEntry } from '@react-three/drei'

export type Control = 'forward' | 'backward' | 'leftward' | 'rightward' | 'run'

// Teclas del juego. Puedes agregar más (por ejemplo Space para saltar).
export const keyboardMap: KeyboardControlsEntry<Control>[] = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'leftward', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'rightward', keys: ['ArrowRight', 'KeyD'] },
  { name: 'run', keys: ['ShiftLeft', 'ShiftRight'] },
]
