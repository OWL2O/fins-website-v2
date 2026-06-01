import { useEffect, useRef, useState, useCallback } from 'react'
import gsap from 'gsap'

const PHOTOS = [
  { file: 'ბუღალტერია.png',                        label: 'ბუღალტერია' },
  { file: 'გაყიდვები.png',                         label: 'გაყიდვები' },
  { file: 'ნაშთების მართვა ლოჯისტიკა.png',        label: 'ნაშთების მართვა ლოჯისტიკა' },
  { file: 'სიმარტივე და სტაბილურობა.png',         label: 'სიმარტივე და სტაბილურობა' },
  { file: 'ფინსი.png',                             label: 'ფინსი' },
  { file: 'შეძენა იმპორტი.png',                    label: 'შეძენა იმპორტი' },
  { file: 'წარმოება.png',                          label: 'წარმოება' },
  { file: 'rs.ge სინქრონიზაცია მობ.png',           label: 'rs.ge სინქრონიზაცია' },
  { file: 'აუთსორსი და სხვა სერვისები.png',       label: 'აუთსორსი და სხვა სერვისები' },
  { file: 'აღრიცხვის  ავტომატიზაცია.png',         label: 'აღრიცხვის ავტომატიზაცია' },
].map(({ file, label }) => ({
  label,
  src: `/assets/main-page-photos/${encodeURIComponent(file.replace(/\.png$/, '.webp'))}`,
}))

const SLIDE_DURATION = 5200 // ms

