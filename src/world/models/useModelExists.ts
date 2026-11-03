import { useEffect, useState } from 'react'

// ¿Existe el archivo? El servidor de Vite responde con una página HTML
// cuando falta un archivo, por eso revisamos el tipo de contenido, no solo el "200 OK".
const checked = new Map<string, Promise<boolean>>()
function modelExists(url: string) {
  if (!checked.has(url)) {
    checked.set(
      url,
      fetch(url, { method: 'HEAD' })
        .then((response) => response.ok && !(response.headers.get('content-type') ?? '').includes('text/html'))
        .catch(() => false),
    )
  }
  return checked.get(url)!
}

export function useModelExists(url: string) {
  const [exists, setExists] = useState(false)
  useEffect(() => {
    let active = true
    modelExists(url).then((result) => {
      if (active) setExists(result)
    })
    return () => {
      active = false
    }
  }, [url])
  return exists
}
