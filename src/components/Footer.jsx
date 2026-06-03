import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)
// test
/** Tailwind `sm` (640px) — ტელეფონი = 639px და ქვემოთ */
const PHONE_MAX_WIDTH_QUERY = '(max-width: 639px)'

const SOCIAL = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/fins.ge/',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    label: 'WhatsApp',
    href: 'https://wa.me/995500114090',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    ),
  },
  {
    label: 'AnyDesk',
    href: 'https://anydesk.com/en/downloads/windows',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
    ),
  },
]

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
            <p className="text-[11px] leading-relaxed font-medium text-white/70 max-w-[260px] sm:text-[13px]">
              შპს „ფინს პროგრამ სერვისი" — ქართული ბიზნესის ციფრული ტრანსფორმაციის პარტნიორი.
            </p>
            <div className="flex items-center gap-2 mt-1">
              {SOCIAL.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="flex items-center justify-center w-8 h-8 rounded-full text-white/50 hover:text-white bg-white/[0.06] hover:bg-white/[0.14] transition-colors duration-200"
                >
                  {icon}
                </a>
              ))}
            </div>
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
