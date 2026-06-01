import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Mail, Phone } from 'lucide-react'

export default function ContactBanner() {
  return (
    <section className="relative px-5 sm:px-8 lg:px-12 py-10 lg:py-14">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="relative mx-auto max-w-screen-xl overflow-hidden rounded-2xl border border-white/[0.08] px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12 lg:flex lg:items-center lg:justify-between lg:gap-10"
        style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
      >
        {/* Accent line — left edge */}
        <div
          aria-hidden="true"
          className="absolute left-0 top-8 bottom-8 w-[3px] rounded-full bg-brand-600/60"
        />

        {/* Left — text */}
        <div className="relative z-10 pl-2">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-400 mb-3">
            კონტაქტი
          </p>
          <h2 className="text-[22px] sm:text-[26px] font-extrabold tracking-normal text-white leading-snug mb-3">
            გვაქვს პასუხი თქვენს კითხვაზე
          </h2>
          <p className="text-[14px] font-medium text-white/45 leading-relaxed max-w-md mb-6">
            დაგვიკავშირდით — პირველი კონსულტაცია უფასოა და პასუხს 24 საათში მოგაწვდით.
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              href="tel:+995500114090"
              className="inline-flex items-center gap-2 text-[13px] font-medium text-white/50 hover:text-white/85 transition-colors"
            >
              <Phone size={13} className="text-brand-400 shrink-0" />
              +995 500 11 40 90
            </a>
            <span className="text-white/15 select-none">·</span>
            <a
              href="mailto:fins.ge@gmail.com"
              className="inline-flex items-center gap-2 text-[13px] font-medium text-white/50 hover:text-white/85 transition-colors"
            >
              <Mail size={13} className="text-brand-400 shrink-0" />
              fins.ge@gmail.com
            </a>
          </div>
        </div>

        {/* Right — CTA */}
        <div className="relative z-10 mt-8 lg:mt-0 lg:shrink-0">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-brand-600 hover:bg-brand-500 text-white text-[14px] font-extrabold tracking-normal transition-colors duration-200 border border-brand-500/40 whitespace-nowrap"
          >
            შეტყობინების გაგზავნა
            <ArrowRight size={15} />
          </Link>
        </div>
      </motion.div>
    </section>
  )
}
