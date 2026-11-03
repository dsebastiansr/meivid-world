import * as THREE from 'three'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { LIGHTS } from '@/config'
import { toToon } from '@/world/rendering/toonify'

// ─────────────────────────────────────────────────────────────
// VISTAS PREVIAS EN VIVO
//
// Las piezas de Kenney traen su PNG (ver scripts/make-previews.py), pero las de Quaternius
// (árboles, rocas, flores…) no. Para esas, dibujamos el modelo en miniatura con un renderizador
// aparte y guardamos la imagen. Se hace una sola vez por pieza, solo de las que se ven en el menú,
// y una a la vez para no trabar el juego.
// ─────────────────────────────────────────────────────────────

const SIZE = 160 // píxeles de la imagen (se muestra más chica, así se ve nítida)

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera

// Se crea la primera vez que hace falta (no al abrir la página)
function setup() {
  if (renderer) return renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true })
  renderer.setPixelRatio(1)
  renderer.setSize(SIZE, SIZE, false)
  renderer.setClearColor(0x000000, 0)

  scene = new THREE.Scene()
  // La misma luz que la isla, para que la miniatura se parezca a lo que vas a ver
  scene.add(new THREE.HemisphereLight(LIGHTS.sky, LIGHTS.ground, LIGHTS.ambient))
  const sun = new THREE.DirectionalLight(LIGHTS.sunColor, LIGHTS.sun)
  sun.position.set(2, 4, 3)
  scene.add(sun)

  camera = new THREE.PerspectiveCamera(28, 1, 0.1, 200)
  return renderer
}

const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder)
const files = new Map<string, Promise<GLTF>>()

function loadFile(url: string) {
  if (!files.has(url)) files.set(url, loader.loadAsync(url))
  return files.get(url)!
}

// `node` es la pieza dentro del GLB; si no se da, se dibuja la escena completa del archivo
async function render(url: string, node?: string) {
  const gltf = await loadFile(url)
  let source: THREE.Object3D | undefined = node ? undefined : gltf.scene
  for (const sceneRoot of gltf.scenes) {
    if (source) break
    source = sceneRoot.getObjectByName(node ?? '')
  }
  if (!source) throw new Error(`No existe la pieza ${node}`)

  const gl = setup()
  const model = clone(source)
  toToon(model)
  model.updateMatrixWorld(true)

  // Encuadrar: la cámara mira desde un ángulo isométrico y se aleja lo justo para que quepa todo
  const box = new THREE.Box3().setFromObject(model)
  const center = box.getCenter(new THREE.Vector3())
  const radius = box.getSize(new THREE.Vector3()).length() / 2
  const distance = (radius / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2))) * 1.02
  camera.position.copy(center).addScaledVector(new THREE.Vector3(1, 0.8, 1).normalize(), distance)
  camera.near = Math.max(0.05, distance - radius * 2)
  camera.far = distance + radius * 2
  camera.updateProjectionMatrix()
  camera.lookAt(center)

  scene.add(model)
  gl.render(scene, camera)
  const image = gl.domElement.toDataURL('image/png')
  scene.remove(model)
  return image
}

const cache = new Map<string, Promise<string>>()
let queue: Promise<unknown> = Promise.resolve()

// La imagen (como texto "data:image/png…") de una pieza de un GLB. Devuelve '' si no se pudo.
export function thumbnail(url: string, node?: string): Promise<string> {
  const key = `${url}#${node ?? ''}`
  let result = cache.get(key)
  if (!result) {
    // En fila: una miniatura a la vez
    result = queue.then(() => render(url, node)).catch(() => '')
    queue = result
    cache.set(key, result)
  }
  return result
}