export default function PhotoGallery() {
  const [active, setActive]   = useState(0)
  const activeRef             = useRef(0)
  const slideRefs             = useRef([])
  const imgRefs               = useRef([])
  const labelRef              = useRef(null)
  const counterRef            = useRef(null)
  const barRefs               = useRef([])
  const progressRef           = useRef(null) // active bar fill tween
  const kbRef                 = useRef(null) // ken-burns tween
  const timerRef              = useRef(null)
  const pausedRef             = useRef(false)

  // ─── Ken Burns ────────────────────────────────────────────────────────────

  const startKB = (imgEl) => {
    if (kbRef.current) kbRef.current.kill()
    gsap.set(imgEl, { scale: 1, xPercent: 0, yPercent: 0 })
    // Subtle drift + zoom — alternate direction per call for variety
    const dir = Math.random() > 0.5 ? 1 : -1
    kbRef.current = gsap.to(imgEl, {
      scale: 1.09,
      xPercent: dir * 1.5,
      yPercent: dir * -1,
      duration: (SLIDE_DURATION / 1000) + 1.5,
      ease: 'none',
    })
  }

  // ─── Bar indicators ───────────────────────────────────────────────────────

  const updateBars = (nextIdx) => {
    barRefs.current.forEach((bar, i) => {
      if (!bar) return
      gsap.to(bar, {
        scaleX:  i === nextIdx ? 1    : 0.22,
        opacity: i === nextIdx ? 1    : 0.38,
        duration: 0.38,
        ease: 'power2.out',
      })
    })
  }

  // ─── Label ────────────────────────────────────────────────────────────────

  const updateLabel = (nextIdx) => {
    const el = labelRef.current
    const ct = counterRef.current
    if (!el) return

    gsap.killTweensOf([el, ct])
    gsap.to([el, ct], {
      y: -10, opacity: 0, duration: 0.18, ease: 'power2.in',
      onComplete: () => {
        if (el) el.textContent = PHOTOS[nextIdx].label
        if (ct) ct.textContent = `${String(nextIdx + 1).padStart(2, '0')} / ${String(PHOTOS.length).padStart(2, '0')}`
        gsap.fromTo([el, ct],
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.48, ease: 'power2.out', stagger: 0.06 }
        )
      },
    })
  }

  // ─── Core transition ──────────────────────────────────────────────────────

  const transition = useCallback((nextIdx) => {
    const curIdx  = activeRef.current
    if (nextIdx === curIdx) return

    const curSlide = slideRefs.current[curIdx]
    const nxtSlide = slideRefs.current[nextIdx]
    const nxtImg   = imgRefs.current[nextIdx]

    // Stack
    gsap.set(nxtSlide, { zIndex: 2, opacity: 0 })
    gsap.set(curSlide, { zIndex: 1 })

    // Crossfade
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(curSlide, { zIndex: 0, opacity: 0 })
        gsap.set(nxtSlide, { zIndex: 1 })
      },
    })
    tl.to(nxtSlide, { opacity: 1, duration: 1.1, ease: 'power2.inOut' }, 0)
    tl.to(curSlide, { opacity: 0, duration: 0.65, ease: 'power2.in' }, 0.35)

    startKB(nxtImg)
    updateBars(nextIdx)
    updateLabel(nextIdx)

    activeRef.current = nextIdx
  }, [])

  // ─── Auto-advance timer ───────────────────────────────────────────────────

  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      if (pausedRef.current) return
      setActive(a => {
        const next = (a + 1) % PHOTOS.length
        return next
      })
    }, SLIDE_DURATION)
  }, [])

  // ─── Mount ────────────────────────────────────────────────────────────────

  useEffect(() => {
    slideRefs.current.forEach((s, i) => {
      gsap.set(s, { opacity: i === 0 ? 1 : 0, zIndex: i === 0 ? 1 : 0 })
    })
    barRefs.current.forEach((b, i) => {
      if (b) gsap.set(b, { scaleX: i === 0 ? 1 : 0.22, opacity: i === 0 ? 1 : 0.38 })
    })
    startKB(imgRefs.current[0])
    resetTimer()

    return () => {
      clearInterval(timerRef.current)
      if (kbRef.current) kbRef.current.kill()
    }
  }, [resetTimer])

  // ─── React to state changes ───────────────────────────────────────────────

  useEffect(() => {
    if (active !== activeRef.current) {
      transition(active)
      resetTimer()
    }
  }, [active, transition, resetTimer])

  // ─── Manual navigation ────────────────────────────────────────────────────

  const goTo = (idx) => {
    if (idx === active) return
    setActive(idx)
  }

  const goPrev = () => goTo((active - 1 + PHOTOS.length) % PHOTOS.length)
  const goNext = () => goTo((active + 1) % PHOTOS.length)

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <section
      className="relative w-full bg-[#090D13] overflow-hidden select-none"
      style={{ height: 'clamp(500px, 74vh, 880px)' }}
      onMouseEnter={() => { pausedRef.current = true }}
      onMouseLeave={() => { pausedRef.current = false }}
    >
      {/* ── Slides ─────────────────────────────────────────── */}
      {PHOTOS.map((photo, i) => (
        <div
          key={photo.label}
          ref={el => { slideRefs.current[i] = el }}
          className="absolute inset-0 overflow-hidden"
        >
          <img
            ref={el => { imgRefs.current[i] = el }}
            src={photo.src}
            alt={photo.label}
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover will-change-transform"
            draggable={false}
          />
        </div>
      ))}

      {/* ── Overlay gradients ──────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background: [
            'linear-gradient(to top,    rgba(9,13,19,0.82) 0%, rgba(9,13,19,0.22) 38%, transparent 65%)',
            'linear-gradient(to right,  rgba(9,13,19,0.55) 0%, transparent 45%)',
            'linear-gradient(to bottom, rgba(9,13,19,0.30) 0%, transparent 25%)',
          ].join(', '),
        }}
      />

      {/* ── Bottom-left UI ─────────────────────────────────── */}
      <div className="absolute bottom-9 left-8 sm:left-12 lg:left-16 z-20 flex flex-col gap-4">
        {/* Counter */}
        <span
          ref={counterRef}
          className="text-white/40 text-[11px] sm:text-[12px] font-medium tracking-[0.18em] uppercase leading-none"
        >
          01 / {String(PHOTOS.length).padStart(2, '0')}
        </span>

        {/* Photo label */}
        <p
          ref={labelRef}
          className="font-banner uppercase text-white text-[22px] sm:text-[30px] lg:text-[38px] leading-none tracking-normal max-w-[560px]"
        >
          {PHOTOS[0].label}
        </p>

        {/* Progress bars */}
        <div className="flex items-center gap-[5px] mt-0.5">
          {PHOTOS.map((_, i) => (
            <button
              key={i}
              ref={el => { barRefs.current[i] = el }}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="h-[2.5px] w-5 sm:w-6 rounded-full bg-white origin-left cursor-pointer focus:outline-none"
            />
          ))}
        </div>
      </div>

      {/* ── Prev / Next ────────────────────────────────────── */}
      <button
        onClick={goPrev}
        aria-label="Previous photo"
        className="group absolute left-5 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full flex items-center justify-center bg-white/[0.08] border border-white/[0.12] hover:bg-white/[0.18] backdrop-blur-md transition-colors duration-200"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-white">
          <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <button
        onClick={goNext}
        aria-label="Next photo"
        className="group absolute right-5 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full flex items-center justify-center bg-white/[0.08] border border-white/[0.12] hover:bg-white/[0.18] backdrop-blur-md transition-colors duration-200"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-white">
          <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </section>
  )
}
