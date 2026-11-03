import { KeyboardControls, PerformanceMonitor } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense, useState } from 'react'
import { CAMERA, PLAYER, RESOLUTION, SHADOWS, TOUCH } from './config'
import { keyboardMap } from './player/keyboardMap'
import { Hud } from './ui/Hud'
import './world/rendering/curvedWorld' // activa el mundo curvo (debe cargarse antes de dibujar)
import { Scene } from './world/Scene'

const [sx, sy, sz] = PLAYER.spawn
const [ox, oy, oz] = CAMERA.offset

export default function App() {
  // La resolución sube y baja sola según qué tan fluido vaya (PerformanceMonitor)
  const [dpr, setDpr] = useState(Math.min(RESOLUTION.max, window.devicePixelRatio))

  return (
    <KeyboardControls map={keyboardMap}>
      {/* dpr limita la resolución en pantallas muy densas: ayuda mucho en iPad y celular.
          Sin antialias en pantallas táctiles: a esa resolución casi no se nota y cuesta mucho */}
      <Canvas
        flat
        dpr={dpr}
        gl={{ antialias: !TOUCH, powerPreference: 'high-performance' }}
        shadows={SHADOWS.enabled ? 'percentage' : false}
        camera={{ fov: CAMERA.fov, position: [sx + ox, sy + oy, sz + oz] }}
      >
        <PerformanceMonitor
          flipflops={3}
          onChange={({ factor }) => setDpr(RESOLUTION.min + (RESOLUTION.max - RESOLUTION.min) * factor)}
        />
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>

      {/* Interfaz HTML encima del 3D: botón, modal, joystick */}
      <Hud />
    </KeyboardControls>
  )
}
