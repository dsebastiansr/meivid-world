import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useCallback, useRef, useState } from 'react'

gsap.registerPlugin(useGSAP)

// ─────────────────────────────────────────────────────────────
// ANIMACIÓN DE APERTURA DEL LIBRO (con GSAP)
//
// Un libro cerrado solo enseña su portada, y se abre de derecha a izquierda: la portada gira sobre
// el lomo (el centro del libro) y al caer a la izquierda deja ver su reverso, que es la tapa interior
// (la página izquierda de la primera hoja). Una "línea de tiempo" (timeline) encadena los pasos:
//
//   1. el libro cerrado aparece creciendo, con un pequeño rebote. Cerrado es de media página de
//      ancho y está centrado: la mitad izquierda del libro ni se ve
//   2. el corazón y el título de la portada se acomodan
//   3. una pausa corta para que se vea la portada
//   4. la portada gira hacia la izquierda mientras el libro se recorre al centro, como si se
//      desplegara; la página izquierda se descubre justo cuando la portada ya la tapa
//   5. aparecen los botones
//
// Para cambiarla: los números `duration` son segundos; `ease` es la "curva" del movimiento
// (power2.inOut = empieza y termina suave; back.out = pasa un poco y rebota).
// Catálogo de curvas: https://gsap.com/docs/v3/Eases
// ─────────────────────────────────────────────────────────────

const COVER_PAUSE = 0.35 // segundos que se queda cerrado el libro antes de abrirse
const COVER_OPEN_DURATION = 1.1 // lo que tarda en abrirse
const COVER_CLOSE_DURATION = 0.85 // lo que tarda en cerrarse al salir

