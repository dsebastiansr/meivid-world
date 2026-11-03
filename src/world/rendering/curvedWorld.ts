import * as THREE from 'three'
import { CURVE } from '@/config'

// ─────────────────────────────────────────────────────────────
// MUNDO CURVO
// three.js arma cada vértice con un "chunk" de shader llamado project_vertex.
// Aquí le agregamos una línea: mientras más lejos de la cámara está un
// vértice, más lo bajamos. Como es global, TODOS los materiales (toon,
// basic, etc.) se curvan solos, sin tocar cada componente.
// Solo hay que importar este archivo una vez (App.tsx lo hace).
// ─────────────────────────────────────────────────────────────

const start = CURVE.start.toFixed(3)
const strength = CURVE.strength.toFixed(6)

// Código GLSL para shaders propios (agua): recibe la posición en espacio de cámara
export const curveGLSL = /* glsl */ `
vec4 curveWorld(vec4 mv) {
  float curveDist = max(length(mv.xz) - ${start}, 0.0);
  mv.y -= curveDist * curveDist * ${strength};
  return mv;
}
`

// Guardamos los originales para que si se recarga este archivo no se parche dos veces
const store = globalThis as unknown as { __threeOriginals?: { project: string } }
store.__threeOriginals ??= { project: THREE.ShaderChunk.project_vertex }
const original = store.__threeOriginals.project

// project_vertex_flat no existe en three: lo agregamos nosotros (de ahí el cast)
;(THREE.ShaderChunk as Record<string, string>).project_vertex_flat = original
THREE.ShaderChunk.project_vertex = /* glsl */ `
${original}
{
  float curveDist = max(length(mvPosition.xz) - ${start}, 0.0);
  mvPosition.y -= curveDist * curveDist * ${strength};
  gl_Position = projectionMatrix * mvPosition;
}
`

// Los materiales que dibujan el mapa de sombras NO se curvan:
// las sombras se calculan en el mundo real, no en el visual.
THREE.ShaderLib.depth.vertexShader = THREE.ShaderLib.depth.vertexShader.replace(
  '#include <project_vertex>',
  '#include <project_vertex_flat>',
)
THREE.ShaderLib.distance.vertexShader = THREE.ShaderLib.distance.vertexShader.replace(
  '#include <project_vertex>',
  '#include <project_vertex_flat>',
)
