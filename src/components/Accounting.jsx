import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight } from 'lucide-react'
import { BrowserFrame, DemoScaler } from './BrowserFrame.jsx'
import DashboardDemo from './DashboardDemo.jsx'

gsap.registerPlugin(ScrollTrigger)

const BULLETS = [
  'სრულყოფილი ბუღალტრული გატარებები საერთაშორისო სტანდარტით როგორც ინდივიდუალურია ასევე საოპერაციო მოდულები',
  'შეძენის, რეალიზაციის, დისტრიბუციის, წარმოების განაცემების და სხვა დამატებებით მოდულები',
  'კომპანიებისათვის არსებული ბუღალტრული მონაცემების პორტირების შესაძლებლობა',
  'ფულადი ნაკადის და სხვადასხვა ბიზნეს პროცესების ანალიზის შესაძლებლობა',
]

export default function Accounting() {
  const sectionRef = useRef(null)
  const demoRevealRef = useRef(null)

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

      // Demo frame — scroll reveal
      gsap.set(demoRevealRef.current, { y: 48, opacity: 0 })
      gsap.to(demoRevealRef.current, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: demoRevealRef.current,
          start: 'top 87%',
          end: 'top 58%',
          scrub: 1,
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="accounting" className="bg-cream-50 py-16 sm:py-24 lg:py-32 overflow-clip">
      <div className="max-w-full mx-auto px-5 sm:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-14 items-center">

        {/* ── Left column — Figma reference design ─────────────── */}
        <div data-acc-left>
          <p
            data-acc-enter
            className="text-[16px] font-semibold leading-none tracking-normal text-brand-600 mb-6"
          >
            ბუღალტერია
          </p>

          <h2
            data-acc-enter
            className="font-banner uppercase tracking-normal text-left text-[28px] sm:text-[34px] lg:text-[38px] text-[#3E4259] leading-[1.3] max-w-[560px]"
          >
            ბუღალტრული პროგრამული{' '}
            <span className="text-brand-600">მომსახურება</span>
          </h2>

          <p
            data-acc-desc
            className="mt-6 text-[15px] sm:text-[16px] leading-relaxed tracking-normal max-w-[560px] text-[#3E4259] font-medium"
          >
            საწარმოს ყოველდღიური ფინანსური ოპერაციების სრული წარმოება და კონტროლი. რაც მოიცავს ერთ სივრცეში:
            მმართველის, ბუღალტრის, აუდიტის, ოპერატორის, მენეჯერის და სხვა სპეციალისტების მოქცევას.
            <br />
            ჩვენი სპეციალისტები უზრუნველყოფენ ყველა ჩანაწერის სიზუსტეს
            და მარეგულირებელ მოთხოვნებთან სრულ შესაბამისობას.
          </p>

          {/* CTA button — above the list, like the reference */}
          <a
            data-scroll-btn
            href="https://service.fins.ge"
            className="mt-8 inline-flex items-center justify-center gap-2 px-8 h-[52px] rounded-full text-[14px] font-semibold leading-none tracking-normal text-white bg-[#3D64FE] hover:bg-[#3556E5] hover:-translate-y-[1px] hover:shadow-[0_10px_36px_rgba(61,100,254,0.25)] transition-[background-color,box-shadow,transform] duration-300 ease-in-out"
          >
            დაწყება
            <ArrowRight size={16} />
          </a>

          {/* Bullet list — green checks */}
          <ul data-acc-bullets className="mt-9 flex flex-col gap-4">
            {BULLETS.map((b) => (
              <li
                key={b}
                data-acc-bullet
                className="flex items-start gap-3 text-[15px] sm:text-[16px] leading-snug tracking-normal text-[#3E4259]"
              >
                <img
                  src="/assets/check-green.svg"
                  alt=""
                  className="h-6 w-6 shrink-0 -mt-0.5 select-none"
                  draggable={false}
                />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Right column — live dashboard demo ───────────────── */}
        <div ref={demoRevealRef} className="w-full">
          <DemoScaler naturalWidth={920} naturalHeight={604}>
            <BrowserFrame url="https://fins.ge/">
              <DashboardDemo />
            </BrowserFrame>
          </DemoScaler>
        </div>

      </div>
    </section>
  )
}
