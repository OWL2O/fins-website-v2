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
  { label: 'ფასები', href: '#pricing' },
  { label: 'კონტაქტი', href: '#contact' },
]

const SECTION_IDS = NAV.map((n) => n.href.slice(1))

/**
 * theme="dark"  — transparent over dark pages (Contact, legal). Default.
 * theme="light" — dark text over light pages (Home / Figma redesign).
 */
export default function Navbar({ theme = 'dark' }) {
  const headerRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('მთავარი')
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const isHome = pathname === '/'
  const light = theme === 'light'

  // Entrance animation on load
  useEffect(() => {
    gsap.fromTo(headerRef.current,
      { y: -40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }
    )
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    window.dispatchEvent(new CustomEvent('navmenu', { detail: { open } }))
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

  // ── Theme tokens ───────────────────────────────────────────
  const headerBg = light
    ? (open ? '#FFFFFF' : scrolled ? 'rgba(255,255,255,0.88)' : 'transparent')
    : (open ? '#161f3c' : scrolled ? 'rgba(15, 20, 27, 0.85)' : 'transparent')

  const borderCls = light ? 'border-[#3E4259]/[0.10]' : 'border-white/[0.22]'
  const pillWrapCls = light
    ? 'bg-[#3E4259]/[0.05] border-[#3E4259]/[0.08]'
    : 'bg-white/[0.04] border-white/[0.08]'
  const itemTextCls = light ? 'text-[#3E4259]' : 'text-white'
  const activePillCls = light
    ? 'bg-white border-[#3E4259]/[0.10] shadow-[0_3px_12px_rgba(62,66,89,0.10)]'
    : 'bg-white/[0.08] border-white/[0.10]'

  return (
    <>
    <header
      ref={headerRef}
      className={`sticky top-0 z-50 border-b-[0.5px] ${borderCls} transition-[background-color,backdrop-filter] duration-300 ease-out`}
      style={{
        opacity: 0,
        backgroundColor: headerBg,
        backdropFilter: scrolled && !open ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled && !open ? 'blur(12px)' : 'none',
      }}
    >
      <div className="w-full max-w-full mx-auto px-6">
        <div className="relative flex items-center justify-between h-[72px] lg:h-[65px] min-[1700px]:h-[80px]">
          {/* Logo */}
          <a
            href={isHome ? '#hero' : '/'}
            onClick={isHome ? (e) => scrollTo(e, '#hero') : undefined}
            className="shrink-0 flex items-center"
            style={light ? { filter: 'brightness(0)', opacity: 0.85 } : undefined}
          >
            <Logo />
          </a>

          {/* Desktop nav pill — centered absolutely within header */}
          <nav className={`hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2 h-[42px] min-[1700px]:h-[52px] border rounded-full p-1 ${pillWrapCls}`}>
            {NAV.map((item) => {
              const isActive = active === item.label
              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => scrollTo(e, item.href)}
                  className={`relative h-full inline-flex items-center justify-center rounded-full px-[15px] text-[14px] font-normal leading-none tracking-normal whitespace-nowrap ${itemTextCls}`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="navActive"
                      className={`absolute inset-0 rounded-full border ${activePillCls}`}
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
            {light ? (
              <motion.a
                href="https://service.fins.ge"
                whileHover={{ y: -1, boxShadow: '0 12px 34px rgba(61,100,254,0.30)' }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="hidden sm:inline-flex items-center justify-center gap-2.5 w-[225px] h-[42px] min-[1700px]:h-[52px] rounded-full bg-[#3D64FE] hover:bg-[#3556E5] text-[14px] font-medium leading-none tracking-normal text-white transition-colors duration-200"
              >
                სისტემაში შესვლა
                <ArrowRight size={15} />
              </motion.a>
            ) : (
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
            )}

            {/* Hamburger */}
            <button
              type="button"
              aria-label="Toggle menu"
              onClick={() => setOpen((s) => !s)}
              className={`lg:hidden relative flex flex-col items-center justify-center gap-0 rounded-full border bg-transparent w-10 h-10 cursor-pointer transition ${
                light
                  ? 'border-[#3E4259]/[0.18] hover:bg-[#3E4259]/[0.05] burger-dark'
                  : 'border-white/[0.12] hover:bg-white/[0.06]'
              } ${open ? 'burger-active' : 'burger-not-active'}`}
            >
              <span className="burger-line burger-top" />
              <span className="burger-line burger-mid" />
              <span className="burger-line burger-bot" />
            </button>
          </div>
        </div>
      </div>

    </header>

    {/* Mobile menu — rendered outside <header> so backdrop-filter doesn't
        create a containing block that breaks position:fixed */}
    <AnimatePresence>
      {open && (
        <motion.div
          key="mobile-menu"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={`lg:hidden fixed inset-x-0 top-[72px] px-5 pt-5 pb-8 min-h-[calc(100vh-72px)] z-40 ${
            light ? 'bg-white' : 'bg-[#161f3c]'
          }`}
        >
            <nav className="flex flex-col">
              {NAV.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => { scrollTo(e, item.href); setOpen(false) }}
                  className={`px-5 py-3.5 text-[14px] font-normal ${light ? 'text-[#3E4259]' : 'text-white'}`}
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

              {/* Social links */}
              <div className="mt-6 flex items-center gap-3 px-5">
                <a
                  href="https://www.facebook.com/fins.ge"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 flex-1 justify-center py-3 rounded-2xl text-[13px] font-medium text-white"
                  style={{ background: '#1877F2' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </a>
                <a
                  href="https://wa.me/995500114090"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 flex-1 justify-center py-3 rounded-2xl text-[13px] font-medium text-white"
                  style={{ background: '#25D366' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
              </div>
            </nav>
          </motion.div>
      )}
    </AnimatePresence>
    </>
  )
}
