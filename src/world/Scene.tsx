import { Physics } from '@react-three/rapier'
import { COLORS, LIGHTS } from '@/config'
import { EditorLayer } from '@/editor/EditorLayer'
import { MemoryProximity } from '@/memories/MemoryProximity'
import { MemorySpot } from '@/memories/MemorySpot'
import { Player } from '@/player/Player'
import { useEditorStore } from '@/store/useEditorStore'
import { useWorldStore } from '@/store/useWorldStore'
import { Clouds } from './sky/Clouds'
import { FollowCamera } from './camera/FollowCamera'
import { IslandBounds } from './terrain/IslandBounds'
import { Landmarks } from './scenery/Landmarks'
import { Scenery } from './scenery/Scenery'
import { Sky } from './sky/Sky'
import { Sun } from './sky/Sun'
import { Terrain } from './terrain/TerrainMesh'
import { Water } from './water/Water'

// Todo lo que hay dentro del mundo 3D.
export function Scene() {
  const memories = useWorldStore((state) => state.memories)
  const movingId = useEditorStore((state) => state.placing?.movingId)

  return (
    <>
      {/* Cielo con degradado y niebla del mismo color (esconde el borde del agua) */}
      <color attach="background" args={[COLORS.sky]} />
      <fog attach="fog" args={[COLORS.sky, 40, 110]} />
      <Sky />
      <Clouds />

      {/* Luz suave de ambiente + sol con sombras */}
      <hemisphereLight args={[LIGHTS.sky, LIGHTS.ground, LIGHTS.ambient]} />
      <Sun />

      <FollowCamera />
      <Water />

      {/* Para ver las cajas de colisión, cambia a <Physics debug> */}
      <Physics>
        <Terrain />
        <IslandBounds />
        <Scenery />
        <Landmarks />
        {memories
          .filter((memory) => memory.id !== movingId)
          .map((memory) => (
            <MemorySpot key={memory.id} memory={memory} />
          ))}

        <Player />
      </Physics>

      <EditorLayer />
      <MemoryProximity memories={memories} />
    </>
  )
}
