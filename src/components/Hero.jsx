import { useEffect, useRef, useState, useCallback } from 'react'
import { Box, Lock, Clock, Cloud, Star, ArrowRight } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)
// Prevent GSAP from catching up after tab loses focus — keeps animation smooth
gsap.ticker.lagSmoothing(0)

// ─── Feature cards ───────────────────────────────────────────────────────────

const FEATURES = [
  { icon: Box,   title: 'სანდო პლატფორმა',     text: 'დაცული მონაცემები და სტაბილური სისტემა',         tint: 'text-brand-300'   },
  { icon: Lock,  title: 'მაღალი უსაფრთხოება',   text: 'დაშიფრული კავშირი და ძლიერი ავტენტიფიკაცია',     tint: 'text-violet-300'  },
  { icon: Clock, title: 'ხელმისაწვდომობა',      text: 'სისტემაზე წვდომა 24/7 ნებისმიერი ადგილიდან',     tint: 'text-emerald-300' },
  { icon: Cloud, title: 'Cloud-Based სისტემა',  text: 'ღრუბლოვანი ინფრასტრუქტურა და ავტომატური ბექაპი', tint: 'text-sky-300'     },
  { icon: Star,  title: 'ხელოვნური ინტელექტი', text: 'ჭკვიანი ანალიტიკა და სწრაფი პროგნოზირება',       tint: 'text-pink-300'    },
]

// ─── Background photos ───────────────────────────────────────────────────────

const PHOTOS = [
  { file: 'ბუღალტერია.webp',                       label: 'ბუღალტერია' },
  { file: 'გაყიდვები.webp',                        label: 'გაყიდვები' },
  { file: 'ნაშთების მართვა ლოჯისტიკა.webp',       label: 'ნაშთების მართვა ლოჯისტიკა' },
  { file: 'სიმარტივე და სტაბილურობა.webp',        label: 'სიმარტივე და სტაბილურობა' },
  { file: 'ფინსი.webp',                            label: 'ფინსი' },
  { file: 'შეძენა იმპორტი.webp',                   label: 'შეძენა იმპორტი' },
  { file: 'წარმოება.webp',                         label: 'წარმოება' },
  { file: 'rs.ge სინქრონიზაცია მობ.webp',          label: 'rs.ge სინქრონიზაცია' },
  { file: 'აუთსორსი და სხვა სერვისები.webp',      label: 'აუთსორსი და სხვა სერვისები' },
  { file: 'აღრიცხვის  ავტომატიზაცია.webp',        label: 'აღრიცხვის ავტომატიზაცია' },
].map(({ file, label }) => ({
  label,
  src: `/assets/main-page-photos/${encodeURIComponent(file)}`,
}))

const SLIDE_MS = 5200

// ─── Component ───────────────────────────────────────────────────────────────

