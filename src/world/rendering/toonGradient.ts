import * as THREE from 'three'
import { TOON } from '@/config'

// Textura de 1 pixel de alto que le dice al material toon cuántos
// escalones de luz usar (ver TOON en config.ts). NearestFilter evita el degradado.
const data = new Uint8Array(TOON.shades.map((shade) => Math.round(shade * 255)))
export const toonGradient = new THREE.DataTexture(data, data.length, 1, THREE.RedFormat)
toonGradient.minFilter = THREE.NearestFilter
toonGradient.magFilter = THREE.NearestFilter
toonGradient.needsUpdate = true
