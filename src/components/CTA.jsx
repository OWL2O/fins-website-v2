import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight } from 'lucide-react'
import PricingCalculator from './PricingCalculator.jsx'

gsap.registerPlugin(ScrollTrigger)


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

      // Package card — own viewport trigger
      gsap.set('[data-cta-card]', { y: 40, opacity: 0 })
      gsap.to('[data-cta-card]', {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: '[data-cta-card]',
          start: 'top 90%',
          end: 'top 60%',
          scrub: 1,
        },
      })

      // Buttons — scale animation
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
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="pricing"
      className="relative flex items-center justify-center text-white min-h-[800px] lg:min-h-[1080px] w-full py-20 lg:py-28 lg:pt-14"
    >

      {/* Centered content */}
      <div data-cta-content className="relative z-10 mx-auto px-5 sm:px-8 lg:px-12 flex flex-col items-center justify-center text-center gap-9 max-w-[1200px]">
        <h2
          data-cta-enter
          className="font-banner text-white text-center text-[24px] sm:text-[44px] md:text-[35px] lg:text-[35px] min-[1700px]:text-[64px] leading-[1.2] tracking-normal"
        >
          მზად ხართ ბიზნესის ციფრული ტრანსფორმაციისთვის?
        </h2>

        <p
          data-cta-enter
          className="text-white text-center text-[15px] sm:text-[18px] lg:text-[16px] min-[1700px]:text-[22px] leading-[1.55] tracking-normal font-medium max-w-[860px]"
        >
          დაიწყე ბუღალტერიის და საოპერაციო მოდულების მართვა თვეში 60 ლარიდან. რეგისტრაცია მხოლოდ 2 წუთში.
        </p>

        {/* <a
          data-scroll-btn
          href="#contact"
          className="inline-flex items-center justify-center w-[203px] h-[42px] min-[1700px]:h-[52px] rounded-full text-[14px] font-medium leading-none tracking-normal text-white/60 border border-white/30 hover:text-white hover:border-white/60 bg-transparent transition-[background-color,border-color,color,box-shadow] duration-250"
        >
          ჩანიშნე შეხვედრა
        </a> */}

        <div
          data-cta-card
          className="w-full max-w-[431px] rounded-[20px] px-7 py-8 border border-white/[0.18] bg-white/[0.03]"
        >
          <PricingCalculator />
        </div>
      </div>
    </section>
  )
}
