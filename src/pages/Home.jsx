import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import Navbar from '../components/Navbar.jsx'
import Hero from '../components/Hero.jsx'
import Services from '../components/Services.jsx'
import About from '../components/About.jsx'
import Accounting from '../components/Accounting.jsx'
import FAQ from '../components/FAQ.jsx'
import CTA from '../components/CTA.jsx'
import Footer from '../components/Footer.jsx'
import ChatWidget from '../components/ChatWidget.jsx'

export default function Home() {
  const ctaGlowRef = useRef(null)

  useEffect(() => {
    const tl = gsap.timeline({ repeat: -1, ease: 'none' })
    tl.fromTo(
      ctaGlowRef.current,
      { top: '-20%' },
      { top: '100%', duration: 10, ease: 'none' }
    )
    return () => tl.kill()
  }, [])

  return (
    <div className="relative min-h-screen w-full bg-[#0F141B] text-ink-900 font-sans">
      <Navbar />
      <main className="overflow-x-clip">
        <Hero />
        <Services />
        <About />
        <Accounting />
        <FAQ />
        <div className="relative isolate overflow-hidden bg-[#10151C]">
          <div
            ref={ctaGlowRef}
            aria-hidden="true"
            className="pointer-events-none absolute -right-[200px] -z-10 h-[500px] w-[500px] rounded-full bg-brand-600/[0.19] blur-[80px]"
            style={{ transform: 'translateZ(0)' }}
          />
          <CTA />
          <Footer />
        </div>
      </main>
      <ChatWidget />
    </div>
  )
}
