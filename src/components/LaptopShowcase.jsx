import { useState, useEffect, useRef, useCallback } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const SCREENS = [
  '/assets/laptop/ლ1.webp',
  '/assets/laptop/ლ2.webp',
  '/assets/laptop/ლ3.webp',
  '/assets/laptop/ლ4.webp',
  '/assets/laptop/ლ5.webp',
]

const INTERVAL_MS = 4000

export default function LaptopShowcase() {
  const [active, setActive] = useState(0)
  const wrapRef = useRef(null)
  const timerRef = useRef(null)

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setActive((c) => (c + 1) % SCREENS.length)
    }, INTERVAL_MS)
  }, [])

  useEffect(() => {
    startTimer()
    return () => clearInterval(timerRef.current)
  }, [startTimer])

  // Scroll-reveal
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(wrapRef.current, { y: 48, opacity: 0 })
      gsap.to(wrapRef.current, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: wrapRef.current,
          start: 'top 87%',
          end: 'top 58%',
          scrub: 1,
        },
      })
    }, wrapRef)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={wrapRef} className="relative w-full select-none">

      {/* All 6 images stacked — active one fades in */}
      <div className="relative w-full">
        {SCREENS.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`FINS page ${i + 1}`}
            draggable={false}
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
            className="w-full h-auto block"
            style={{
              position: i === 0 ? 'relative' : 'absolute',
              inset: 0,
              opacity: i === active ? 1 : 0,
              transition: 'opacity 700ms ease-in-out',
              willChange: 'opacity',
            }}
          />
        ))}
      </div>

    </div>
  )
}
