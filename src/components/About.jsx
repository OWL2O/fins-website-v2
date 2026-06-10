import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ChevronDown, CheckCircle2, Users, Briefcase, Building2, Globe } from 'lucide-react'

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

export default function About() {
  const sectionRef = useRef(null)
  const [expanded, setExpanded] = useState(false)

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

      gsap.set('[data-about-badge]', { y: 40, opacity: 0 })
      gsap.to('[data-about-badge]', {
        y: 0, opacity: 1, duration: 1, ease: 'power2.inOut',
        scrollTrigger: {
          trigger: '[data-about-badge]',
          start: 'top 87%', end: 'top 60%', scrub: 1,
        },
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
          'linear-gradient(to bottom, #FFFFFF 0, #FFFFFF 1080px, #F8F8F5 1080px, #F8F8F5 100%)',
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
            className="font-banner uppercase tracking-normal text-center text-[28px] sm:text-[34px] md:text-[35px] lg:text-[35px] text-[#3E4259] leading-[1.2] lg:leading-[51px]"
          >
            თქვენი ბიზნესის <span className="text-brand-600">სანდო</span>
            <br />
            პარტნიორი
          </h2>
          <p data-about-enter className="text-center text-[16px] leading-normal tracking-normal text-[#3E4259] font-medium">
            ჩვენმა კომპანიამ შეიმუშავა მრავალი ინოვაციური პროდუქტი, რათა ჩვენს მომხმარებლებს და
            პარტნიორებს მოვცეთ უნიკალური შესაძლებლობები მაღალტექნოლოგიურად და უსაფრთხოდ
            განავითარონ საკუთარი ბიზნეს შესაძლებლობები.
          </p>
        </div>

        {/* Switch — expand/collapse details */}
        <div data-about-badge className="mt-12 lg:mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded((s) => !s)}
            aria-expanded={expanded}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold leading-none tracking-normal px-5 py-3 rounded-full border border-brand-600/40 text-brand-600 bg-brand-600/[0.04] hover:bg-brand-600/[0.09] transition-colors duration-200"
          >
            {expanded ? 'ნაკლები' : 'მეტი'}
            <ChevronDown
              size={14}
              className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* Expandable detail section */}
        <div
          className={`grid transition-all duration-500 ease-in-out ${
            expanded ? 'grid-rows-[1fr] mt-10' : 'grid-rows-[0fr]'
          }`}
        >
          <div className="overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-2">

              {/* Left: Capabilities */}
              <div className="rounded-2xl bg-white border border-brand-600/[0.14] p-7 lg:p-8">
                <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-brand-600 mb-5">
                  შესაძლებლობები
                </p>
                <ul className="flex flex-col gap-4">
                  {CAPABILITIES.map((c, i) => (
                    <li key={i} className="flex items-start gap-3 text-[14px] sm:text-[15px] leading-snug text-[#3E4259] font-medium">
                      <CheckCircle2 size={20} strokeWidth={1.5} className="shrink-0 text-brand-600 mt-0.5" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right: Partnerships + Future */}
              <div className="flex flex-col gap-5">

                {/* Partnerships */}
                <div className="rounded-2xl bg-white border border-brand-600/[0.14] p-7 lg:p-8">
                  <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-brand-600 mb-5">
                    ვთანამშრომლობთ
                  </p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {PARTNERS.map(({ Icon, label }) => (
                      <div
                        key={label}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-brand-600/[0.05] border border-brand-600/[0.18] text-[13px] font-medium text-[#3E4259]"
                      >
                        <Icon size={13} className="text-brand-600 shrink-0" />
                        {label}
                      </div>
                    ))}
                  </div>
                  <p className="text-[14px] leading-relaxed text-[#3E4259] font-medium">
                    მათ ვაძლევთ შესაძლებლობას ჩვენს სივრცეში რეგისტრირებულ ბიზნეს სუბიექტებს
                    შესთავაზონ სხვადასხვა სერვისები ურთიერთ შეთანხმების საფუძველზე. ეს
                    ბიზნესის ოპტიმიზაციის ეფექტურობის უდაო განმსაზღვრელია.
                  </p>
                </div>

                {/* Future plans */}
                <div className="rounded-2xl bg-brand-600/[0.03] border border-brand-600/[0.14] p-7 lg:p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Globe size={15} className="text-brand-600 shrink-0" />
                    <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-brand-600">
                      განვითარება
                    </p>
                  </div>
                  <p className="text-[14px] leading-relaxed text-[#3E4259] font-medium">
                    ჩვენი კომპანია სრულად ორიენტირებულია სერვისების სრულყოფასა და ახალი კრეატიული
                    სერვისების დანერგვაზე. ვგეგმავთ უახლოეს მომავალში სხვადასხვა ქვეყნებში
                    გაფართოებას — მზად ვართ პოტენციური პარტნიორებისაგან წინადადებებისათვის.
                  </p>
                  <p className="mt-4 pt-4 border-t border-brand-600/[0.12] text-[12px] leading-relaxed text-[#3E4259]/55 font-medium">
                    პროდუქტი FINS (fins.ge) წარმოადგენს შპს „ფინს პროგრამ სერვისი"-ს (ს/კ: 436258826)
                    ინტელექტუალურ საკუთრებას — სრულად ქართული პროდუქტი, შექმნილი ქართველი
                    პროფესიონალი დეველოპერებისა და ფინანსისტების მიერ.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
