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
  const hoverRef = useRef(false)

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      if (!hoverRef.current) setActive((c) => (c + 1) % SCREENS.length)
    }, INTERVAL_MS)
  }, [])

  // Cycle only while in viewport
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return undefined
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) startTimer()
      else clearInterval(timerRef.current)
    }, { threshold: 0.2 })
    io.observe(el)
    return () => { clearInterval(timerRef.current); io.disconnect() }
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

  const goTo = (i) => {
    setActive(i)
    startTimer()
  }

  return (
    <div
      ref={wrapRef}
      className="relative w-full select-none"
      onMouseEnter={() => { hoverRef.current = true }}
      onMouseLeave={() => { hoverRef.current = false }}
    >
      {/* Brand glow behind the laptop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[96%] w-[108%]"
        style={{
          transform: 'translate(-50%,-50%)',
          background: 'radial-gradient(closest-side, rgba(61,100,254,0.11), transparent 70%)',
        }}
      />

      {/* Screens stacked — active one fades + settles in */}
      <div className="relative w-full">
        {SCREENS.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`FINS სისტემის გვერდი ${i + 1}`}
            draggable={false}
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
            className="w-full h-auto block"
            style={{
              position: i === 0 ? 'relative' : 'absolute',
              inset: 0,
              opacity: i === active ? 1 : 0,
              transform: i === active ? 'scale(1)' : 'scale(1.015)',
              transition: 'opacity 700ms ease-in-out, transform 900ms ease-out',
              willChange: 'opacity, transform',
            }}
          />
        ))}
      </div>

      {/* Slide indicators */}
      <div className="mt-5 flex items-center justify-center gap-2">
        {SCREENS.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`სლაიდი ${i + 1}`}
            onClick={() => goTo(i)}
            className={`h-[7px] rounded-full transition-all duration-300 ease-out ${
              i === active
                ? 'w-7 bg-[#3D64FE]'
                : 'w-[7px] bg-[#3E4259]/[0.18] hover:bg-[#3E4259]/[0.34]'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
