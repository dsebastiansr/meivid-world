import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'

const GAP = 48 // separación entre páginas dentro del flujo (en píxeles; no se ve)

interface TextFlowProps {
  page: number // cuál página del texto se muestra (0 es la primera)
  onPageCount: (count: number) => void // avisa cuántas páginas salieron en total
  contentKey: string // cambia cuando cambia el contenido (para volver a medir)
  children: ReactNode
}

// Reparte un texto largo en páginas AUTOMÁTICAMENTE, sin cortarlo a mano.
//
// El truco: el contenido se escribe en columnas del tamaño exacto de la página. Lo que no cabe
// en la primera columna "se desborda" a la derecha, y cada columna es una página. Para ver la
// página N se corre el contenido hacia la izquierda N columnas. Si cambia el tamaño de la
// ventana, el navegador vuelve a repartir y aquí se vuelve a contar.
export function TextFlow({ page, onPageCount, contentKey, children }: TextFlowProps) {
  const clip = useRef<HTMLDivElement>(null)
  const flow = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  // Medir el espacio disponible (y volver a medir si cambia)
  useLayoutEffect(() => {
    const element = clip.current
    if (!element) return
    const measure = () => setSize({ width: element.clientWidth, height: element.clientHeight })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  // Contar cuántas columnas (páginas) salieron
  useLayoutEffect(() => {
    const element = flow.current
    if (!element || size.width === 0 || size.height === 0) return

    const count = () => {
      const pages = Math.max(1, Math.round((element.scrollWidth + GAP) / (size.width + GAP)))
      onPageCount(pages)
    }
    count()
    // Cuando termina de cargar la tipografía el texto cambia de tamaño: contar otra vez
    document.fonts?.ready.then(count)
  }, [size.width, size.height, contentKey, onPageCount])

  return (
    <div ref={clip} className="relative h-full min-h-0 w-full overflow-hidden">
      <div
        ref={flow}
        style={{
          width: size.width,
          height: size.height,
          columnWidth: size.width || undefined,
          columnGap: GAP,
          columnFill: 'auto',
          transform: `translateX(-${page * (size.width + GAP)}px)`,
        }}
      >
        {children}
      </div>
    </div>
  )
}
