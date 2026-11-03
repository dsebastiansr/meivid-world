import type { ThreeElements } from '@react-three/fiber'
import { toonGradient } from './toonGradient'

// Úsalo en lugar de <meshStandardMaterial> / <meshLambertMaterial>:
//   <ToonMaterial color="#ff6f91" />
// (flatShading existe en three pero falta en los tipos del material toon, por eso se agrega aquí)
export function ToonMaterial(props: ThreeElements['meshToonMaterial'] & { flatShading?: boolean }) {
  return <meshToonMaterial gradientMap={toonGradient} {...props} />
}