export default function Hero() {
  const sectionRef = useRef(null)

  // ── Mobile detection ───────────────────────────────────────────────────────
  const isMobileRef = useRef(window.matchMedia('(max-width:639px)').matches)
  const [isMobile, setIsMobile] = useState(isMobileRef.current)
  useEffect(() => {
    const mq = window.matchMedia('(max-width:639px)')
    const cb = (e) => { isMobileRef.current = e.matches; setIsMobile(e.matches) }
    mq.addEventListener('change', cb)
    return () => mq.removeEventListener('change', cb)
  }, [])

  // ── Photo cycling ──────────────────────────────────────────────────────────
  const [photoIdx, setPhotoIdx]       = useState(0)
  const photoIdxRef                   = useRef(0)
  const slideRefs                     = useRef([])
  const imgRefs                       = useRef([])
  const kbRef                         = useRef(null)
  const photoTimer                    = useRef(null)

  // ── Heading driven by current photo ───────────────────────────────────────
  const makeLabel = (idx) => {
    if (isMobileRef.current) {
      const a = PHOTOS[idx].label
      const b = PHOTOS[(idx + 1) % PHOTOS.length].label
      // If first label already contains "და", use comma to avoid "X და Y და Z"
      const sep = (a.includes('და') || b.includes('და')) ? ', ' : ' და '
      return `${a}${sep}${b}`
    }
    return PHOTOS[idx].label
  }
  const [displayLabel, setDisplayLabel] = useState(() => makeLabel(0))
  const headingRef                      = useRef(null)
  const headingReady                    = useRef(false)   // skip entrance anim on mount

  // ── Accent glows ──────────────────────────────────────────────────────────
  const glowARef = useRef(null)
  const glowBRef = useRef(null)

  // ── Ken Burns ─────────────────────────────────────────────────────────────

  const startKB = (imgEl) => {
    if (kbRef.current) kbRef.current.kill()
    // Subtle scale only — no translate, less GPU composite layers
    gsap.set(imgEl, { scale: 1, xPercent: 0, yPercent: 0, force3D: true })
    kbRef.current = gsap.to(imgEl, {
      scale: 1.05,
      duration: (SLIDE_MS / 1000) + 2,
      ease: 'none',
      force3D: true,
      overwrite: 'auto',
    })
  }

  // ── Heading label swap (exit → text update → enter) ───────────────────────

  const updateHeading = useCallback((idx) => {
    const el = headingRef.current
    if (!el) return
    gsap.killTweensOf(el)

    // Exit: slide up + fade out
    gsap.to(el, {
      y: -18,
      opacity: 0,
      duration: 0.28,
      ease: 'power3.in',
      onComplete: () => {
        if (isMobileRef.current) {
          const a = PHOTOS[idx].label
          const b = PHOTOS[(idx + 1) % PHOTOS.length].label
          const sep = (a.includes('და') || b.includes('და')) ? ', ' : ' და '
          setDisplayLabel(`${a}${sep}${b}`)
        } else {
          setDisplayLabel(PHOTOS[idx].label)
        }
      },
    })
  }, [])

  // Entrance: fires after displayLabel state update patches the DOM
  useEffect(() => {
    if (!headingReady.current) {
      headingReady.current = true
      return // first mount handled by data-hero-enter GSAP timeline
    }
    const el = headingRef.current
    if (!el) return
    gsap.fromTo(
      el,
      { y: 22, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.52, ease: 'power3.out' },
    )
  }, [displayLabel])

  // ── Preload next image on demand ─────────────────────────────────────────

  const preloadNext = useCallback((currentIdx) => {
    const nextIdx = (currentIdx + 1) % PHOTOS.length
    const img = new Image()
    img.src = PHOTOS[nextIdx].src
  }, [])

  // ── Crossfade transition ──────────────────────────────────────────────────

  const transition = useCallback((nextIdx) => {
    const curIdx = photoIdxRef.current
    if (nextIdx === curIdx) return
    preloadNext(nextIdx)

    const curSlide = slideRefs.current[curIdx]
    const nxtSlide = slideRefs.current[nextIdx]

    gsap.set(nxtSlide, { zIndex: 2, opacity: 0 })
    gsap.set(curSlide, { zIndex: 1 })

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(curSlide, { zIndex: 0, opacity: 0 })
        gsap.set(nxtSlide, { zIndex: 1 })
      },
    })
    tl.to(nxtSlide, { opacity: 1, duration: 1.1, ease: 'power2.inOut' }, 0)
    tl.to(curSlide, { opacity: 0, duration: 0.65, ease: 'power2.in' }, 0.35)

    startKB(imgRefs.current[nextIdx])
    updateHeading(nextIdx)
    photoIdxRef.current = nextIdx
  }, [updateHeading, preloadNext])

  // ── Auto-advance ──────────────────────────────────────────────────────────

  const resetTimer = useCallback(() => {
    clearInterval(photoTimer.current)
    photoTimer.current = setInterval(() => {
      // Mobile: step by 2 to advance full pairs; desktop: step by 1
      const step = isMobileRef.current ? 2 : 1
      setPhotoIdx(a => (a + step) % PHOTOS.length)
    }, SLIDE_MS)
  }, [])

  const goTo = (idx) => {
    if (idx === photoIdx) return
    setPhotoIdx(idx)
  }

  // ── Init ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    // Eagerly preload the second image; the rest load on demand via preloadNext
    preloadNext(0)

    // Photo initial state — promote each slide to its own compositor layer
    slideRefs.current.forEach((s, i) => {
      gsap.set(s, {
        opacity: i === 0 ? 1 : 0,
        zIndex:  i === 0 ? 1 : 0,
        force3D: true,
        willChange: 'opacity',
      })
    })
    startKB(imgRefs.current[0])
    resetTimer()

    // Text entrance — staggered on load
    const ctx = gsap.context(() => {
      const els = gsap.utils.toArray('[data-hero-enter]')
      gsap.set(els, { y: 32, opacity: 0 })
      const tl = gsap.timeline({ delay: 0.2 })
      els.forEach((el, i) => {
        tl.to(el, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }, i * 0.11)
      })
    }, sectionRef)

    // Feature cards — appear on first scroll
    const cards = Array.from(sectionRef.current.querySelectorAll('[data-hero-card]'))
    gsap.set(cards, { y: 40, opacity: 0 })
    let cardsFired = false
    const onScroll = () => {
      if (!cardsFired && window.scrollY > 80) {
        cardsFired = true
        gsap.to(cards, { y: 0, opacity: 1, duration: 0.5, stagger: 0.07, ease: 'power2.out' })
        window.removeEventListener('scroll', onScroll)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    // Accent glow pulse
    const glowTl = gsap.timeline({ repeat: -1, delay: 1.5 })
    if (glowARef.current && glowBRef.current) {
      gsap.set([glowARef.current, glowBRef.current], { opacity: 0 })
      glowTl
        .to(glowARef.current, { opacity: 1, duration: 3, ease: 'none' }, 0)
        .to(glowARef.current, { opacity: 0, duration: 3, ease: 'none' }, 3)
        .to(glowBRef.current, { opacity: 1, duration: 3, ease: 'none' }, 3)
        .to(glowBRef.current, { opacity: 0, duration: 3, ease: 'none' }, 6)
    }

    return () => {
      ctx.revert()
      glowTl.kill()
      clearInterval(photoTimer.current)
      if (kbRef.current) kbRef.current.kill()
      window.removeEventListener('scroll', onScroll)
    }
  }, [resetTimer])

  useEffect(() => {
    if (photoIdx !== photoIdxRef.current) {
      transition(photoIdx)
      resetTimer()
    }
  }, [photoIdx, transition, resetTimer])

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative isolate overflow-hidden text-white -mt-[72px] lg:-mt-[65px] min-[1700px]:-mt-[80px] min-h-screen bg-[#0A0E15] flex flex-col"
    >
      {/* ── Photo slides (background) — desktop only ───────────── */}
      <div className="hidden lg:block absolute inset-0 z-0">
        {PHOTOS.map((photo, i) => (
          <div
            key={photo.label}
            ref={el => { slideRefs.current[i] = el }}
            className="absolute inset-0 overflow-hidden"
            style={{ willChange: 'opacity' }}
          >
            <img
              ref={el => { imgRefs.current[i] = el }}
              src={photo.src}
              alt={photo.label}
              className="absolute inset-0 h-full w-full object-cover"
              style={{ willChange: 'transform' }}
              decoding={i === 0 ? 'sync' : 'async'}
              fetchPriority={i === 0 ? 'high' : 'low'}
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* ── Mobile: two photos stacked, each half the screen ────── */}
      <div className="lg:hidden absolute inset-0 z-0">
        {/* Top half */}
        <div className="absolute top-0 left-0 right-0 overflow-hidden" style={{ height: '50%' }}>
          {PHOTOS.map((photo, i) => (
            <img
              key={photo.label + '-t'}
              src={photo.src}
              alt={photo.label}
              draggable={false}
              loading={i <= 1 ? 'eager' : 'lazy'}
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                opacity: i === photoIdx ? 1 : 0,
                transition: 'opacity 1.1s ease',
              }}
            />
          ))}
        </div>

        {/* Thin seam between the two photos */}
        <div
          aria-hidden="true"
          className="absolute left-0 right-0 z-[1]"
          style={{ top: '50%', height: '2px', background: 'rgba(5,8,15,0.85)' }}
        />

        {/* Bottom half */}
        <div className="absolute left-0 right-0 bottom-0 overflow-hidden" style={{ top: '50%' }}>
          {PHOTOS.map((photo, i) => (
            <img
              key={photo.label + '-b'}
              src={photo.src}
              alt={photo.label}
              draggable={false}
              loading={i <= 1 ? 'eager' : 'lazy'}
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                opacity: i === (photoIdx + 1) % PHOTOS.length ? 1 : 0,
                transition: 'opacity 1.1s ease',
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Mobile overlay — uniform, bottom-heavy ─────────────── */}
      <div
        aria-hidden="true"
        className="lg:hidden pointer-events-none absolute inset-0 z-[1]"
        style={{
          background: [
            'linear-gradient(to bottom, rgba(8,12,18,0.45) 0%, rgba(8,12,18,0.28) 40%, rgba(8,12,18,0.88) 100%)',
            'linear-gradient(to right,  rgba(8,12,18,0.60) 0%, rgba(8,12,18,0.20) 60%, transparent 100%)',
          ].join(', '),
        }}
      />

      {/* ── Desktop overlay — left-heavy ────────────────────────── */}
      <div
        aria-hidden="true"
        className="hidden lg:block pointer-events-none absolute inset-0 z-[1]"
        style={{
          background: [
            'linear-gradient(to bottom, rgba(8,12,18,0.38) 0%, rgba(8,12,18,0.22) 45%, rgba(8,12,18,0.82) 100%)',
            'linear-gradient(to left,   rgba(8,12,18,0.28) 0%, transparent 35%)',
          ].join(', '),
        }}
      />

      {/* ── Accent glows ───────────────────────────────────────── */}
      <div ref={glowARef} aria-hidden="true" className="pointer-events-none absolute -bottom-48 -left-48 z-[2] h-[520px] w-[520px] rounded-full blur-[100px] bg-[rgba(61,100,254,0.20)]" style={{ transform: 'translateZ(0)' }} />
      <div ref={glowBRef} aria-hidden="true" className="pointer-events-none absolute -bottom-48 -left-48 z-[2] h-[520px] w-[520px] rounded-full blur-[100px] bg-[rgba(120,80,255,0.18)]" style={{ transform: 'translateZ(0)' }} />

      {/* ── Text block ─────────────────────────────────────────────
            Mobile  : in-flow, flex-1, content at the bottom
            Desktop : absolute, anchored bottom-left              */}
      <div className={[
        // shared
        'z-10 flex flex-col items-start text-left',
        'w-full max-w-[440px] sm:max-w-[400px]',
        // mobile: in flow, fills remaining height, text sits at bottom
        'relative flex-1 justify-end px-5 sm:px-8 pt-[100px] sm:pt-[110px] pb-10 sm:pb-12',
        // desktop: out of flow, pinned
        'lg:flex-none lg:absolute lg:bottom-14 xl:bottom-16',
        'lg:left-12 xl:left-16',
        'lg:px-0 lg:pt-0 lg:pb-0',
        'lg:max-w-[380px] xl:max-w-[420px] min-[1700px]:max-w-[500px]',
      ].join(' ')}>

        {/* Accent rule */}
        <div data-hero-enter className="h-px w-8 bg-white/30 mb-3 sm:mb-4 lg:mb-5" />

        {/* Heading — live photo name */}
        <div className="overflow-hidden w-full">
          <h1
            ref={headingRef}
            data-hero-enter
            className="font-banner uppercase text-white w-full text-[22px] sm:text-[26px] lg:text-[30px] xl:text-[34px] min-[1700px]:text-[42px] leading-[1.2] tracking-wide"
          >
            {displayLabel}
          </h1>
        </div>

        {/* Subheading */}
        <p
          data-hero-enter
          className="mt-3 lg:mt-4 text-slate-400/90 text-[12px] sm:text-[12px] lg:text-[12px] xl:text-[13px] min-[1700px]:text-[14px] leading-relaxed font-light max-w-[320px] sm:max-w-[340px] lg:max-w-[320px] xl:max-w-[360px]"
        >
          შპს „ფინს პროგრამ სერვისი" გთავაზობთ აღრიცხვის თანამედროვე ონლაინ
          პლატფორმას, რომელიც შექმნილია მცირე და საშუალო ბიზნესის საჭიროებებისთვის.
        </p>

        {/* CTA */}
        <div data-hero-enter className="mt-5 lg:mt-6 min-[1700px]:mt-8">
          <a
            href="https://service.fins.ge"
            className="inline-flex items-center gap-2 px-6 h-[42px] sm:h-[40px] min-[1700px]:h-[48px] rounded-full text-[13px] sm:text-[13px] font-medium tracking-widest leading-none text-white bg-[#3D64FE] border border-white/20 active:scale-95 hover:bg-[#3556E5] hover:-translate-y-px hover:shadow-[0_12px_40px_rgba(61,100,254,0.45)] transition-all duration-300 ease-out"
          >
            დაწყება
            <ArrowRight size={13} strokeWidth={2} />
          </a>
        </div>

      </div>

      {/* ── Left arrow (desktop only) ───────────────────────────── */}
      <button
        onClick={() => goTo((photoIdx - 1 + PHOTOS.length) % PHOTOS.length)}
        aria-label="Previous photo"
        className="hidden lg:flex absolute left-5 top-1/2 -translate-y-1/2 z-20 h-10 w-10 items-center justify-center rounded-full bg-white/[0.08] border border-white/[0.12] hover:bg-white/[0.22] backdrop-blur-md transition-colors duration-200"
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="text-white">
          <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* ── Right arrow (desktop only) ──────────────────────────── */}
      <button
        onClick={() => goTo((photoIdx + 1) % PHOTOS.length)}
        aria-label="Next photo"
        className="hidden lg:flex absolute right-5 top-1/2 -translate-y-1/2 z-20 h-10 w-10 items-center justify-center rounded-full bg-white/[0.08] border border-white/[0.12] hover:bg-white/[0.22] backdrop-blur-md transition-colors duration-200"
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="text-white">
          <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

    </section>
  )
}
