import { useEffect, useRef, useState } from 'react'

export function useInViewAnimation<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element || inView) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true)
            observer.disconnect()
          }
        })
      },
      { threshold: 0.2, ...options },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [options, inView])

  return { ref, inView }
}
