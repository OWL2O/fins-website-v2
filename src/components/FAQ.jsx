import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Plus, X } from 'lucide-react'

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
    <section ref={sectionRef} id="faq" className="bg-cream-50 py-24 sm:py-28 lg:py-32">
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
            ვერ იპოვე პასუხი? ჩვენი გუნდი მზად არის დაგეხმაროს- დაგვიკავშირდით ნებისმიერ დროს
          </p>
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
                  className="w-full flex items-center gap-4 px-5 sm:px-6 py-5 text-left"
                >
                  <span
                    className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-full text-[14px] font-semibold leading-none tracking-normal transition-all duration-300"
                    style={{
                      backgroundColor: isOpen ? 'rgba(61, 100, 254, 0.10)' : 'rgba(62, 66, 89, 0.06)',
                      color: isOpen ? '#3D64FE' : 'rgba(62, 66, 89, 0.55)',
                    }}
                  >
                    {number}
                  </span>

                  <span className="flex-1 text-[16px] sm:text-[18px] lg:text-[16px] font-semibold leading-snug tracking-normal text-[#3E4259]">
                    {item.q}
                  </span>

                  <span
                    className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300"
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
                  <div className="pl-[72px] sm:pl-[80px] pr-5 sm:pr-6 pb-6 text-[14px] sm:text-[15px] leading-relaxed tracking-normal text-[#3E4259]">
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
