import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)
// test
/** Tailwind `sm` (640px) — ტელეფონი = 639px და ქვემოთ */
const PHONE_MAX_WIDTH_QUERY = '(max-width: 639px)'

const COLUMNS = [
  {
    title: 'პროდუქტი',
    links: ['ბუღალტერია', 'ოპერაციები', 'პერსონალური', 'ანგარიშგება'],
  },
  {
    title: 'კომპანია',
    links: [
      'ჩვენ შესახებ',
      'FAQ',
      { label: 'კონტაქტი', href: '/contact', internal: true },
      {
        label: 'Facebook',
        href: 'https://www.facebook.com/fins.ge/',
        openInNewTab: true,
      },
      { label: '+995 500 114 090', href: 'tel:+995500114090' },
    ],
  },
  {
    title: 'სამართლებრივი',
    links: [
      { label: 'კონფიდენციალურობა', href: '/privacy', internal: true },
      { label: 'გამოყენების პირობები', href: '/terms', internal: true },
      { label: 'უსაფრთხოება', href: '/security', internal: true },
    ],
  },
]

export default function Footer() {
  const footerRef = useRef(null)
  const footerGlowRef = useRef(null)

  useEffect(() => {
    const footerEl = footerRef.current
    if (!footerEl) return undefined

    const phoneMq = window.matchMedia(PHONE_MAX_WIDTH_QUERY)
    let ctx = null

    const buildFooterScroll = () => {
      ctx?.revert()
      ctx = gsap.context(() => {
        const isPhone = phoneMq.matches
        const allCols = gsap.utils.toArray('[data-footer-col]')
        gsap.set(allCols, { y: 40, opacity: 0 })

        if (!isPhone) {
          gsap.set('[data-footer-divider]', { scaleX: 0, opacity: 0 })
          gsap.set('[data-footer-note]', { y: 20, opacity: 0 })
        }

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: footerEl,
            start: 'top bottom',
            end: 'bottom bottom',
            scrub: 0.55,
            fastScrollEnd: true,
            invalidateOnRefresh: true,
          },
        })

        allCols.forEach((el, i) => {
          tl.to(
            el,
            {
              y: 0,
              opacity: 1,
              duration: 0.65,
              ease: 'power2.inOut',
            },
            i * 0.09
          )
        })

        if (!isPhone) {
          tl.to(
            '[data-footer-divider]',
            {
              scaleX: 1,
              opacity: 1,
              duration: 0.55,
              ease: 'power2.inOut',
            },
            0.38
          )
          tl.to(
            '[data-footer-note]',
            {
              y: 0,
              opacity: 1,
              duration: 0.55,
              ease: 'power2.inOut',
            },
            0.48
          )
        }
      }, footerRef)

      requestAnimationFrame(() => {
        ScrollTrigger.refresh()
      })
    }

    buildFooterScroll()

    const handleMqChange = () => {
      buildFooterScroll()
    }
    phoneMq.addEventListener('change', handleMqChange)

    const handleResize = () => {
      ScrollTrigger.refresh()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      phoneMq.removeEventListener('change', handleMqChange)
      window.removeEventListener('resize', handleResize)
      ctx?.revert()
    }
  }, [])

  // Footer right-corner glow animation
  useEffect(() => {
    gsap.set(footerGlowRef.current, { opacity: 0, scale: 0.8 })
    const tl = gsap.timeline({ repeat: -1, yoyo: true })
    tl.to(footerGlowRef.current, {
      opacity: 1,
      scale: 1,
      duration: 5,
      ease: 'power1.inOut',
    })
    return () => tl.kill()
  }, [])

  return (
    <footer
      ref={footerRef}
      id="contact"
      className="relative text-white py-12 lg:py-16"
    >
      {/* Animated glow — right corner */}
      <div
        ref={footerGlowRef}
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[150px] -left-[150px] h-[400px] w-[400px] rounded-full bg-brand-600/[0.22] blur-[70px]"
        style={{ transform: 'translateZ(0)' }}
      />

      <div className="relative z-10 mx-auto max-w-wide px-5 sm:px-8 lg:px-12">
        {/* Content — brand full width, then 3 link cols in one row on mobile; 4 cols on lg */}
        <div data-footer-cols className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Brand column */}
          <div data-footer-col className="lg:col-span-1 flex flex-col items-start gap-4">
            <img
              src="/logo.svg"
              alt="FINS"
              className="h-10 w-auto block select-none"
              draggable={false}
            />
            <p className="text-[11px] leading-relaxed font-medium text-white max-w-[260px] sm:text-[13px]">
              შპს „ფინს პროგრამ სერვისი" — ქართული ბიზნესის ციფრული ტრანსფორმაციის პარტნიორი.
            </p>
          </div>

          {/* Link columns — 3 cols side by side on phone; lg spans remaining 3 of parent grid */}
          <div className="grid min-w-0 grid-cols-3 gap-x-3 gap-y-6 sm:gap-x-4 lg:col-span-3 lg:gap-8">
            {COLUMNS.map((col) => (
              <div
                key={col.title}
                data-footer-col
                className="flex min-w-0 flex-col items-start gap-3 text-left sm:gap-4"
              >
                <h3 className="text-[13px] leading-none font-extrabold tracking-normal text-white sm:text-[14px]">
                  {col.title}
                </h3>
                <ul className="flex list-none flex-col gap-2 sm:gap-3">
                  {col.links.map((link) => {
                    const isObject = typeof link === 'object' && link !== null
                    const label = isObject ? link.label : link
                    const href = isObject ? link.href : '#'
                    const openInNewTab = isObject && link.openInNewTab
                    const internal = isObject && link.internal

                    const className = "block break-words text-[12px] leading-snug tracking-normal text-white/70 transition-colors duration-250 hover:text-white sm:text-[12px]"

                    return (
                      <li key={label} className="min-w-0">
                        {internal ? (
                          <Link to={href} className={className} style={{ fontWeight: 500 }}>
                            {label}
                          </Link>
                        ) : (
                          <a
                            href={href}
                            {...(openInNewTab
                              ? { target: '_blank', rel: 'noopener noreferrer' }
                              : {})}
                            className={className}
                            style={{ fontWeight: 500 }}
                          >
                            {label}
                          </a>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div
          data-footer-divider
          aria-hidden="true"
          className="mt-10 h-px w-full origin-left bg-white/20"
        />

        {/* Footnote */}
        <p data-footer-note className="mt-5 text-[11px] leading-none tracking-normal text-white text-center sm:text-[12px]">
          Development by <span className="text-[#11A32B]">systemctl</span>
        </p>
      </div>
    </footer>
  )
}
