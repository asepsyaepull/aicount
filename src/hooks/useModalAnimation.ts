import { useState, useEffect } from 'react'

export function useModalAnimation(isOpen: boolean, delay: number = 300) {
  const [shouldRender, setShouldRender] = useState(isOpen)
  const [isClosing, setIsClosing] = useState(false)
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen)

  // Derive state during render to avoid cascading updates in effects
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen)
    if (isOpen) {
      setShouldRender(true)
      setIsClosing(false)
    } else {
      setIsClosing(true)
    }
  }

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>

    if (isClosing) {
      timeoutId = setTimeout(() => {
        setIsClosing(false)
        setShouldRender(false)
      }, delay)
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [isClosing, delay])

  return { shouldRender, isClosing }
}
