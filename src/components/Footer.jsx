import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { SendHorizontal, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const WEB3FORMS_KEY = '17019cc7-632a-49f7-9a00-60c011b65520'

const SOCIAL = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/fins.ge/',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    label: 'WhatsApp',
    href: 'https://wa.me/995500114090',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    ),
  },
  {
    label: 'AnyDesk',
    href: 'https://anydesk.com/en/downloads/windows',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
    ),
  },
]

const COLUMNS = [
  {
    title: 'პროდუქტი',
    links: [
      { label: 'ბუღალტერია', href: '/#accounting' },
      { label: 'ოპერაციები', href: '/#services' },
      { label: 'პერსონალური', href: '/#services' },
      { label: 'ანგარიშგება', href: '/#accounting' },
    ],
  },
  {
    title: 'კომპანია',
    links: [
      { label: 'ჩვენ შესახებ', href: '/#about' },
      { label: 'კონტაქტი', href: '/contact', internal: true },
      { label: 'FAQ', href: '/#faq' },
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

// ─── Form field with Figma-style red-asterisk placeholder ────────────────────

function Field({ value, onChange, placeholder, required = false, type = 'text', name }) {
  return (
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        aria-label={placeholder}
        aria-required={required}
        className="peer w-full h-[52px] rounded-xl bg-transparent border border-white/[0.14] px-4 text-[13.5px] font-medium text-white outline-none transition-colors duration-200 focus:border-brand-400/70 hover:border-white/[0.26]"
      />
      {!value && (
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[13px] font-medium select-none">
          {required && <span className="text-[#F4587A]">* </span>}
          <span className="text-white/40">{placeholder}</span>
        </span>
      )}
    </div>
  )
}

const INITIAL = { name: '', company: '', email: '', phone: '', message: '' }

// ─── Footer ──────────────────────────────────────────────────────────────────

export default function Footer() {
  const footerRef = useRef(null)
  const footerGlowRef = useRef(null)
  const [form, setForm] = useState(INITIAL)
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))

  const canSubmit = form.name.trim() && form.phone.trim()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit || status === 'loading') return
    setStatus('loading')
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `FINS — შეტყობინება: ${form.name}`,
          from_name: 'FINS Footer Form',
          name: form.name,
          company: form.company || '—',
          email: form.email || undefined,
          phone: form.phone,
          message: form.message || '—',
        }),
      })
      const data = await res.json()
      setStatus(data.success ? 'success' : 'error')
      if (data.success) setForm(INITIAL)
    } catch {
      setStatus('error')
    }
  }

  // Scroll reveal
  useEffect(() => {
    const ctx = gsap.context(() => {
      const els = gsap.utils.toArray('[data-footer-reveal]')
      gsap.set(els, { y: 36, opacity: 0 })
      gsap.to(els, {
        y: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.09,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 86%',
        },
      })
    }, footerRef)
    return () => ctx.revert()
  }, [])

  // Corner glow breathing — opacity only, stays compositor-cheap
  useEffect(() => {
    gsap.set(footerGlowRef.current, { opacity: 0.25 })
    const tl = gsap.timeline({ repeat: -1, yoyo: true })
    tl.to(footerGlowRef.current, {
      opacity: 1,
      duration: 5,
      ease: 'power1.inOut',
    })
    return () => tl.kill()
  }, [])

  return (
    <footer
      ref={footerRef}
      id="contact"
      className="relative text-white overflow-hidden bg-[#0F141B]"
    >
      {/* Animated glow — left corner */}
      <div
        ref={footerGlowRef}
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[220px] -left-[220px] h-[560px] w-[560px]"
        style={{ background: 'radial-gradient(closest-side, rgba(59,91,219,0.22), transparent 70%)' }}
      />

      <div className="relative z-10 mx-auto max-w-wide px-5 sm:px-8 lg:px-12 pt-14 lg:pt-20 pb-10">

        {/* Top hairline */}
        <div aria-hidden="true" className="h-px w-full bg-white/[0.12] mb-12 lg:mb-16" />

        {/* ── Main grid: form | brand + links ─────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.04fr_1fr] gap-y-14 gap-x-12 xl:gap-x-20 items-start">

          {/* Left — heading + contact form */}
          <div data-footer-reveal>
            <h2 className="font-banner uppercase text-white tracking-normal leading-[1.3] text-[24px] sm:text-[30px] lg:text-[32px] xl:text-[36px]">
              გაქვთ კითხვები? დაგვიკავშირდით
            </h2>
            <p className="mt-4 text-[13.5px] sm:text-[14.5px] font-medium leading-relaxed text-white/45 max-w-[560px]">
              პირველი კონსულტაცია უფასოა, ჩვენი ექსპერტები შეაფასებენ თქვენს
              საკითხს, პასუხით დაგიბრუნდებით 24 საათში
            </p>

            {status === 'success' ? (
              <div className="mt-9 max-w-[660px] flex items-start gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.08] p-6">
                <CheckCircle size={22} className="shrink-0 text-emerald-400 mt-0.5" />
                <div>
                  <p className="text-[15px] font-bold text-white">შეტყობინება გაგზავნილია!</p>
                  <p className="mt-1 text-[13px] font-medium text-white/55 leading-relaxed">
                    ჩვენი გუნდი 24 საათში დაგიკავშირდებათ.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="mt-3 text-[12.5px] font-semibold text-brand-300 hover:text-brand-200 transition-colors"
                  >
                    ახალი შეტყობინება →
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="mt-9 max-w-[660px] flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field value={form.name} onChange={set('name')} placeholder="სახელი და გვარი" required name="name" />
                  <Field value={form.company} onChange={set('company')} placeholder="კომპანია" name="company" />
                  <Field value={form.email} onChange={set('email')} placeholder="ელ-ფოსტა" type="email" name="email" />
                  <Field value={form.phone} onChange={set('phone')} placeholder="ტელეფონი" required type="tel" name="phone" />
                </div>

                {/* Message + send */}
                <div className="relative">
                  <input
                    type="text"
                    name="message"
                    value={form.message}
                    onChange={set('message')}
                    aria-label="შეტყობინება"
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(e) }}
                    className="w-full h-[52px] rounded-xl bg-transparent border border-white/[0.14] pl-4 pr-14 text-[13.5px] font-medium text-white outline-none transition-colors duration-200 focus:border-brand-400/70 hover:border-white/[0.26]"
                  />
                  {!form.message && (
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[13px] font-medium text-white/40 select-none">
                      შეტყობინება
                    </span>
                  )}
                  <button
                    type="submit"
                    aria-label="გაგზავნა"
                    disabled={status === 'loading'}
                    className={`absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center h-9 w-9 rounded-lg transition-all duration-200 ${
                      canSubmit
                        ? 'text-brand-300 hover:text-white hover:bg-brand-600/40'
                        : 'text-white/25'
                    }`}
                  >
                    {status === 'loading'
                      ? <Loader size={17} className="animate-spin" />
                      : <SendHorizontal size={17} strokeWidth={1.8} />}
                  </button>
                </div>

                {status === 'error' && (
                  <p className="flex items-center gap-2 text-[12.5px] font-medium text-[#F4587A]">
                    <AlertCircle size={13} className="shrink-0" />
                    გაგზავნა ვერ მოხერხდა — სცადეთ ხელახლა ან მოგვწერეთ fins.ge@gmail.com
                  </p>
                )}
                {!canSubmit && status !== 'error' && (
                  <p className="text-[11.5px] font-medium text-white/25">
                    <span className="text-[#F4587A]">*</span> სავალდებულო ველები
                  </p>
                )}
              </form>
            )}
          </div>

          {/* Right — brand + link columns */}
          <div data-footer-reveal className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-x-10 xl:gap-x-14 gap-y-10 lg:pt-2">

            {/* Brand */}
            <div className="flex flex-col items-start gap-4 max-w-[240px]">
              <img
                src="/logo.svg"
                alt="FINS"
                className="h-9 w-auto block select-none"
                draggable={false}
              />
              <p className="text-[12px] sm:text-[12.5px] leading-relaxed font-medium text-white/55">
                შპს „ფინს პროგრამ სერვისი" — ქართული ბიზნესის ციფრული
                ტრანსფორმაციის პარტნიორი.
              </p>
              <div className="flex items-center gap-2 mt-0.5">
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

            {/* Link columns */}
            <div className="grid min-w-0 grid-cols-3 gap-x-3 sm:gap-x-6 gap-y-6">
              {COLUMNS.map((col) => (
                <div key={col.title} className="flex min-w-0 flex-col items-start gap-3.5 text-left">
                  <h3 className="text-[12.5px] sm:text-[13.5px] leading-none font-extrabold tracking-normal text-white">
                    {col.title}
                  </h3>
                  <ul className="flex list-none flex-col gap-2.5">
                    {col.links.map((link) => {
                      const cls = 'block text-[11.5px] sm:text-[12.5px] leading-snug tracking-normal font-medium text-white/55 transition-colors duration-200 hover:text-white'
                      return (
                        <li key={link.label} className="min-w-0">
                          {link.internal ? (
                            <Link to={link.href} className={cls}>{link.label}</Link>
                          ) : (
                            <a href={link.href} className={cls}>{link.label}</a>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom ───────────────────────────────────────────── */}
        <div data-footer-reveal>
          <div aria-hidden="true" className="mt-14 lg:mt-16 h-px w-full bg-white/[0.12]" />
          <p className="mt-6 text-[11.5px] sm:text-[12px] leading-none tracking-normal text-white/75 text-center">
            Development by <span className="text-[#11A32B]">systemctl</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
