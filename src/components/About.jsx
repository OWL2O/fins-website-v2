import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Check, Users, Briefcase, Building2, Globe } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const CAPABILITIES = [
  'მართონ საკუთარი ბუღალტრული მოდული გლობალურად ონლაინ სივრცეში სრულყოფილად და უსაფრთხოდ',
  'სურვილის შემთხვევაში სხვადასხვა სერვისის გამწევ ორგანიზაციებს მათი სერვისის შესაბამისად მისცენ წვდომა საკუთარ მონაცემებზე',
  'დააკავშირონ სხვადასხვა პლატფორმები ბუღალტრულ მოდულთან და ამით მოახდინონ ბიზნეს პროცესების მაქსიმალური გამარტივება და სრულყოფა',
  'ერთი ფანჯრის პრინციპით მართონ საკუთარი ბიზნესი ან გასწიონ სერვისები ფინსში რეგისტრირებულ სხვადასხვა ორგანიზაციებზე',
]

const PARTNERS = [
  { Icon: Users,     label: 'კერძო ბუღალტრები' },
  { Icon: Briefcase, label: 'ბუღალტრული და აუდიტორული კომპანიები' },
  { Icon: Building2, label: 'სხვადასხვა სერვისების გამცემი კომპანიები' },
]

// Shared glass-card surface — semi-transparent white over the soft ambient
// tints below, hairline border, one diffused shadow. Deliberately quiet.
const CARD =
  'relative rounded-[20px] bg-white/55 backdrop-blur-[12px] border border-[#3E4259]/[0.08] ' +
  'shadow-[0_1px_2px_rgba(62,66,89,0.03),0_24px_60px_-28px_rgba(62,66,89,0.18)] p-8 lg:p-10'

const KICKER =
  'text-[11px] font-semibold tracking-[0.14em] uppercase text-brand-600/90'

