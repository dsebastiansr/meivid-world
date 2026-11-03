import * as THREE from 'three'
import { PLAYER } from '@/config'

// Posición actual del personaje, compartida con la cámara y los recuerdos.
// Es un objeto que se actualiza cada frame (no es estado de React a propósito,
// así no se re-dibuja la interfaz 60 veces por segundo).
export const playerPosition = new THREE.Vector3(...PLAYER.spawn)
