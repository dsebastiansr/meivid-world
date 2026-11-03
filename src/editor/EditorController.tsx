import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import * as THREE from 'three'
import { resolveProp } from '@/data/catalog'
import { memoryObjects } from '@/memories/objects'
import { brushSpacing, useEditorStore, type Target } from '@/store/useEditorStore'
import { useWorldStore } from '@/store/useWorldStore'
import { groundHeight } from '@/world/terrain/terrainData'
import { pickGround, toScreen } from './picking'

const ROTATE_STEP = 15 // grados por vuelta de la rueda
const SELECT_RADIUS_PX = 46 // a cuántos píxeles de un objeto cuenta como "tocarlo"

// Escucha el ratón / el dedo sobre el mundo 3D mientras el modo editar está activo:
//  · colocando: la vista previa sigue al ratón; el clic coloca una pieza y la herramienta sigue
//    activa; si mantienes el clic y arrastras, "pinta" varias (cercas, flores…)
//  · la rueda gira la pieza y el clic derecho termina
//  · sin nada elegido: tocar un objeto lo selecciona
export function EditorController() {
  const camera = useThree((state) => state.camera)
  const canvas = useThree((state) => state.gl.domElement)

  useEffect(() => {
    const ndc = new THREE.Vector2()
    const world = new THREE.Vector3()
    const screen = new THREE.Vector2()

    // Mientras mantienes el clic pintando: dónde pusiste la última pieza
    let stroke: { x: number; z: number; spacing: number } | null = null

    const toNdc = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      ndc.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1)
      return rect
    }

    // El objeto más cercano al puntero EN PANTALLA (así los árboles altos se pueden tocar por la copa)
    const pickTarget = (rect: DOMRect): Target | null => {
      const { memories, props } = useWorldStore.getState()
      let best: Target | null = null
      let bestDistance = SELECT_RADIUS_PX

      const consider = (target: Target, x: number, z: number, height: number) => {
        world.set(x, groundHeight(x, z) + height / 2, z)
        toScreen(camera, world, screen)
        const distance = Math.hypot((screen.x - ndc.x) * rect.width * 0.5, (screen.y - ndc.y) * rect.height * 0.5)
        if (distance < bestDistance) {
          bestDistance = distance
          best = target
        }
      }

      for (const memory of memories) {
        const height = memoryObjects[memory.tipo]?.markerHeight ?? 1.2
        consider({ type: 'memory', id: memory.id }, memory.posicion[0], memory.posicion[2], height)
      }
      for (const prop of props) {
        consider({ type: 'prop', id: prop.id }, prop.x, prop.z, resolveProp(prop.kind, prop.variant)?.height ?? 1)
      }
      return best
    }

    const onMove = (event: PointerEvent) => {
      const editor = useEditorStore.getState()
      if (!editor.placing || editor.form) return
      const isMouse = event.pointerType === 'mouse'
      // Con el dedo solo se mueve mientras lo arrastras; con el ratón, al pasar por encima
      if (!isMouse && event.buttons === 0) return
      toNdc(event)
      const point = pickGround(camera, ndc)
      if (!point) return
      editor.moveGhost(point.x, point.z)

      // Pincel: manteniendo el clic, cada `spacing` metros se coloca otra pieza
      if (isMouse && stroke && event.buttons & 1) {
        if (Math.hypot(point.x - stroke.x, point.z - stroke.z) >= stroke.spacing) {
          useEditorStore.getState().commitPlacing(true)
          stroke.x = point.x
          stroke.z = point.z
        }
      }
    }

    const onDown = (event: PointerEvent) => {
      const editor = useEditorStore.getState()
      if (editor.form) return
      const rect = toNdc(event)

      if (!editor.placing) {
        editor.select(pickTarget(rect))
        return
      }

      const point = pickGround(camera, ndc)
      if (!point) return
      editor.moveGhost(point.x, point.z)

      // Con el dedo hace falta pulsar "Colocar": así puedes arrastrar hasta el lugar exacto
      if (event.pointerType !== 'mouse' || event.button !== 0) return

      const { placing } = editor
      if (placing.movingId || placing.category === 'memory') {
        editor.commitPlacing() // un recuerdo se coloca de uno en uno (cada uno lleva su formulario)
      } else {
        // Decoración: todo el trazo cuenta como un solo paso de deshacer. Guardamos cómo estaba
        // antes de la primera pieza y lo registramos solo si de verdad se colocó algo.
        const { memories, props } = useWorldStore.getState()
        if (editor.commitPlacing(true)) editor.pushUndo({ memories, props })
        stroke = { x: point.x, z: point.z, spacing: brushSpacing(placing) }
      }
    }

    const endStroke = () => {
      stroke = null
    }

    // Clic derecho: soltar la herramienta
    const onContextMenu = (event: MouseEvent) => {
      const editor = useEditorStore.getState()
      if (!editor.placing) return
      event.preventDefault()
      editor.cancelPlacing()
    }

    // La rueda del ratón gira lo que estás colocando (así no hay que mover el ratón a ningún botón)
    const onWheel = (event: WheelEvent) => {
      const editor = useEditorStore.getState()
      if (!editor.placing) return
      event.preventDefault()
      editor.rotateGhost(event.deltaY > 0 ? ROTATE_STEP : -ROTATE_STEP)
    }

    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('contextmenu', onContextMenu)
    canvas.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('pointerup', endStroke)
    window.addEventListener('pointercancel', endStroke)
    return () => {
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('contextmenu', onContextMenu)
      canvas.removeEventListener('wheel', onWheel)
      window.removeEventListener('pointerup', endStroke)
      window.removeEventListener('pointercancel', endStroke)
    }
  }, [camera, canvas])

  return null
}
