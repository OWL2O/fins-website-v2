import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function ConnectingLines() {
  const svgRef = useRef(null)

  useEffect(() => {
    const lines = svgRef.current.querySelectorAll('line')

    lines.forEach((line) => {
      const length = Math.sqrt(
        Math.pow(line.x2.baseVal.value - line.x1.baseVal.value, 2) +
        Math.pow(line.y2.baseVal.value - line.y1.baseVal.value, 2)
      )
      gsap.set(line, {
        strokeDasharray: length,
        strokeDashoffset: length,
      })
    })

    const leftLines = svgRef.current.querySelectorAll('[data-side="left"]')
    const rightLines = svgRef.current.querySelectorAll('[data-side="right"]')

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: svgRef.current,
        start: 'top 70%',
        end: 'top 40%',
        scrub: 1,
      },
    })

    // Draw left lines from center outward with stagger
    leftLines.forEach((line, i) => {
      const length = Math.sqrt(
        Math.pow(line.x2.baseVal.value - line.x1.baseVal.value, 2) +
        Math.pow(line.y2.baseVal.value - line.y1.baseVal.value, 2)
      )
      tl.to(line, {
        strokeDashoffset: 0,
        duration: 1,
        ease: 'power2.inOut',
      }, i * 0.06)
    })

    // Draw right lines from center outward with stagger
    rightLines.forEach((line, i) => {
      const length = Math.sqrt(
        Math.pow(line.x2.baseVal.value - line.x1.baseVal.value, 2) +
        Math.pow(line.y2.baseVal.value - line.y1.baseVal.value, 2)
      )
      tl.to(line, {
        strokeDashoffset: 0,
        duration: 1,
        ease: 'power2.inOut',
      }, i * 0.06)
    })

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === svgRef.current) st.kill()
      })
    }
  }, [])

  // Center point: 600, 100
  // Left lines: from (600,100) to left edge spread
  // Right lines: from (600,100) to right edge spread
  const leftLines = [
    { x: 0, y: 5, opacity: 0.12 },
    { x: 0, y: 35, opacity: 0.18 },
    { x: 0, y: 60, opacity: 0.22 },
    { x: 0, y: 85, opacity: 0.28 },
    { x: 0, y: 110, opacity: 0.28 },
    { x: 0, y: 135, opacity: 0.22 },
    { x: 0, y: 165, opacity: 0.18 },
    { x: 0, y: 195, opacity: 0.12 },
  ]

  const rightLines = [
    { x: 1200, y: 5, opacity: 0.12 },
    { x: 1200, y: 35, opacity: 0.18 },
    { x: 1200, y: 60, opacity: 0.22 },
    { x: 1200, y: 85, opacity: 0.28 },
    { x: 1200, y: 110, opacity: 0.28 },
    { x: 1200, y: 135, opacity: 0.22 },
    { x: 1200, y: 165, opacity: 0.18 },
    { x: 1200, y: 195, opacity: 0.12 },
  ]

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 1200 200"
      className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-full h-auto pointer-events-none select-none z-0"
      preserveAspectRatio="none"
    >
      {leftLines.map((l, i) => (
        <line
          key={`l-${i}`}
          data-side="left"
          x1={600}
          y1={100}
          x2={l.x}
          y2={l.y}
          stroke="#3D64FE"
          strokeWidth="0.8"
          opacity={l.opacity}
        />
      ))}
      {rightLines.map((l, i) => (
        <line
          key={`r-${i}`}
          data-side="right"
          x1={600}
          y1={100}
          x2={l.x}
          y2={l.y}
          stroke="#3D64FE"
          strokeWidth="0.8"
          opacity={l.opacity}
        />
      ))}
    </svg>
  )
}
