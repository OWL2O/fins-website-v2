import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import gsap from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import Logo from './Logo.jsx'

gsap.registerPlugin(ScrollToPlugin)

const NAV = [
  { label: 'მთავარი', href: '#hero' },
  { label: 'სერვისები', href: '#services' },
  { label: 'ჩვენ შესახებ', href: '#about' },
  { label: 'ბუღალტერია', href: '#accounting' },
  { label: 'FAQ', href: '#faq' },
  { label: 'ფასები', href: '#pricing' },
]

const SECTION_IDS = NAV.map((n) => n.href.slice(1))

export default function Navbar() {
  const headerRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('მთავარი')
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const isHome = pathname === '/'

  // Entrance animation on load
  useEffect(() => {
    gsap.fromTo(headerRef.current,
      { y: -40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }
    )
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Clear active pill on non-home pages
  useEffect(() => {
    if (!isHome) setActive(null)
    else setActive('მთავარი')
  }, [isHome])

  // Track which section is in view — only on home page
  useEffect(() => {
    if (!isHome) return

    const handleScroll = () => {
      const threshold = window.innerHeight * 0.35
      let current = SECTION_IDS[0]
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id)
        if (!el) continue
        if (el.getBoundingClientRect().top <= threshold) current = id
      }
      const match = NAV.find((n) => n.href === `#${current}`)
      if (match) setActive(match.label)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isHome])

  const scrollTo = (e, href) => {
    e.preventDefault()
    if (!isHome) {
      navigate('/' + href)
      return
    }
    setActive(NAV.find((n) => n.href === href)?.label)
    gsap.to(window, { scrollTo: href, duration: 0.8, ease: 'power2.inOut' })
  }

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 border-b-[0.5px] border-white/[0.22] transition-[background-color,backdrop-filter] duration-300 ease-out"
      style={{
        opacity: 0,
        backgroundColor: scrolled ? 'rgba(15, 20, 27, 0.85)' : open ? '#161f3c' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
      }}
    >
      <div className="w-full max-w-full mx-auto px-6">
        <div className="relative flex items-center justify-between h-[72px] lg:h-[65px] min-[1700px]:h-[80px]">
          {/* Logo */}
          <a
            href={isHome ? '#hero' : '/'}
            onClick={isHome ? (e) => scrollTo(e, '#hero') : undefined}
            className="shrink-0 flex items-center"
          >
            <Logo />
          </a>

          {/* Desktop nav pill — centered absolutely within header */}
          <nav className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2 h-[42px] min-[1700px]:h-[52px] bg-white/[0.04] border border-white/[0.08] rounded-full p-1">
            {NAV.map((item) => {
              const isActive = active === item.label
              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => scrollTo(e, item.href)}
                  className="relative h-full inline-flex items-center justify-center rounded-full px-[15px] text-[14px] font-normal leading-none tracking-normal text-white whitespace-nowrap"
                >
                  {isActive && (
                    <motion.span
                      layoutId="navActive"
                      className="absolute inset-0 rounded-full bg-white/[0.08] border border-white/[0.10]"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </a>
              )
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3 shrink-0">
            <motion.a
              href="https://service.fins.ge"
              whileHover={{
                borderColor: 'rgba(255,255,255,0.40)',
                backgroundColor: 'rgba(255,255,255,0.05)',
              }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="hidden sm:inline-flex items-center justify-center gap-2.5 w-[225px] h-[42px] min-[1700px]:h-[52px] rounded-full border-[0.5px] border-white/[0.22] bg-transparent text-[14px] font-normal leading-none tracking-normal text-white"
            >
              სისტემაში შესვლა
              <ArrowRight size={15} />
            </motion.a>

            {/* Hamburger */}
            <button
              type="button"
              aria-label="Toggle menu"
              onClick={() => setOpen((s) => !s)}
              className={`lg:hidden relative flex flex-col items-center justify-center gap-0 rounded-full border border-white/[0.12] bg-transparent w-10 h-10 cursor-pointer hover:bg-white/[0.06] transition ${open ? 'burger-active' : 'burger-not-active'}`}
            >
              <span className="burger-line burger-top" />
              <span className="burger-line burger-mid" />
              <span className="burger-line burger-bot" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`lg:hidden fixed inset-x-0 top-[72px] px-5 pt-5 pb-8 min-h-[calc(100vh-72px)] z-30 ${scrolled ? 'bg-[rgba(15,20,27,0.85)] backdrop-blur-[12px]' : 'bg-[#161f3c]'}`}
          >
            <nav className="flex flex-col">
              {NAV.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => { scrollTo(e, item.href); setOpen(false) }}
                  className="px-5 py-3.5 text-white text-[14px] font-normal"
                >
                  {item.label}
                </a>
              ))}
              <a
                href="https://service.fins.ge"
                onClick={() => setOpen(false)}
                className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-[#3D64FE] px-5 py-3.5 text-[14px] font-medium text-white"
              >
                სისტემაში შესვლა
                <ArrowRight size={15} />
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
