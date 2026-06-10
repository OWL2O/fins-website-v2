import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import LaptopShowcase from './LaptopShowcase'

gsap.registerPlugin(ScrollTrigger)

const BULLETS = [
  'სრულყოფილი ბუღალტრული გატარებები საერთაშორისო სტანდარტით როგორც ინდივიდუალურია ასევე საოპერაციო მოდულები',
  'შეძენის, რეალიზაციის, დისტრიბუციის, წარმოების განაცემების და სხვა დამატებებით მოდულები',
  'კომპანიებისათვის არსებული ბუღალტრული მონაცემების პორტირების შესაძლებლობა',
  'ფულადი ნაკადის და სხვადასხვა ბიზნეს პროცესების ანალიზის შესაძლებლობა',
]

export default function Accounting() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Left column text
      const enterEls = gsap.utils.toArray('[data-acc-enter]')
      gsap.set(enterEls, { y: 40, opacity: 0 })
      const enterTl = gsap.timeline({
        scrollTrigger: {
          trigger: '[data-acc-left]',
          start: 'top 87%',
          end: 'top 60%',
          scrub: 1,
        },
      })
      enterEls.forEach((el, i) => {
        enterTl.to(el, { y: 0, opacity: 1, duration: 1, ease: 'power2.inOut' }, i * 0.1)
      })

      // Description paragraph
      gsap.set('[data-acc-desc]', { y: 40, opacity: 0 })
      gsap.to('[data-acc-desc]', {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: '[data-acc-desc]',
          start: 'top 90%',
          end: 'top 60%',
          scrub: 1,
        },
      })

      // Button
      const btnEls = gsap.utils.toArray('[data-scroll-btn]')
      gsap.set(btnEls, { scale: 0.9, opacity: 0 })
      btnEls.forEach((el) => {
        gsap.to(el, {
          scale: 1,
          opacity: 1,
          duration: 1,
          ease: 'power2.inOut',
          scrollTrigger: {
            trigger: el,
            start: 'top 87%',
            end: 'top 60%',
            scrub: 1,
          },
        })
      })

      // Bullet list
      const bulletEls = gsap.utils.toArray('[data-acc-bullet]')
      gsap.set(bulletEls, { y: 40, opacity: 0 })
      const bulletTl = gsap.timeline({
        scrollTrigger: {
          trigger: '[data-acc-bullets]',
          start: 'top 87%',
          end: 'top 60%',
          scrub: 1,
        },
      })
      bulletEls.forEach((el, i) => {
        bulletTl.to(el, { y: 0, opacity: 1, duration: 1, ease: 'power2.inOut' }, i * 0.1)
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="accounting" className="bg-white py-16 sm:py-24 lg:py-32 overflow-clip">
      <div className="max-w-full mx-auto px-5 sm:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

        {/* Left column */}
        <div data-acc-left>
          <p
            data-acc-enter
            className="text-[16px] font-semibold leading-none tracking-normal text-brand-600 mb-5"
          >
            ბუღალტერია
          </p>

          <h2
            data-acc-enter
            className="font-banner uppercase tracking-normal text-left text-[28px] sm:text-[36px] md:text-[40px] lg:text-[42px] text-[#3E4259] leading-[1.2]"
          >
            ბუღალტრული პროგრამული
            <br />
            მომსახურება
          </h2>

          <p
            data-acc-desc
            className="mt-6 text-[15px] sm:text-[16px] leading-relaxed tracking-normal max-w-[560px] text-brand-700 font-medium"
          >
            საწარმოს ყოველდღიური ფინანსური ოპერაციების სრული წარმოება და კონტროლი. რაც მოიცავს ერთ სივრცეში:
            მმართველის, ბუღალტრის, აუდიტის, ოპერატორის, მენეჯერის და სხვა სპეციალისტების მოქცევას.
            <br />
            ჩვენი სპეციალისტები უზრუნველყოფენ ყველა ჩანაწერის სიზუსტეს
            და მარეგულირებელ მოთხოვნებთან სრულ შესაბამისობას.
          </p>

          {/* Bullet list */}
          <ul data-acc-bullets className="mt-8 flex flex-col gap-5">
            {BULLETS.map((b) => (
              <li
                key={b}
                data-acc-bullet
                className="flex items-start gap-4 text-[15px] sm:text-[16px] leading-snug tracking-normal text-[#3E4259] font-medium"
              >
                <CheckCircle2
                  size={24}
                  strokeWidth={1.5}
                  className="shrink-0 text-brand-600 mt-0.5"
                />
                <span>{b}</span>
              </li>
            ))}
          </ul>

          {/* CTA button */}
          <a
            data-scroll-btn
            href="https://service.fins.ge"
            className="mt-10 inline-flex items-center justify-center gap-2 px-7 h-[48px] rounded-lg text-[14px] font-semibold leading-none tracking-normal text-white bg-[#3D64FE] hover:bg-[#3556E5] hover:-translate-y-[1px] hover:shadow-[0_10px_36px_rgba(61,100,254,0.18)] transition-[background-color,box-shadow,transform] duration-300 ease-in-out"
          >
            დაწყება
            <ArrowRight size={16} />
          </a>
        </div>

        {/* Right column — animated laptop showcase */}
        <LaptopShowcase />
      </div>
    </section>
  )
}
