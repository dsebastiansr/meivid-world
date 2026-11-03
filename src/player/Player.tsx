import { useKeyboardControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Ecctrl, type EcctrlHandle } from 'ecctrl'
import { EcctrlAnimationStateController } from 'ecctrl/animation'
import { useJoystickStore } from 'ecctrl/input'
import { useRef } from 'react'
import * as THREE from 'three'
import { sfx } from '@/audio/sfx'
import { PLAYER } from '@/config'
import { useEditorStore } from '@/store/useEditorStore'
import { useGameStore } from '@/store/useGameStore'
import { Character } from './Character'
import type { Control } from './keyboardMap'
import { playerPosition } from './playerPosition'

// Distancia del centro del cuerpo físico a los pies
// (media altura de la cápsula + radio + altura de flotado de ecctrl).
const FEET_OFFSET = -0.8

const STOP = { forward: false, backward: false, leftward: false, rightward: false, run: false, joystick: { x: 0, y: 0 } }

export function Player() {
  const ecctrl = useRef<EcctrlHandle>(null)
  const model = useRef<THREE.Group>(null)
  const [, getKeys] = useKeyboardControls<Control>()

  const stepClock = useRef(0)
  const wasOnGround = useRef(true)
  const airTime = useRef(0)

  useFrame((_, delta) => {
    const controller = ecctrl.current
    if (!controller) return

    // Sonido: un paso cada cierto tiempo (más rápido al correr) y un golpecito al aterrizar
    const onGround = controller.isOnGround
    if (controller.isMoving && onGround) {
      stepClock.current += delta
      const interval = controller.runActive ? 0.28 : 0.42
      if (stepClock.current >= interval) {
        stepClock.current = 0
        sfx.step(controller.runActive)
      }
    } else {
      stepClock.current = 0.2 // el primer paso suena casi enseguida
    }
    if (!onGround) airTime.current += delta
    else {
      if (!wasOnGround.current && airTime.current > 0.2) sfx.land()
      airTime.current = 0
    }
    wasOnGround.current = onGround

    // 1. Leer teclado y joystick y mandárselo al controlador
    const isReading = useGameStore.getState().openMemoryId !== null || useEditorStore.getState().form !== null
    if (isReading) {
      controller.setMovement(STOP)
    } else {
      const keys = getKeys()
      const stick = useJoystickStore.getState().joysticks.default ?? { x: 0, y: 0 }
      controller.setMovement({ ...keys, joystick: { x: stick.x, y: stick.y } })
    }

    // 2. Compartir la posición visible del personaje (la usan cámara y recuerdos)
    model.current?.getWorldPosition(playerPosition)

    // 3. Si se cae de la isla, regresarlo al inicio
    if (controller.currPos.y < PLAYER.respawnBelowY) {
      const [x, y, z] = PLAYER.spawn
      controller.body.setTranslation({ x, y, z }, true)
      controller.body.setLinvel({ x: 0, y: 0, z: 0 }, true)
    }
  })

  return (
    <>
      {/* Calcula si el personaje está quieto / caminando / corriendo (lo lee Character.tsx) */}
      <EcctrlAnimationStateController ecctrl={ecctrl} />
      <Ecctrl
        ref={ecctrl}
        position={PLAYER.spawn}
        maxWalkVel={PLAYER.walkSpeed}
        maxRunVel={PLAYER.runSpeed}
        enableToggleRun={false}
        groundDetection="rayCast"
        // Solo puede girar sobre el eje Y: así nunca se cae de lado
        enabledRotations={[false, true, false]}
      >
        <group ref={model} position={[0, FEET_OFFSET, 0]}>
          <Character />
        </group>
      </Ecctrl>
    </>
  )
}
