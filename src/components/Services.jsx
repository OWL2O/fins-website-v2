import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Layers, Users, Repeat, Shield, Sparkles, LifeBuoy } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const ITEMS = [
  { n: '01', icon: Layers, title: 'სრულად ონლაინ აღრიცხვა', text: 'ფინანსური ოპერაციების სრული ციფრული მართვა ნებისმიერი მოწყობილობიდან, ნებისმიერ დროს.' },
  { n: '02', icon: Users, title: 'მრავალმომხმარებლიანი გარემო', text: 'გუნდური თანამშრომლობა ერთიან სივრცეში, სხვადასხვა როლებზე მორგებული წვდომის კონტროლით.' },
  { n: '03', icon: Repeat, title: 'პროცესების ავტომატიზაცია', text: 'რუტინული ოპერაციების ავტომატიზაცია — სწრაფი, ზუსტი, ეფექტური მუშაობისთვის.' },
  { n: '04', icon: Shield, title: 'მაღალი დონის უსაფრთხოება', text: 'თქვენი ფინანსური მონაცემები დაცულია თანამედროვე დაშიფვრისა და ავტენტიფიკაციის ტექნოლოგიებით.' },
  { n: '05', icon: Sparkles, title: 'ხელოვნური ინტელექტი', text: 'AI-ზე დაფუძნებული ანალიტიკა და პროგნოზები, რომლებიც გეხმარება უკეთ გადაწყვეტილებების მიღებაში.' },
  { n: '06', icon: LifeBuoy, iconSrc: '/assets/icon-support.svg', title: 'მუდმივი მხარდაჭერა', text: '24/7 ტექნიკური მხარდაჭერა და რეგულარული განახლებები - ყოველთვის განახლებული.' },
]
// test
const PILLS = [
  'შემცირებული ოპერაციული ხარჯები',
  'გაზრდილი ეფექტურობა',
  'ფოკუსირება მთავარ საქმეზე',
]

export default function Services() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header
      const headerEls = gsap.utils.toArray('[data-svc-enter]')
      gsap.set(headerEls, { y: 40, opacity: 0 })
      const headerTl = gsap.timeline({
        scrollTrigger: {
          trigger: '[data-svc-header]',
          start: 'top 87%',
          end: 'top 60%',
          scrub: 1,
        },
      })
      headerEls.forEach((el, i) => {
        headerTl.to(el, {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power2.inOut',
        }, i * 0.1)
      })

      // Pills
      const pillEls = gsap.utils.toArray('[data-svc-pill]')
      gsap.set(pillEls, { scale: 0.9, opacity: 0 })
      const pillTl = gsap.timeline({
        scrollTrigger: {
          trigger: '[data-svc-pills]',
          start: 'top 87%',
          end: 'top 60%',
          scrub: 1,
        },
      })
      pillEls.forEach((el, i) => {
        pillTl.to(el, {
          scale: 1,
          opacity: 1,
          duration: 1,
          ease: 'power2.inOut',
        }, i * 0.1)
      })

      // Cards
      const cardEls = gsap.utils.toArray('[data-svc-card]')
      gsap.set(cardEls, { y: 40, opacity: 0 })
      const cardTl = gsap.timeline({
        scrollTrigger: {
          trigger: '[data-svc-grid]',
          start: 'top 87%',
          end: 'top 60%',
          scrub: 1,
        },
      })
      cardEls.forEach((el, i) => {
        cardTl.to(el, {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power2.inOut',
        }, i * 0.1)
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="services" className="bg-cream-50 py-24 sm:py-28 lg:py-32">
      <div className="max-w-full mx-auto px-5 sm:px-8 lg:px-12">
        {/* Header */}
        <div data-svc-header className="flex flex-col items-center text-center gap-6 max-w-2xl lg:max-w-[900px] mx-auto overflow-visible">
          <p
            data-svc-enter
            className="text-[16px] font-semibold tracking-normal text-brand-600"
          >
            სერვისები
          </p>

          <h2
            data-svc-enter
            className="font-banner uppercase tracking-normal text-center text-[28px] sm:text-[34px] md:text-[35px] lg:text-[35px] text-[#3E4259] leading-[1.2] lg:leading-[51px]"
          >
            ყველა საჭირო ინსტრუმენტი —
            <br />
            ერთ სივრცეში
          </h2>

          <p
            data-svc-enter
            className="text-center text-[15px] sm:text-[16px] tracking-normal text-[#3E4259] font-medium leading-relaxed"
          >
            FINS აერთიანებს ყველა საჭირო ინსტრუმენტსა და შესაძლებლობას ერთ ეკოსისტემაში, სადაც
            რეგისტრირებულ ბიზნესებს შეუძლიათ მარტივად მიიღონ ბუღალტრული, აუდიტორული და სხვა
            ფინანსური სერვისები აუთსორსინგის ფორმატში.
          </p>

        </div>

        {/* Grid */}
        <div data-svc-grid className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[22px] mx-auto max-w-full">
          {ITEMS.map((it) => (
            <article
              key={it.n}
              data-svc-card
              className="rounded-2xl p-6 lg:p-4 cursor-pointer bg-white/90 border border-brand-600/[0.14] transition-[border-color,box-shadow] duration-200 ease-in-out hover:border-brand-600/40 hover:shadow-[0_14px_32px_rgba(61,100,254,0.20)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col min-w-0">
                  <span className="inline-flex items-center gap-2 text-[14px] font-medium leading-none text-brand-600">
                    <span className="h-px w-4 bg-brand-600" />
                    {it.n}
                  </span>

                  <h3 className="text-[20px] md:text-[16px] lg:text-[16px] font-semibold leading-snug mt-3.5 lg:mt-2.5 text-[#3E4259]">
                    {it.title}
                  </h3>

                  <p className="text-[14px] leading-snug mt-3 text-[#3E4259]">
                    {it.text}
                  </p>
                </div>

                {it.iconSrc ? (
                  <img
                    src={it.iconSrc}
                    alt=""
                    className="h-11 w-11 shrink-0 select-none"
                    draggable={false}
                  />
                ) : (
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-600/10 text-brand-600">
                    <it.icon size={20} strokeWidth={1.8} />
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* Pills — below cards */}
        <div data-svc-pills className="mt-10 flex flex-row flex-wrap lg:flex-nowrap items-center justify-center gap-4 lg:gap-6">
          {PILLS.map((p) => (
            <span
              key={p}
              data-svc-pill
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-[14px] font-medium leading-none tracking-normal whitespace-nowrap shrink-0 text-brand-600 border border-brand-600/[0.14]"
            >
              <img
                src="/assets/done-icon.svg"
                alt=""
                className="h-5 w-5 block select-none shrink-0"
                draggable={false}
              />
              {p}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
