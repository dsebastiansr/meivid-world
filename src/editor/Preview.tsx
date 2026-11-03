import { useEffect, useState } from 'react'
import { previewImages } from '@/data/previews'
import { thumbnail } from './thumbnails'

export interface PreviewSource {
  url?: string // GLB de donde dibujar la miniatura si no hay PNG
  node?: string // pieza dentro del GLB (también es la clave del PNG, si existe)
  png?: string // PNG directo (para cosas cuyo nombre no coincide con la pieza)
  emoji: string // lo que se ve mientras carga, o si no hay imagen
}

// La vista previa de una pieza: su PNG si existe (public/previews), si no, una miniatura
// dibujada en vivo del modelo, y mientras tanto (o si falla) el emoji.
export function Preview({ source, size }: { source: PreviewSource; size: number }) {
  const png = source.png ?? (source.node ? previewImages[source.node] : undefined)
  const [live, setLive] = useState('')

  useEffect(() => {
    if (png || !source.url) return
    let active = true
    thumbnail(source.url, source.node).then((image) => {
      if (active) setLive(image)
    })
    return () => {
      active = false
    }
  }, [png, source.url, source.node])

  const src = png ?? live

  return (
    <span className="grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      {src ? (
        <img src={src} alt="" width={size} height={size} draggable={false} className="size-full object-contain" />
      ) : (
        <span className="leading-none opacity-80" style={{ fontSize: size * 0.55 }} aria-hidden>
          {source.emoji}
        </span>
      )}
    </span>
  )
}
