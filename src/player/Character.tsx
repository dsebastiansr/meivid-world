import { useAnimations } from '@react-three/drei'
import { useEcctrlAnimationStore } from 'ecctrl/animation'
import { Suspense, useEffect } from 'react'
import { CHARACTER, type CharacterAnimation } from '@/data/models'
import { ModelBoundary } from '@/world/models/ModelBoundary'
import { Shadowed } from '@/world/rendering/Shadowed'
import { useModelExists } from '@/world/models/useModelExists'
import { useModel } from '@/world/models/useModel'
import { CharacterPrimitive } from './CharacterPrimitive'

// Palabras que buscamos en el nombre de cada animación del GLB
// (por si la IA les puso nombres como "Armature|Walking_01").
const KEYWORDS: Record<CharacterAnimation, string[]> = {
  IDLE: ['idle', 'stand', 'breath'],
  WALK: ['run'],
  RUN: ['run', 'jog', 'sprint'],
}

// Si falta una animación se usa la más parecida: correr → caminar → quieto
const FALLBACK_ORDER: Record<CharacterAnimation, CharacterAnimation[]> = {
  IDLE: ['IDLE'],
  WALK: ['WALK', 'IDLE'],
  RUN: ['RUN', 'WALK', 'IDLE'],
}

function findClip(names: string[], wanted: CharacterAnimation) {
  for (const kind of FALLBACK_ORDER[wanted]) {
    const exact = CHARACTER.animations?.[kind]
    if (exact && names.includes(exact)) return exact
    const match = names.find((name) => KEYWORDS[kind].some((word) => name.toLowerCase().includes(word)))
    if (match) return match
  }
  return undefined
}

// El personaje con modelo GLB y animaciones. ecctrl calcula si está quieto,
// caminando o corriendo (useEcctrlAnimationStore) y aquí elegimos la animación.
function AnimatedCharacter() {
  const { object, animations } = useModel(CHARACTER)
  const { actions, names } = useAnimations(animations, object)
  const state = useEcctrlAnimationStore((store) => store.animationState)

  // Los estados de salto (JUMP_*) no se usan todavía: se ven como "quieto"
  const wanted: CharacterAnimation = state === 'WALK' || state === 'RUN' ? state : 'IDLE'

  useEffect(() => {
    const clip = findClip(names, wanted)
    const action = clip ? actions[clip] : null
    if (!action) return
    action.reset().fadeIn(0.2).play()
    return () => {
      action.fadeOut(0.2)
    }
  }, [actions, names, wanted])

  return (
    <Shadowed>
      <primitive object={object} />
    </Shadowed>
  )
}

// Usa public/models/personaje.glb si existe; si no, el muñeco de primitivas.
export function Character() {
  const exists = useModelExists(CHARACTER.url)
  const fallback = <CharacterPrimitive />
  if (!exists) return fallback

  return (
    <ModelBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <AnimatedCharacter />
      </Suspense>
    </ModelBoundary>
  )
}
