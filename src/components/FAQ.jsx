import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Plus, X, Send, CheckCircle, Loader, AlertCircle, ChevronDown, MessageSquarePlus } from 'lucide-react'

const WEB3FORMS_KEY = '17019cc7-632a-49f7-9a00-60c011b65520'

gsap.registerPlugin(ScrollTrigger)

const QUESTIONS = [
  {
    q: 'ვინ არიან FINSI-ს პარტნიორები?',
    a: (
      <>
        ჩვენი პლატფორმა მტკიცროდ თანამშრომლობს სახელმწიფო და ფინანსურ სტრუქტურებთან მონაცემთა
        უსაფრთხო და ავტომატიზებული მიმოცვლისთვის (მათ შორის: RS.ge, NBG.ge, napr.gov.ge). ასევე,
        ჩვენი სტრატეგიული პარტნიორი და თანადამფუძნებელია კომპანია{' '}
        <span className="font-semibold text-[#0FA958]">systemctl</span>
        , რაც უზრუნველყოფს სისტემის ტექნოლოგიურ მდგრადობას
      </>
    ),
  },
  {
    q: 'რატომ ფინსი და არა სხვა პროდუქტი?',
    a: 'FINS არის სრულიად ქართული გადაწყვეტა — შექმნილი ქართველი დეველოპერებისა და ფინანსისტების მიერ ქართული ბიზნესის რეალური საჭიროებებისთვის. გვაქვს ლოკალური მხარდაჭერა, RS.ge ინტეგრაცია და მუდმივად მზარდი ფუნქციონალი.',
  },
  {
    q: 'ვინ არის ჩვენი მომხმარებელი?',
    a: 'FINS-ს იყენებენ მცირე და საშუალო ბიზნესები, ფრილანსერები, ბუღალტრული ფირმები და სტარტაპები — ნებისმიერი ორგანიზაცია, რომელიც ეძებს თანამედროვე, ღრუბლოვან ფინანსურ პლატფორმას.',
  },
  {
    q: 'რამდენად უსაფრთხოა ჩვენი მონაცემები?',
    a: 'ყველა მონაცემი ინახება დაშიფრულად (AES-256), სისტემა აღჭურვილია ორფაქტორიანი ავტენტიფიკაციით, გადაცემა ხდება TLS 1.3 პროტოკოლით. ბექაპი ხდება ავტომატურად, დღეში რამდენჯერმე.',
  },
  {
    q: 'როგორ ხდება მონაცემების მიგრაცია?',
    a: 'ჩვენი გუნდი დაგეხმარებათ მონაცემების მიგრაციაში — Excel, CSV ან სხვა ბუღალტრული სისტემიდან. ჩვეულებრივ მცირე ბიზნესისთვის სრული ონბორდინგი 3-5 სამუშაო დღეში სრულდება.',
  },
  {
    q: 'როგორ ხდება RS-სთან ინტეგრაცია?',
    a: 'სისტემა უშუალოდ უკავშირდება RS.ge-ს თქვენი მონაცემების გამოყენებით — ანგარიშ-ფაქტურები, საგადასახადო დეკლარაციები და სხვა მონაცემთა გაცვლა ხდება პირდაპირ FINS-ის ინტერფეისიდან, ხელით შეყვანის გარეშე.',
  },
  {
    q: 'როგორ ხდება მრავალვალუტიანი ოპერაციების მხარდაჭერა?',
    a: 'FINS მხარს უჭერს ნებისმიერი ვალუტის ოპერაციებს ავტომატური კურსის კონვერტაციით, NBG-ის ოფიციალური კურსების სიხშირული განახლებით და მრავალვალუტიანი ანგარიშგების ფორმატებით.',
  },
]

