// ─────────────────────────────────────────────────────────────
// CÓMO SE REPARTE EL LIBRO
//
// Una "hoja" (spread) son dos páginas: la izquierda y la derecha. En celular se ven una
// encima de la otra, pero el reparto es el mismo.
//
//  · el texto ocupa la página derecha (y se continúa en las siguientes hojas si no cabe)
//  · las fotos van a la izquierda, una por hoja
//  · si ya no queda texto pero sobran fotos, las fotos llenan también la página derecha
//
// Ejemplo con 6 fotos y 1 página de texto:
//   hoja 1: foto 1 | texto        hoja 2: foto 2 | foto 3
//   hoja 3: foto 4 | foto 5       hoja 4: foto 6 | (vacía)
// ─────────────────────────────────────────────────────────────

export type Slot =
  | { type: 'photo'; src: string }
  | { type: 'text'; page: number } // `page`: cuál página del texto (0 es la primera)
  | { type: 'empty' }

export interface Spread {
  left: Slot
  right: Slot
}

export function buildSpreads(photos: string[], textPages: number): Spread[] {
  const spreads: Spread[] = []
  let nextPhoto = 0
  const takePhoto = (): Slot => (nextPhoto < photos.length ? { type: 'photo', src: photos[nextPhoto++] } : { type: 'empty' })

  for (let index = 0; ; index++) {
    const left = takePhoto()
    const right: Slot = index < textPages ? { type: 'text', page: index } : takePhoto()
    spreads.push({ left, right })
    if (index + 1 >= textPages && nextPhoto >= photos.length) break
  }
  return spreads
}
