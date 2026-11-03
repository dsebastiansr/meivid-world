import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

gsap.registerPlugin(useGSAP)

// ─────────────────────────────────────────────────────────────
// LA HOJA QUE SE VOLTEA (con GSAP)
//
// Está basada en el cuaderno negro de referencia. La idea es simple, y por eso se ve bien:
//
//  · La hoja es UNA SOLA pieza rígida con dos caras: el frente (lo que ves antes de voltearla)
//    y el reverso (lo que ves después, ya girado 180° para que al llegar quede derecho).
//  · Solo gira sobre el lomo (el borde que toca el centro del libro). Nada de agrandarla,
//    inclinarla ni sombrearla.
//  · La PERSPECTIVA está en el contenedor, no en la hoja. Ese es todo el secreto de que parezca de
//    verdad: al girar, el borde libre se acerca a la cámara y se ve más grande, y la hoja
//    sobresale del libro sola (esta pieza se dibuja FUERA del marco que recorta las páginas;
//    ver Book.tsx).
//
//  · hacia adelante: la hoja está en la mitad derecha y gira hacia la izquierda
//  · hacia atrás:    la hoja está en la mitad izquierda y gira hacia la derecha
//
// Cuando termina, avisa con `onDone` y el libro se queda mostrando la hoja nueva.
// ─────────────────────────────────────────────────────────────

export const FLIP_DURATION = 0.7 // segundos que tarda en voltearse
const PERSPECTIVE = 1200 // más chico = más dramática la perspectiva (la referencia usa 1200)

interface FlipperProps {
  direction: 1 | -1 // 1 = pasar hacia adelante, -1 = volver
  front: ReactNode // la cara que se ve al empezar
  back: ReactNode // la cara que se ve al terminar
  onDone: () => void
}

export function Flipper({ direction, front, back, onDone }: FlipperProps) {
  const root = useRef<HTMLDivElement>(null)
  const leaf = useRef<HTMLDivElement>(null)
  const forward = direction === 1

  useGSAP(
    () => {
      gsap
        .timeline({ onComplete: onDone })
        .to(leaf.current, { rotationY: forward ? -180 : 180, duration: FLIP_DURATION, ease: 'power2.inOut' })
    },
    { scope: root },
  )

  return (
    // La perspectiva va aquí, en el contenedor que cubre todo el libro (su centro es el lomo)
    <div ref={root} className="pointer-events-none absolute inset-0 z-10" style={{ perspective: PERSPECTIVE }}>
      <div
        ref={leaf}
        className={cn('absolute inset-y-0', forward ? 'left-1/2 right-0' : 'left-0 right-1/2')}
        style={{ transformStyle: 'preserve-3d', transformOrigin: forward ? 'left center' : 'right center' }}
      >
        <Face freeEdge={forward ? 'right' : 'left'}>{front}</Face>
        {/* El reverso viene ya volteado 180° (como `page__half--back` en la referencia) */}
        {/* Su borde libre queda del lado contrario al del frente */}
        <Face flipped freeEdge={forward ? 'left' : 'right'}>
          {back}
        </Face>
      </div>
    </div>
  )
}

// Una cara de la hoja. `backface-visibility: hidden` hace que solo se vea la que mira a la cámara.
// Como la hoja se dibuja fuera del marco redondeado del libro, aquí se le dan sus propias esquinas
// redondas del lado del borde libre (el del lomo queda recto), igual que `border-radius` en la referencia.
function Face({ children, flipped = false, freeEdge }: { children: ReactNode; flipped?: boolean; freeEdge: 'left' | 'right' }) {
  return (
    <div
      className={cn('absolute inset-0 flex overflow-hidden', freeEdge === 'right' ? 'rounded-r-2xl' : 'rounded-l-2xl')}
      style={{ backfaceVisibility: 'hidden', transform: flipped ? 'rotateY(180deg)' : undefined }}
    >
      {children}
    </div>
  )
}