// ── Mini contact form embedded in FAQ left column ────────────────────────────
function FaqContactForm() {
  const [open,      setOpen]    = useState(false)
  const [form,      setForm]    = useState({ name: '', phone: '', email: '', question: '' })
  const [status,    setStatus]  = useState('idle')
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim() || !form.question.trim()) return
    setStatus('loading')
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `FINS FAQ — შეკითხვა: ${form.name}`,
          from_name: 'FINS FAQ Form',
          name: form.name,
          phone: form.phone,
          email: form.email.trim() || undefined,
          message: form.question,
        }),
      })
      const data = await res.json()
      setStatus(data.success ? 'success' : 'error')
      if (data.success) {
        setForm({ name: '', phone: '', email: '', question: '' })
      }
    } catch {
      setStatus('error')
    }
  }

  const inputCls = 'w-full rounded-xl border border-[#3E4259]/[0.14] bg-white px-4 py-2.5 text-[14px] font-medium text-[#3E4259] placeholder-[#3E4259]/30 outline-none transition-colors duration-150 focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/[0.08]'

  return (
    <div className="mt-8">
      {/* trigger button */}
      <button
        type="button"
        onClick={() => { setOpen(o => !o); setStatus('idle'); }}
        className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl border border-brand-500/30 bg-brand-50 hover:bg-brand-100 text-brand-600 text-[14px] font-semibold transition-colors duration-200 select-none"
      >
        <MessageSquarePlus size={16} />
        მსურს კითხვის გაგზავნა
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          style={{ display: 'flex' }}
        >
          <ChevronDown size={15} />
        </motion.span>
      </button>

      {/* collapsible form */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="faq-form"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="pt-4">
              {status === 'success' ? (
                <div className="flex flex-col items-start gap-3 p-5 rounded-2xl border border-emerald-500/30 bg-emerald-50">
                  <CheckCircle size={22} className="text-emerald-500" />
                  <div>
                    <p className="text-[14px] font-bold text-[#3E4259]">გაგზავნილია!</p>
                    <p className="text-[13px] font-medium text-[#3E4259]/60 mt-0.5">ჩვენი გუნდი მალე დაგიკავშირდება.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="text-[12px] font-semibold text-brand-600 hover:text-brand-500 transition-colors"
                  >
                    ახალი შეკითხვა →
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
                  <input
                    placeholder="სახელი და გვარი *"
                    value={form.name}
                    onChange={set('name')}
                    required
                    className={inputCls}
                  />
                  <input
                    type="tel"
                    placeholder="ტელეფონი *"
                    value={form.phone}
                    onChange={set('phone')}
                    required
                    className={inputCls}
                  />
                  <input
                    type="email"
                    placeholder="მეილი"
                    value={form.email}
                    onChange={set('email')}
                    className={inputCls}
                  />
                  <textarea
                    placeholder="თქვენი შეკითხვა *"
                    value={form.question}
                    onChange={set('question')}
                    required
                    rows={3}
                    className={inputCls + ' resize-none'}
                  />
                  {status === 'error' && (
                    <div className="flex items-center gap-2 text-[12px] font-medium text-red-500">
                      <AlertCircle size={13} />
                      გაგზავნა ვერ მოხერხდა. სცადეთ ხელახლა.
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="inline-flex items-center gap-2 self-start px-5 py-2.5 rounded-full bg-brand-600 hover:bg-brand-500 disabled:opacity-60 text-white text-[13px] font-bold tracking-normal transition-colors duration-200"
                  >
                    {status === 'loading' ? (
                      <><Loader size={13} className="animate-spin" /> იგზავნება...</>
                    ) : (
                      <><Send size={13} /> გაგზავნა</>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQ() {
  const [open, setOpen] = useState(0)
  const sectionRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Left column
      gsap.set('[data-faq-left]', { y: 40, opacity: 0 })
      gsap.to('[data-faq-left]', {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 95%',
          end: 'top 60%',
          scrub: 1,
        },
      })

      // FAQ items — each has its own viewport trigger, no smoothing
      const itemEls = gsap.utils.toArray('[data-faq-item]')
      gsap.set(itemEls, { y: 40, opacity: 0 })
      itemEls.forEach((el) => {
        gsap.to(el, {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power2.inOut',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            end: 'top 60%',
            scrub: true,
          },
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="faq" className="bg-cream-50 py-16 sm:py-24 lg:py-32">
      <div className="mx-auto px-5 sm:px-8 lg:px-12 max-w-wide grid grid-cols-1 xl:grid-cols-[1fr_2fr] gap-12 xl:gap-x-16 items-start">
        {/* Left column */}
        <div data-faq-left className="flex flex-col items-start text-left gap-6">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="faq-dot-pulse h-4 w-4 rounded-full block bg-brand-600"
            />
            <span className="text-[16px] font-semibold leading-none tracking-normal text-brand-600">
              FAQ
            </span>
          </div>

          <h2 className="font-banner text-left text-[28px] sm:text-[34px] md:text-[35px] lg:text-[35px] leading-[1.2] text-[#3E4259] font-medium">
            ხშირად დასმული <span className="text-brand-600">კითხვები</span>
          </h2>

          <p className="text-[16px] sm:text-[18px] lg:text-[16px] leading-normal tracking-normal text-[#3E4259] font-medium">
            ვერ იპოვე პასუხი? ჩვენი გუნდი მზად არის დაგეხმაროს — დაგვიკავშირდით ნებისმიერ დროს
          </p>

          <FaqContactForm />
        </div>

        {/* Right column — Accordion */}
        <div data-faq-list className="w-full flex flex-col gap-4">
          {QUESTIONS.map((item, i) => {
            const isOpen = open === i
            const number = String(i + 1).padStart(2, '0')
            return (
              <div
                key={item.q}
                data-faq-item
                className="rounded-2xl bg-white overflow-hidden transition-all duration-300 ease-in-out"
                style={{
                  border: isOpen
                    ? '1px solid rgba(61, 100, 254, 0.22)'
                    : '1px solid rgba(62, 66, 89, 0.16)',
                  boxShadow: isOpen
                    ? '0 8px 30px rgba(61, 100, 254, 0.20)'
                    : 'none',
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5 text-left"
                >
                  <span
                    className="shrink-0 inline-flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full text-[13px] sm:text-[14px] font-semibold leading-none tracking-normal transition-all duration-300"
                    style={{
                      backgroundColor: isOpen ? 'rgba(61, 100, 254, 0.10)' : 'rgba(62, 66, 89, 0.06)',
                      color: isOpen ? '#3D64FE' : 'rgba(62, 66, 89, 0.55)',
                    }}
                  >
                    {number}
                  </span>

                  <span className="flex-1 text-[14px] sm:text-[16px] lg:text-[16px] font-semibold leading-snug tracking-normal text-[#3E4259]">
                    {item.q}
                  </span>

                  <span
                    className="shrink-0 inline-flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: isOpen ? 'rgba(61, 100, 254, 0.10)' : 'rgba(62, 66, 89, 0.06)',
                      color: isOpen ? '#3D64FE' : 'rgba(62, 66, 89, 0.55)',
                    }}
                  >
                    {isOpen ? <X size={18} strokeWidth={2.5} /> : <Plus size={18} strokeWidth={2.5} />}
                  </span>
                </button>

                <div
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                  style={{
                    maxHeight: isOpen ? '500px' : '0px',
                    opacity: isOpen ? 1 : 0,
                  }}
                >
                  <div className="pl-14 sm:pl-[72px] pr-4 sm:pr-6 pb-5 sm:pb-6 text-[14px] sm:text-[15px] leading-relaxed tracking-normal text-[#3E4259]">
                    {item.a}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
