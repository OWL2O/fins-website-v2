import { useEffect, useRef } from 'react'
import { ArrowRight } from 'lucide-react'
import gsap from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { BrowserFrame, DemoScaler } from './BrowserFrame.jsx'
import TransactionsDemo from './TransactionsDemo.jsx'

gsap.registerPlugin(ScrollToPlugin)
// Prevent GSAP from catching up after tab loses focus — keeps animation smooth
gsap.ticker.lagSmoothing(0)

/**
 * Hero — Figma light design ("აღრიცხვის ავტომატიზაცია") with the live,
 * interactive გატარებები module demo inside a browser frame.
 */
export default function Hero() {
  const sectionRef = useRef(null)
  const demoRef = useRef(null)
  const floatRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Staggered text entrance
      const els = gsap.utils.toArray('[data-hero-enter]')
      gsap.set(els, { y: 34, opacity: 0 })
      const tl = gsap.timeline({ delay: 0.15 })
      els.forEach((el, i) => {
        tl.to(el, { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out' }, i * 0.12)
      })

      // Demo frame — rises, settles, then floats forever
      gsap.set(demoRef.current, { y: 72, opacity: 0, scale: 0.965 })
      tl.to(
        demoRef.current,
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.9,
          ease: 'power3.out',
          onComplete: () => {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
            floatRef.current = gsap.to(demoRef.current, {
              y: -9,
              duration: 3.4,
              ease: 'sine.inOut',
              yoyo: true,
              repeat: -1,
              force3D: true,
            })
          },
        },
        0.42
      )
    }, sectionRef)

    // Pause the infinite float while the demo is offscreen
    const io = new IntersectionObserver(([entry]) => {
      const tween = floatRef.current
      if (!tween) return
      if (entry.isIntersecting) tween.play()
      else tween.pause()
    }, { threshold: 0 })
    if (demoRef.current) io.observe(demoRef.current)

    return () => { io.disconnect(); ctx.revert() }
  }, [])

  // The demo is interactive — hold the float still while the cursor is inside
  // so the form doesn't bob under the user's pointer.
  const pauseFloat = () => floatRef.current?.pause()
  const resumeFloat = () => floatRef.current?.play()

  const scrollToContact = (e) => {
    e.preventDefault()
    gsap.to(window, { scrollTo: '#contact', duration: 0.9, ease: 'power2.inOut' })
  }

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative isolate overflow-hidden -mt-[72px] lg:-mt-[65px] min-[1700px]:-mt-[80px] bg-white"
    >
      {/* ── Soft corner glows (Figma light gradient) ─────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: [
            'radial-gradient(46% 38% at 0% 0%, rgba(96,108,255,0.11), transparent 70%)',
            'radial-gradient(42% 36% at 100% 2%, rgba(61,100,254,0.10), transparent 70%)',
            'radial-gradient(40% 34% at 100% 88%, rgba(110,190,150,0.10), transparent 70%)',
            'radial-gradient(38% 32% at 0% 92%, rgba(96,108,255,0.08), transparent 70%)',
          ].join(', '),
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-40 -z-10 h-[620px] w-[620px]"
        style={{ background: 'radial-gradient(closest-side, rgba(94,110,255,0.10), transparent 72%)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-44 -right-40 -z-10 h-[660px] w-[660px]"
        style={{ background: 'radial-gradient(closest-side, rgba(61,100,254,0.09), transparent 72%)' }}
      />

      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 pt-[128px] sm:pt-[150px] lg:pt-[160px] min-[1700px]:pt-[185px] pb-16 sm:pb-20 lg:pb-24 flex flex-col items-center text-center">

        {/* ── Heading ──────────────────────────────────────────── */}
        <h1
          data-hero-enter
          className="font-banner uppercase text-[#3E4259] tracking-normal leading-[1.18] text-[30px] sm:text-[44px] lg:text-[56px] min-[1700px]:text-[64px] max-w-[1000px]"
        >
          აღრიცხვის ავტომატიზაცია
        </h1>

        {/* ── Subheading ───────────────────────────────────────── */}
        <p
          data-hero-enter
          className="mt-6 text-[#3E4259]/75 font-medium leading-[1.65] text-[14px] sm:text-[16px] lg:text-[17px] max-w-[720px]"
        >
          შპს „ფინს პროგრამ სერვისი" გთავაზობთ აღრიცხვის თანამედროვე ონლაინ
          პლატფორმას, რომელიც შექმნილია მცირე და საშუალო ბიზნესის საჭიროებებისთვის.
        </p>

        {/* ── CTAs ─────────────────────────────────────────────── */}
        <div data-hero-enter className="mt-9 flex flex-col sm:flex-row items-center gap-3.5">
          <a
            href="https://service.fins.ge"
            className="inline-flex items-center justify-center gap-2 h-[48px] px-8 rounded-full text-[14px] font-semibold leading-none text-white bg-[#3D64FE] hover:bg-[#3556E5] hover:-translate-y-px hover:shadow-[0_14px_40px_rgba(61,100,254,0.35)] active:scale-95 transition-all duration-300 ease-out"
          >
            დაწყება
            <ArrowRight size={15} strokeWidth={2.2} />
          </a>
          <a
            href="#contact"
            onClick={scrollToContact}
            className="inline-flex items-center justify-center h-[48px] px-8 rounded-full text-[14px] font-semibold leading-none text-[#3D64FE] bg-white border border-[#3D64FE]/35 hover:border-[#3D64FE]/70 hover:bg-[#3D64FE]/[0.04] hover:-translate-y-px transition-all duration-300 ease-out shadow-[0_4px_18px_rgba(61,100,254,0.08)]"
          >
            ჩანიშნე შეხვედრა
          </a>
        </div>

        {/* ── Live გატარებები module demo ──────────────────────── */}
        <div
          ref={demoRef}
          className="mt-14 sm:mt-16 w-full max-w-[1180px]"
          style={{ opacity: 0, willChange: 'transform' }}
          onPointerEnter={pauseFloat}
          onPointerLeave={resumeFloat}
        >
          <DemoScaler naturalWidth={920} naturalHeight={604} maxScale={1.18}>
            <BrowserFrame url="https://fins.systemctl.xyz/">
              <TransactionsDemo />
            </BrowserFrame>
          </DemoScaler>
        </div>

      </div>
    </section>
  )
}