export function useBookIntro() {
  const root = useRef<HTMLDivElement>(null) // todo el libro (aparece creciendo)
  const frame = useRef<HTMLDivElement>(null) // el marco café de atrás: cerrado abraza la portada y al abrir se expande
  const body = useRef<HTMLDivElement>(null) // el cuerpo: cerrado va corrido a la izquierda para quedar centrado
  const pages = useRef<HTMLDivElement>(null) // el marco de las páginas (su mitad izquierda se oculta mientras está cerrado)
  const cover = useRef<HTMLDivElement>(null) // la portada (con su tapa interior atrás)
  const nav = useRef<HTMLDivElement>(null) // los botones de abajo
  const timeline = useRef<gsap.core.Timeline | null>(null)
  const [ready, setReady] = useState(false) // true cuando el libro ya se puede usar
  const readyRef = useRef(false)

  useGSAP(
    () => {
      const finish = () => {
        // Ya abierto: la portada sale de en medio y el libro queda sin ningún estilo temporal
        gsap.set(cover.current, { display: 'none' })
        gsap.set([body.current, pages.current], { clearProps: 'transform,clipPath' })
        gsap.set(frame.current, { clearProps: 'left,right,bottom' }) // vuelve al tamaño completo que dice su CSS
        readyRef.current = true
        setReady(true)
      }

      // Si la persona pidió menos movimiento en su dispositivo, el libro aparece ya abierto
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        finish()
        return
      }

      // Estado inicial: libro cerrado. El cuerpo se corre un cuarto de su ancho hacia la izquierda
      // para que la portada (la mitad derecha) quede en el centro; y la mitad izquierda de las páginas
      // se recorta para que no se vea nada ahí hasta que la portada la cubra.
      gsap.set(body.current, { xPercent: -25 })
      gsap.set(pages.current, { clipPath: 'inset(-24px -24px -24px 50%)' })
      gsap.set(nav.current, { opacity: 0 }) // los botones esperan escondidos hasta el final

      // El marco café empieza pegado a la portada: de ancho, lo de la portada (media página) + el margen de
      // 12 px; de alto, hasta donde termina el cuerpo del libro (sin la fila de botones, que aún no se ve).
      // Crece hasta -12 px por lado, que es su tamaño completo (`-inset-3`).
      const MARGIN = 12
      const bookWidth = root.current?.offsetWidth ?? 0
      const bookHeight = root.current?.offsetHeight ?? 0
      const bodyHeight = body.current?.offsetHeight ?? 0
      gsap.set(frame.current, {
        left: bookWidth / 4 - MARGIN,
        right: bookWidth / 4 - MARGIN,
        bottom: bookHeight - bodyHeight - MARGIN,
      })

      timeline.current = gsap
        .timeline({ onComplete: finish })
        .from(root.current, { opacity: 0, scale: 0.8, y: 40, duration: 0.6, ease: 'back.out(1.6)' })
        .from('.cover-emblem', { scale: 0.3, rotation: -20, opacity: 0, duration: 0.6, ease: 'back.out(2.2)' }, '-=0.3')
        .from('.cover-text', { opacity: 0, y: 10, duration: 0.5, stagger: 0.1, ease: 'power2.out' }, '-=0.35')
        .addLabel('open', `+=${COVER_PAUSE}`)
        // La portada gira sobre el lomo hacia la izquierda, y el libro se despliega hacia el centro
        .to(cover.current, { rotationY: -180, duration: COVER_OPEN_DURATION, ease: 'power2.inOut' }, 'open')
        .to(body.current, { xPercent: 0, duration: COVER_OPEN_DURATION, ease: 'power2.inOut' }, 'open')
        // El marco café se expande desde la portada hasta cubrir todo el libro (sale de la nada, no está desde el principio)
        .to(frame.current, { left: -MARGIN, right: -MARGIN, bottom: -MARGIN, duration: COVER_OPEN_DURATION, ease: 'power2.inOut' }, 'open')
        // La página izquierda se descubre cuando la portada ya pasó la mitad del giro (y la tapa)
        .to(pages.current, { clipPath: 'inset(-24px)', duration: 0.01, ease: 'none' }, `open+=${COVER_OPEN_DURATION * 0.55}`)
        .to(nav.current, { opacity: 1, duration: 0.4, ease: 'power2.out' }, `open+=${COVER_OPEN_DURATION * 0.8}`)
    },
    { scope: root },
  )

  // Tocar la portada acelera la animación (por si ya viste el libro muchas veces)
  const skip = useCallback(() => {
    timeline.current?.timeScale(3)
  }, [])

  // ANIMACIÓN DE SALIDA: lo contrario de la apertura. Los botones se esconden, la portada vuelve a
  // cerrarse sobre el libro (que se recoge hacia el centro) y el libro cerrado se encoge y desaparece.
  // Al terminar llama a `done` (que cierra el diálogo de verdad).
  const exit = useCallback((done: () => void) => {
    timeline.current?.kill()
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return done()

    const leave = (tl: gsap.core.Timeline, at: string | number) =>
      tl.to(root.current, { opacity: 0, scale: 0.8, y: 40, duration: 0.45, ease: 'back.in(1.6)' }, at)

    // Se cerró antes de terminar de abrirse: solo se va, sin volver a cerrar la portada
    if (!readyRef.current) {
      leave(gsap.timeline({ onComplete: done }), 0)
      return
    }

    const MARGIN = 12
    const bookWidth = root.current?.offsetWidth ?? 0
    const bookHeight = root.current?.offsetHeight ?? 0
    const bodyHeight = body.current?.offsetHeight ?? 0
    const tl = gsap.timeline({ onComplete: done })
    tl.to(nav.current, { opacity: 0, duration: 0.2, ease: 'power2.in' })
      // La portada reaparece sobre la página izquierda y se recoge el contenido de ese lado
      .set(cover.current, { clearProps: 'display' }, 0.1)
      .set(pages.current, { clipPath: 'inset(-24px -24px -24px 50%)' }, 0.1)
      .fromTo(cover.current, { rotationY: -180 }, { rotationY: 0, duration: COVER_CLOSE_DURATION, ease: 'power2.inOut' }, 0.1)
      .to(body.current, { xPercent: -25, duration: COVER_CLOSE_DURATION, ease: 'power2.inOut' }, 0.1)
      .to(
        frame.current,
        { left: bookWidth / 4 - MARGIN, right: bookWidth / 4 - MARGIN, bottom: bookHeight - bodyHeight - MARGIN, duration: COVER_CLOSE_DURATION, ease: 'power2.inOut' },
        0.1,
      )
    leave(tl, '>+0.08')
  }, [])

  return { root, frame, body, pages, cover, nav, ready, skip, exit }
}
