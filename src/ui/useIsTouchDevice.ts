import { useEffect, useState } from 'react'

const query = '(pointer: coarse)'

// true si el dispositivo se usa con el dedo (celular / tablet).
export function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const media = window.matchMedia(query)
    const onChange = () => setIsTouch(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return isTouch
}