export default function About() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const headerEls = gsap.utils.toArray('[data-about-enter]')
      gsap.set(headerEls, { y: 40, opacity: 0 })
      const headerTl = gsap.timeline({
        scrollTrigger: {
          trigger: '[data-about-header]',
          start: 'top 87%',
          end: 'top 60%',
          scrub: 1,
        },
      })
      headerEls.forEach((el, i) => {
        headerTl.to(el, { y: 0, opacity: 1, duration: 1, ease: 'power2.inOut' }, i * 0.1)
      })

      // Three blocks — gentle stagger rise
      const cardEls = gsap.utils.toArray('[data-about-card]')
      gsap.set(cardEls, { y: 44, opacity: 0 })
      const cardsTl = gsap.timeline({
        scrollTrigger: {
          trigger: '[data-about-cards]',
          start: 'top 88%',
          end: 'top 55%',
          scrub: 1,
        },
      })
      cardEls.forEach((el, i) => {
        cardsTl.to(el, { y: 0, opacity: 1, duration: 1, ease: 'power2.inOut' }, i * 0.12)
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="about"
      className="py-14 sm:py-20 lg:py-28 overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 42%, #F8F8F5 88%, #F8F8F5 100%)',
      }}
    >
      <div className="max-w-full mx-auto px-5 sm:px-8 lg:px-12">

        {/* Header */}
        <div data-about-header className="flex flex-col items-center text-center gap-6 max-w-2xl lg:max-w-[820px] mx-auto overflow-visible">
          <p data-about-enter className="text-[16px] font-semibold leading-none tracking-normal text-brand-600">
            ჩვენ შესახებ
          </p>
          <h2
            data-about-enter
            className="font-banner uppercase tracking-[-0.02em] text-center text-[28px] sm:text-[34px] md:text-[35px] lg:text-[35px] text-[#3E4259] leading-[1.2] lg:leading-[51px]"
          >
            თქვენი ბიზნესის <span className="text-brand-600">სანდო</span>
            <br />
            პარტნიორი
          </h2>
          <p data-about-enter className="text-center text-[16px] leading-[1.6] tracking-normal text-[#3E4259]/80 font-normal">
            ჩვენმა კომპანიამ შეიმუშავა მრავალი ინოვაციური პროდუქტი, რათა ჩვენს მომხმარებლებს და
            პარტნიორებს მოვცეთ უნიკალური შესაძლებლობები მაღალტექნოლოგიურად და უსაფრთხოდ
            განავითარონ საკუთარი ბიზნეს შესაძლებლობები.
          </p>
        </div>

        {/* Three blocks */}
        <div data-about-cards className="relative mt-12 lg:mt-16">

          {/* Soft ambient tints behind the glass so the blur reads — very faint */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute -top-20 left-[6%] h-[340px] w-[340px] rounded-full bg-brand-400/[0.10] blur-3xl" />
            <div className="absolute top-[34%] left-[42%] h-[280px] w-[280px] rounded-full bg-[#8FB0FF]/[0.10] blur-3xl" />
            <div className="absolute -bottom-16 right-[5%] h-[320px] w-[320px] rounded-full bg-brand-300/[0.12] blur-3xl" />
          </div>

          <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6 items-stretch">

            {/* 1 — შესაძლებლობები */}
            <div data-about-card className={CARD}>
              <p className={`${KICKER} mb-7`}>შესაძლებლობები</p>
              <ul className="flex flex-col gap-5">
                {CAPABILITIES.map((c, i) => (
                  <li key={i} className="flex items-start gap-3.5 text-[14px] leading-[1.6] text-[#3E4259]/75 font-normal">
                    <Check size={16} strokeWidth={2} className="shrink-0 text-brand-600/80 mt-[3px]" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 2 — ვთანამშრომლობთ */}
            <div data-about-card className={CARD}>
              <p className={`${KICKER} mb-7`}>ვთანამშრომლობთ</p>
              <div className="flex flex-col items-start gap-2.5 mb-7">
                {PARTNERS.map(({ Icon, label }) => (
                  <div
                    key={label}
                    className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-brand-600/[0.04] border border-brand-600/[0.14] text-[13px] font-normal text-[#3E4259]/90"
                  >
                    <Icon size={13} strokeWidth={1.75} className="text-brand-600 shrink-0" />
                    {label}
                  </div>
                ))}
              </div>
              <p className="text-[14px] leading-[1.6] text-[#3E4259]/75 font-normal">
                მათ ვაძლევთ შესაძლებლობას ჩვენს სივრცეში რეგისტრირებულ ბიზნეს სუბიექტებს
                შესთავაზონ სხვადასხვა სერვისები ურთიერთ შეთანხმების საფუძველზე. ეს
                ბიზნესის ოპტიმიზაციის ეფექტურობის უდაო განმსაზღვრელია.
              </p>
            </div>

            {/* 3 — განვითარება */}
            <div data-about-card className={`${CARD} flex flex-col`}>
              <div className="flex items-center gap-2 mb-7">
                <Globe size={14} strokeWidth={1.75} className="text-brand-600 shrink-0" />
                <p className={KICKER}>განვითარება</p>
              </div>
              <p className="text-[14px] leading-[1.6] text-[#3E4259]/75 font-normal">
                ჩვენი კომპანია სრულად ორიენტირებულია სერვისების სრულყოფასა და ახალი კრეატიული
                სერვისების დანერგვაზე. ვგეგმავთ უახლოეს მომავალში სხვადასხვა ქვეყნებში
                გაფართოებას — მზად ვართ პოტენციური პარტნიორებისაგან წინადადებებისათვის.
              </p>
              <p className="mt-auto pt-7 text-[12px] leading-[1.6] text-[#3E4259]/50 font-normal border-t border-[#3E4259]/[0.08]">
                პროდუქტი FINS (fins.ge) წარმოადგენს შპს „ფინს პროგრამ სერვისი"-ს (ს/კ: 436258826)
                ინტელექტუალურ საკუთრებას — სრულად ქართული პროდუქტი, შექმნილი ქართველი
                პროფესიონალი დეველოპერებისა და ფინანსისტების მიერ.
              </p>
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}
