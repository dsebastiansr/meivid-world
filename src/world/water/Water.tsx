import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { COLORS, ISLAND, TERRAIN } from '@/config'
import { curveGLSL } from '../rendering/curvedWorld'
import { buildHeightTexture, HEIGHT_TEXTURE_SIZE } from '../terrain/terrainData'

// Agua con estilo caricatura, toda en un shader (es barato).
// Lee una textura con la altura del terreno (ver buildHeightTexture) y con ella:
//  · pinta agua clara donde es poco profundo y oscura donde es profundo
//  · dibuja las líneas de espuma siguiendo la forma real de la costa
//    (son las "curvas de nivel" del fondo del mar, que se mueven con las olas)
const vertexShader = /* glsl */ `
  #include <common>
  #include <fog_pars_vertex>
  varying vec2 vWorldXZ;
  ${curveGLSL}
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldXZ = worldPosition.xz;
    vec4 mvPosition = curveWorld(viewMatrix * worldPosition);
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`

const fragmentShader = /* glsl */ `
  uniform sampler2D uHeight;
  uniform float uTime;
  uniform float uLevel;
  uniform float uSize;
  uniform float uTexel;
  uniform vec3 uShallow;
  uniform vec3 uDeep;
  uniform vec3 uFoam;
  varying vec2 vWorldXZ;
  #include <common>
  #include <fog_pars_fragment>
  void main() {
    // Altura del fondo en este punto (fuera de la textura se repite el borde, que es mar profundo)
    vec2 uv = (vWorldXZ / uSize + 0.5) * (1.0 - uTexel) + 0.5 * uTexel;
    float h = texture2D(uHeight, uv).r;

    // Agua clara cerca de la costa, oscura donde es profundo
    vec3 color = mix(uShallow, uDeep, smoothstep(uLevel - 0.3, uLevel - 2.4, h));

    // Manchas de luz que se mueven (suma de ondas, cortada en escalón = toon)
    float n = sin(vWorldXZ.x * 0.7 + uTime * 0.8)
            + sin(vWorldXZ.y * 0.8 - uTime * 1.1)
            + sin((vWorldXZ.x + vWorldXZ.y) * 0.45 + uTime * 0.6);
    color = mix(color, uShallow * 1.2, step(1.6, n) * 0.5);

    // Líneas de espuma discontinuas: curvas de nivel del fondo, cada una con su vaivén
    float width = fwidth(h) + 0.002;
    for (int i = 0; i < 3; i++) {
      float fi = float(i);
      float level = uLevel - 0.15 - fi * 0.5 + 0.1 * sin(uTime * 0.9 + fi * 2.0);
      float onLine = step(abs(h - level), width * (1.3 - fi * 0.25));
      float dashes = step(0.1, sin(vWorldXZ.x * 2.3 + vWorldXZ.y * 1.7 + fi * 1.9 + uTime * 0.25)
                             * sin(vWorldXZ.x * 1.1 - vWorldXZ.y * 1.3 + fi));
      color = mix(color, uFoam, onLine * dashes);
    }

    // Espuma sólida pegada a la arena
    color = mix(color, uFoam, step(uLevel - 0.12 + 0.05 * sin(uTime * 1.2 + vWorldXZ.x * 2.0), h));

    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`

export function Water() {
  const uniforms = useMemo(
    () =>
      THREE.UniformsUtils.merge([
        THREE.UniformsLib.fog,
        {
          uHeight: { value: buildHeightTexture() },
          uTime: { value: 0 },
          uLevel: { value: ISLAND.waterLevel },
          uSize: { value: TERRAIN.size },
          uTexel: { value: 1 / HEIGHT_TEXTURE_SIZE },
          uShallow: { value: new THREE.Color(COLORS.water) },
          uDeep: { value: new THREE.Color(COLORS.waterDeep) },
          uFoam: { value: new THREE.Color(COLORS.foam) },
        },
      ]),
    [],
  )

  const material = useRef<THREE.ShaderMaterial>(null)

  useFrame(({ clock }) => {
    if (material.current) material.current.uniforms.uTime.value = clock.elapsedTime
  })

  return (
    // ringGeometry con muchos anillos: el mundo curvo necesita vértices para doblar el agua
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, ISLAND.waterLevel, 0]} frustumCulled={false}>
      <ringGeometry args={[0, 140, 48, 56]} />
      <shaderMaterial ref={material} vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} fog />
    </mesh>
  )
}
