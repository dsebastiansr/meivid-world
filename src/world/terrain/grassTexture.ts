import * as THREE from 'three'
import { GRASS } from '@/config'

// Textura de pasto hecha con un canvas: fondo verde + trazos cortos más oscuros.
// Se repite sobre el suelo, así se ve "dibujado a mano" sin cargar imágenes.
function createGrassTexture() {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = GRASS.base
  ctx.fillRect(0, 0, size, size)

  ctx.strokeStyle = GRASS.blades
  ctx.lineWidth = 3
  ctx.lineCap = 'round'

  // Números fijos (no Math.random) para que siempre salga igual
  let seed = 7
  const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646

  for (let i = 0; i < 90; i++) {
    const x = random() * size
    const y = random() * size
    const length = 5 + random() * 6
    const angle = -Math.PI / 2 + (random() - 0.5) * 1.2
    // Se dibuja también desplazado ±size para que el patrón se una sin costuras
    for (const dx of [-size, 0, size]) {
      for (const dy of [-size, 0, size]) {
        ctx.beginPath()
        ctx.moveTo(x + dx, y + dy)
        ctx.lineTo(x + dx + Math.cos(angle) * length, y + dy + Math.sin(angle) * length)
        ctx.stroke()
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(GRASS.repeat, GRASS.repeat)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

export const grassTexture = createGrassTexture()
