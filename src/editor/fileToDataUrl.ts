// Convierte una foto del celular o la compu en un texto pequeño (data URL) que se puede guardar.
// La reduce a `maxSize` píxeles y la comprime, para que no llene la memoria del navegador.
// En la Fase 4 las fotos se suben a Supabase y esto ya no hará falta.
export async function fileToDataUrl(file: File, maxSize = 900, quality = 0.8): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return canvas.toDataURL('image/jpeg', quality)
}
