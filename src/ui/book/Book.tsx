import { ChevronLeft, ChevronRight, Heart } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { sfx } from '@/audio/sfx'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { memoryPhotos } from '@/memories/photos'
import type { Memory } from '@/types'
import { Flipper } from './Flipper'
import { buildSpreads, type Slot } from './spreads'
import { TextFlow } from './TextFlow'
import { useBookIntro } from './useBookIntro'

// "2024-02-14" → "14 de febrero de 2024"
function formatDate(isoDate: string) {
  const date = new Date(`${isoDate}T00:00:00`)
  if (Number.isNaN(date.getTime())) return isoDate
  return date.toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ¿La pantalla es ancha? (desde 768 px se ven las dos páginas lado a lado: el mismo punto que `md:` de Tailwind)
function useWide() {
  const [wide, setWide] = useState(() => window.matchMedia('(min-width: 768px)').matches)
  useEffect(() => {
    const media = window.matchMedia('(min-width: 768px)')
    const onChange = () => setWide(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])
  return wide
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Una página del libro. En computadora hay dos lado a lado (con la sombra del lomo al centro);
// en celular se ponen una encima de la otra. La clase `book-page` la usa la animación de apertura.
function Page({ side, children }: { side: 'left' | 'right'; children: ReactNode }) {
  return (
    <section
      className={cn(
        'book-page flex min-h-0 min-w-0 flex-1 flex-col bg-[#fffaf0] p-4 md:p-9',
        side === 'right' && 'border-t border-black/5 md:border-t-0',
        side === 'left' ? 'md:bg-linear-to-r md:from-[#fffaf0] md:to-[#f2e6cc]' : 'md:bg-linear-to-l md:from-[#fffaf0] md:to-[#f2e6cc]',
      )}
    >
      {children}
    </section>
  )
}

// Una foto como las instantáneas (marco blanco, un poco chueca). Al tocarla se amplía.
function Polaroid({ src, alt, tilt, onZoom }: { src: string; alt: string; tilt: number; onZoom: () => void }) {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center">
      <button
        type="button"
        onClick={onZoom}
        aria-label="Ampliar foto"
        style={{ rotate: `${tilt}deg` }}
        className="max-w-full cursor-zoom-in bg-white p-1.5 pb-5 shadow-[0_6px_18px_rgba(90,70,80,0.28)] ring-1 ring-black/5 transition-transform hover:scale-[1.02] md:p-2.5 md:pb-9"
      >
        <img src={src} alt={alt} draggable={false} className="block max-h-[24vh] w-auto max-w-full object-contain md:max-h-[52vh]" />
      </button>
    </div>
  )
}

// Página sin nada: un corazón de adorno
function Ornament() {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center">
      <Heart className="size-14 fill-current text-primary/15 md:size-20" />
    </div>
  )
}

// La portada de cuero: lo primero que se ve y se abre al empezar (ver useBookIntro.ts).
// Las clases `cover-emblem` y `cover-text` las anima GSAP.
function Cover({ memory }: { memory: Memory }) {
  return (
    <div className="flex size-full flex-col items-center justify-center gap-3 p-6 text-center">
      <Heart className="cover-emblem size-14 fill-current text-[#f3d9a4] drop-shadow md:size-20" />
      <h2 className="cover-text max-w-[80%] font-serif text-2xl leading-tight font-extrabold text-[#f3d9a4] drop-shadow md:text-4xl">
        {memory.titulo}
      </h2>
      <p className="cover-text font-serif text-sm tracking-wide text-[#f3d9a4]/80 md:text-base">{formatDate(memory.fecha)}</p>
    </div>
  )
}

// El libro de un recuerdo: portada de cuero, hojas de dos páginas, texto que se reparte solo.
// `closing`: cuando pasa a true, el libro se cierra con su animación y al terminar llama a `onExited`.
export function Book({ memory, closing = false, onExited }: { memory: Memory; closing?: boolean; onExited?: () => void }) {
  const { root, frame, body, pages, cover, nav, ready, skip, exit } = useBookIntro()

  useEffect(() => {
    if (closing) exit(() => onExited?.())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closing])

  const photos = useMemo(() => memoryPhotos(memory), [memory])
  const [textPages, setTextPages] = useState(1) // cuántas páginas ocupa el texto (lo mide TextFlow)
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [zoom, setZoom] = useState<string | null>(null)
  // La hoja que se está volteando ahora (null = ninguna). Solo en pantallas anchas.
  const [flip, setFlip] = useState<{ to: number; direction: 1 | -1 } | null>(null)
  const wide = useWide()
  const swipe = useRef<{ x: number; y: number } | null>(null)

  const spreads = useMemo(() => buildSpreads(photos, textPages), [photos, textPages])
  const current = Math.min(index, spreads.length - 1)
  const spread = spreads[current]
  const contentKey = `${memory.titulo}|${memory.fecha}|${memory.texto}`

  // Mientras la portada se abre, o una hoja se voltea, no se puede pasar de hoja
  const goTo = useCallback(
    (target: number) => {
      if (!ready || flip) return
      const next = Math.max(0, Math.min(spreads.length - 1, target))
      if (next === current) return
      const dir = next > current ? 1 : -1
      sfx.page()
      if (wide && !prefersReducedMotion()) {
        setFlip({ to: next, direction: dir }) // pantallas anchas: la hoja se voltea (Flipper)
      } else {
        setDirection(dir) // celular: la hoja se desliza con CSS
        setIndex(next)
      }
    },
    [ready, flip, wide, spreads.length, current],
  )

  // Flechas del teclado
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (zoom) return
      if (event.code === 'ArrowRight' || event.code === 'PageDown') goTo(current + 1)
      else if (event.code === 'ArrowLeft' || event.code === 'PageUp') goTo(current - 1)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [goTo, current, zoom])

  // Qué hay en cada mitad MIENTRAS se voltea una hoja. Al pasar hacia adelante, la hoja que gira
  // lleva la página derecha de ahora y debajo ya está la derecha de la hoja siguiente; hacia atrás,
  // al revés. Así, al terminar, el cambio de hoja no se nota.
  const shown = flip
    ? flip.direction === 1
      ? { left: spread.left, right: spreads[flip.to].right }
      : { left: spreads[flip.to].left, right: spread.right }
    : spread

  const renderSlot = (slot: Slot, side: 'left' | 'right') => {
    if (slot.type === 'photo') {
      return <Polaroid src={slot.src} alt={memory.titulo} tilt={side === 'left' ? -1.4 : 1.2} onZoom={() => setZoom(slot.src)} />
    }
    if (slot.type === 'text') {
      return (
        <TextFlow page={slot.page} onPageCount={setTextPages} contentKey={contentKey}>
          <h2 className="font-serif text-2xl leading-tight font-extrabold break-after-avoid md:text-3xl">{memory.titulo}</h2>
          <p className="mt-1 mb-4 text-sm font-bold text-muted-foreground break-after-avoid">{formatDate(memory.fecha)}</p>
          <p className="font-serif text-base leading-relaxed whitespace-pre-line md:text-lg">{memory.texto}</p>
        </TextFlow>
      )
    }
    return <Ornament />
  }

  return (
    <div ref={root} className="relative isolate flex min-h-0 flex-1 flex-col gap-2.5">
      {/* El marco café del libro (el "tablero" de la tapa). Va detrás de todo y sobresale 12 px alrededor
          (el relleno del diálogo). Al abrirse el libro, la animación lo expande desde la portada. */}
      <div ref={frame} aria-hidden className="pointer-events-none absolute -inset-3 -z-10 rounded-3xl bg-[#8c5e45]" />

      {/* El cuerpo del libro. Sin `overflow-hidden` aquí para que la portada y la hoja que se voltea
          puedan salirse hacia afuera. */}
      {/* `perspective` aquí es para que la portada gire en 3D sobre el lomo (el centro del libro). */}
      <div ref={body} className="relative flex min-h-0 flex-1" style={{ perspective: 2000 }}>
        {/* Las hojas (este marco SÍ recorta). Deslizar con el dedo también pasa de página. */}
        <div
          ref={pages}
          className="relative flex min-h-0 flex-1 overflow-hidden rounded-2xl bg-[#fffaf0] shadow-[4px_0_0_-1px_#efe5cf,8px_0_0_-2px_#e0d2b3,-4px_0_0_-1px_#efe5cf,-8px_0_0_-2px_#e0d2b3]"
          style={{ touchAction: 'pan-y' }}
          onPointerDown={(event) => {
            if (event.pointerType !== 'mouse') swipe.current = { x: event.clientX, y: event.clientY }
          }}
          onPointerUp={(event) => {
            const start = swipe.current
            swipe.current = null
            if (!start) return
            const dx = event.clientX - start.x
            const dy = event.clientY - start.y
            if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) goTo(current + (dx < 0 ? 1 : -1))
          }}
        >
          <div
            key={current}
            className={cn(
              'flex min-h-0 flex-1 flex-col md:flex-row',
              // En celular las hojas se deslizan con CSS; en pantallas anchas las voltea el Flipper
              !wide && 'animate-in fade-in-0 duration-300',
              !wide && current > 0 && (direction === 1 ? 'slide-in-from-right-6' : 'slide-in-from-left-6'),
            )}
          >
            <Page side="left">{renderSlot(shown.left, 'left')}</Page>
            <Page side="right">{renderSlot(shown.right, 'right')}</Page>
          </div>

          {/* La sombra del lomo, entre las dos páginas */}
          <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-8 -translate-x-1/2 bg-linear-to-r from-transparent via-black/10 to-transparent md:block" />

          {/* Foto ampliada: tocar en cualquier lado la cierra */}
          {zoom && (
            <button
              type="button"
              onClick={() => setZoom(null)}
              aria-label="Cerrar foto ampliada"
              className="absolute inset-0 z-10 flex cursor-zoom-out items-center justify-center bg-black/80 p-3 animate-in fade-in-0"
            >
              <img src={zoom} alt={memory.titulo} className="max-h-full max-w-full object-contain" />
            </button>
          )}
        </div>

        {/* La hoja que se voltea. Va FUERA del marco que recorta las páginas (overflow-hidden) para poder
            sobresalir del libro mientras gira. Solo existe mientras dura el giro. */}
        {flip && (
          <Flipper
            direction={flip.direction}
            front={
              flip.direction === 1 ? (
                <Page side="right">{renderSlot(spread.right, 'right')}</Page>
              ) : (
                <Page side="left">{renderSlot(spread.left, 'left')}</Page>
              )
            }
            back={
              flip.direction === 1 ? (
                <Page side="left">{renderSlot(spreads[flip.to].left, 'left')}</Page>
              ) : (
                <Page side="right">{renderSlot(spreads[flip.to].right, 'right')}</Page>
              )
            }
            onDone={() => {
              setIndex(flip.to)
              setFlip(null)
            }}
          />
        )}

        {/* La portada. Cerrado, el libro solo enseña esta media página (la mitad derecha) y se abre de
            derecha a izquierda: gira sobre el lomo y, al caer a la izquierda, su reverso (la tapa interior)
            queda como la página izquierda de la primera hoja. Tocarla acelera la animación. */}
        <div
          ref={cover}
          onClick={skip}
          className="absolute inset-y-0 right-0 left-1/2 z-20 cursor-pointer"
          style={{ transformStyle: 'preserve-3d', transformOrigin: 'left center' }}
        >
          {/* Frente: el cuero. El lomo (a la izquierda) queda recto y el resto redondeado. */}
          <div
            className="absolute inset-0 rounded-r-2xl bg-linear-to-br from-[#a67554] via-[#8c5e45] to-[#6b4331] shadow-2xl ring-1 ring-black/30"
            style={{ backfaceVisibility: 'hidden' }}
          >
            {/* El "hilván" del borde y un poco de sombra donde se dobla, junto al lomo */}
            <div className="pointer-events-none absolute inset-3 rounded-xl border-2 border-dashed border-[#e8c99a]/50" />
            <div className="pointer-events-none absolute inset-y-0 left-0 w-[6%] bg-linear-to-r from-black/30 to-transparent" />
            <Cover memory={memory} />
          </div>
          {/* Reverso: la tapa interior, que es la página izquierda de la primera hoja */}
          <div
            className="absolute inset-0 flex overflow-hidden rounded-l-2xl"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <Page side="left">{renderSlot(spreads[0].left, 'left')}</Page>
          </div>
        </div>
      </div>

      {/* Pasar de hoja */}
      <div ref={nav} className="flex items-center gap-2">
        <Button size="icon" variant="secondary" disabled={current === 0} onClick={() => goTo(current - 1)} aria-label="Hoja anterior">
          <ChevronLeft />
        </Button>
        <div className="flex flex-1 items-center justify-center gap-1.5">
          {spreads.length <= 14 ? (
            spreads.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Ir a la hoja ${i + 1}`}
                className={cn('size-2.5 rounded-full transition-all', i === (flip?.to ?? current) ? 'w-6 bg-white' : 'bg-white/40 hover:bg-white/70')}
              />
            ))
          ) : (
            <span className="text-sm font-bold text-white">
              Hoja {(flip?.to ?? current) + 1} de {spreads.length}
            </span>
          )}
        </div>
        <Button size="icon" variant="secondary" disabled={current === spreads.length - 1} onClick={() => goTo(current + 1)} aria-label="Hoja siguiente">
          <ChevronRight />
        </Button>
      </div>
    </div>
  )
}
