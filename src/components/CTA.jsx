import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import PricingCalculator from './PricingCalculator.jsx'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

export default function CTA() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const enterEls = gsap.utils.toArray('[data-cta-enter]')
      gsap.set(enterEls, { y: 40, opacity: 0 })
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '[data-cta-content]',
          start: 'top 87%',
          end: 'top 60%',
          scrub: 1,
        },
      })
      enterEls.forEach((el, i) => {
        tl.to(el, {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power2.inOut',
        }, i * 0.1)
      })

      // Pricing card — own viewport trigger
      gsap.set('[data-cta-card]', { y: 48, opacity: 0, scale: 0.98 })
      gsap.to('[data-cta-card]', {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 1,
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: '[data-cta-card]',
          start: 'top 92%',
          end: 'top 62%',
          scrub: 1,
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="pricing"
      className="relative isolate overflow-hidden w-full py-20 sm:py-24 lg:py-32 bg-white"
    >
      {/* Figma light gradient — lavender corners, soft green center glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: [
            'radial-gradient(44% 42% at 0% 8%, rgba(96,108,255,0.10), transparent 70%)',
            'radial-gradient(42% 44% at 100% 14%, rgba(61,100,254,0.09), transparent 70%)',
            'radial-gradient(46% 40% at 50% 100%, rgba(110,190,150,0.09), transparent 72%)',
          ].join(', '),
        }}
      />

      <div data-cta-content className="relative z-10 mx-auto px-5 sm:px-8 lg:px-12 flex flex-col items-center justify-center text-center max-w-[1200px]">
        <h2
          data-cta-enter
          className="font-banner uppercase text-[#3E4259] text-center tracking-normal leading-[1.25] text-[26px] sm:text-[36px] lg:text-[46px] min-[1700px]:text-[54px] max-w-[1000px]"
        >
          მზად ხართ ბიზნესის ციფრული ტრანსფორმაციისთვის?
        </h2>

        <p
          data-cta-enter
          className="mt-6 text-[#3E4259]/75 text-center text-[14px] sm:text-[16px] lg:text-[17px] leading-[1.65] tracking-normal font-medium max-w-[680px]"
        >
          დაიწყე ბუღალტერიის და საოპერაციო მოდულების მართვა თვეში 60 ლარიდან.
          რეგისტრაცია მხოლოდ 2 წუთში.
        </p>

        <a
          data-cta-enter
          href="#contact"
          onClick={(e) => {
            e.preventDefault()
            gsap.to(window, { scrollTo: '#contact', duration: 0.8, ease: 'power2.inOut' })
          }}
          className="mt-9 inline-flex items-center justify-center h-[46px] px-8 rounded-full text-[14px] font-semibold leading-none tracking-normal text-[#3D64FE] bg-white border border-[#3D64FE]/35 hover:border-[#3D64FE]/70 hover:bg-[#3D64FE]/[0.04] hover:-translate-y-px transition-[border-color,background-color,box-shadow] duration-300 ease-out shadow-[0_4px_18px_rgba(61,100,254,0.08)]"
        >
          ჩანიშნე შეხვედრა
        </a>

        {/* Split calculator card */}
        <div
          data-cta-card
          className="mt-12 w-full max-w-[860px] rounded-[20px] bg-white border border-[#3E4259]/[0.08] shadow-[0_30px_90px_rgba(40,55,120,0.12),0_6px_24px_rgba(40,55,120,0.06)] overflow-hidden"
        >
          <PricingCalculator />
        </div>
      </div>
    </section>
  )
}
