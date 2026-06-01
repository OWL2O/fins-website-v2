import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight, Clock, FileText } from 'lucide-react'
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'

// ── Prose helpers ─────────────────────────────────────────────────────────────

export function P({ children }) {
  return (
    <p className="text-[15px] font-medium leading-relaxed tracking-normal text-white/65 mb-4 last:mb-0">
      {children}
    </p>
  )
}

export function H3({ children }) {
  return (
    <h3 className="text-[13px] font-extrabold tracking-normal text-white mt-5 mb-2 first:mt-0">
      {children}
    </h3>
  )
}

export function Ul({ items }) {
  return (
    <ul className="my-3 space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="mt-[9px] h-1.5 w-1.5 rounded-full bg-brand-400 shrink-0" aria-hidden="true" />
          <span className="text-[15px] font-medium leading-relaxed tracking-normal text-white/65">{item}</span>
        </li>
      ))}
    </ul>
  )
}

export function InfoBox({ children, variant = 'blue' }) {
  const styles = {
    blue:    'bg-brand-600/10 border-brand-500/25 text-brand-200',
    amber:   'bg-amber-500/10 border-amber-500/25 text-amber-200',
    emerald: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-200',
  }
  return (
    <div className={`rounded-xl border px-4 py-3.5 my-4 text-[14px] font-medium leading-relaxed tracking-normal ${styles[variant]}`}>
      {children}
    </div>
  )
}

// ── Main Layout ───────────────────────────────────────────────────────────────

export default function LegalPageLayout({ badge, title, description, lastUpdated, sections }) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '')

  // Track active section via IntersectionObserver
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting)
        if (visible) setActiveId(visible.target.id)
      },
      { rootMargin: '-15% 0% -68% 0%', threshold: 0 }
    )
    sections.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [sections])

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="relative min-h-screen w-full bg-[#0A0E1A] font-sans">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-20">
        {/* Grid pattern */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.6) 1px,transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />
        {/* Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-brand-600/[0.13] blur-[100px]"
        />
        {/* Bottom fade */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 inset-x-0 h-24 bg-gradient-to-b from-transparent to-[#0A0E1A]"
        />

        <div className="relative mx-auto max-w-screen-xl px-5 sm:px-8 lg:px-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 mb-8" aria-label="Breadcrumb">
            <Link to="/" className="text-[13px] font-medium tracking-normal text-white/35 hover:text-white/65 transition-colors">
              FINS
            </Link>
            <ChevronRight size={12} className="text-white/20" />
            <span className="text-[13px] font-medium tracking-normal text-white/55">{title}</span>
          </nav>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-600/10 border border-brand-500/20 mb-5">
            <FileText size={11} className="text-brand-400" />
            <span className="text-[11px] font-semibold tracking-widest text-brand-400 uppercase">
              {badge}
            </span>
          </div>

          <h1 className="text-[2rem] sm:text-[2.5rem] lg:text-5xl font-extrabold tracking-normal text-white leading-[1.15] mb-5 max-w-3xl">
            {title}
          </h1>
          <p className="text-[15px] font-medium tracking-normal text-white/50 leading-relaxed max-w-2xl mb-8">
            {description}
          </p>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] font-medium tracking-normal text-white/30">
            <span className="flex items-center gap-1.5">
              <Clock size={13} />
              ბოლო განახლება: {lastUpdated}
            </span>
            <span aria-hidden="true">·</span>
            <span>{sections.length} სექცია</span>
          </div>
        </div>
      </section>

      {/* ── Mobile TOC strip ─────────────────────────────────────────────── */}
      <div className="lg:hidden sticky top-[65px] z-30 bg-[#0A0E1A]/90 backdrop-blur-md border-b border-white/[0.06]">
        <div className="flex gap-1.5 px-4 py-2.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {sections.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => scrollTo(s.id)}
              className={`flex-none px-3 py-1.5 rounded-lg text-[12px] font-medium tracking-normal whitespace-nowrap transition-all duration-150 ${
                activeId === s.id
                  ? 'bg-brand-600 text-white font-extrabold'
                  : 'bg-white/[0.05] text-white/50 hover:bg-white/[0.09] hover:text-white/80'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-screen-xl px-5 sm:px-8 lg:px-12 py-12 lg:py-16">
        <div className="lg:flex lg:gap-14 xl:gap-20">

          {/* ── Sidebar ── */}
          <aside className="hidden lg:block w-52 xl:w-60 shrink-0" aria-label="Document outline">
            <div className="sticky top-28">
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-white/25 px-3 mb-3">
                შინაარსი
              </p>
              <nav>
                <ul className="space-y-0.5">
                  {sections.map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => scrollTo(s.id)}
                        aria-current={activeId === s.id ? 'location' : undefined}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium tracking-normal text-left transition-all duration-200 group ${
                          activeId === s.id
                            ? 'bg-brand-600/15 text-white font-extrabold'
                            : 'text-white/40 hover:text-white/75 hover:bg-white/[0.04]'
                        }`}
                      >
                        <span className={`font-mono text-[10px] font-bold w-5 shrink-0 transition-colors ${
                          activeId === s.id ? 'text-brand-400' : 'text-white/20 group-hover:text-white/35'
                        }`}>
                          {s.number}
                        </span>
                        <span className="leading-snug">{s.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Help card */}
              <div className="mt-8 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07]">
                <p className="text-[13px] font-extrabold tracking-normal text-white/70 mb-1.5">
                  შეკითხვა გაქვთ?
                </p>
                <p className="text-[12px] font-medium tracking-normal text-white/40 leading-relaxed">
                  გვიკავშირდით ნებისმიერი კითხვის შემთხვევაში.
                </p>
                <a
                  href="/#contact"
                  className="mt-3 inline-flex items-center gap-1 text-[12px] font-extrabold tracking-normal text-brand-400 hover:text-brand-300 transition-colors"
                >
                  კონტაქტი
                  <ChevronRight size={12} />
                </a>
              </div>
            </div>
          </aside>

          {/* ── Main content ── */}
          <main className="flex-1 min-w-0">
            <div className="divide-y divide-white/[0.05]">
              {sections.map((section, i) => (
                <motion.section
                  key={section.id}
                  id={section.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, ease: 'easeOut', delay: i === 0 ? 0 : 0.04 }}
                  className="scroll-mt-36 lg:scroll-mt-28 py-10 first:pt-0"
                >
                  {/* Section header */}
                  <div className="flex items-start gap-4 mb-6">
                    <div
                      aria-hidden="true"
                      className="mt-0.5 h-10 w-10 flex items-center justify-center rounded-xl bg-brand-600/15 border border-brand-500/20 shrink-0 text-brand-400 [&>svg]:h-[18px] [&>svg]:w-[18px]"
                    >
                      {section.icon}
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-2 text-[13px] font-medium leading-none text-brand-400 mb-2">
                        <span className="h-px w-4 bg-brand-400" />
                        {section.number}
                      </div>
                      <h2 className="text-[20px] sm:text-[22px] font-extrabold tracking-normal text-white leading-snug">
                        {section.title}
                      </h2>
                    </div>
                  </div>

                  {/* Section body */}
                  <div className="ml-14 space-y-1">
                    {section.content}
                  </div>
                </motion.section>
              ))}
            </div>

            {/* Bottom CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="mt-14 p-7 sm:p-10 rounded-2xl border border-brand-700/30 text-center"
              style={{
                background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(59,91,219,0.13), transparent 70%)',
                backgroundColor: 'rgba(15,20,34,0.6)',
              }}
            >
              <p className="text-white font-extrabold tracking-normal text-[20px] sm:text-[22px] mb-2">
                კიდევ გაქვთ შეკითხვები?
              </p>
              <p className="text-white/50 font-medium tracking-normal text-[15px] mb-6 leading-relaxed max-w-md mx-auto">
                ჩვენი გუნდი მზადაა გიპასუხოთ ნებისმიერ კითხვაზე.
              </p>
              <a
                href="/#contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-600 hover:bg-brand-500 text-white text-[14px] font-extrabold tracking-normal transition-colors duration-200 border border-brand-500/40"
              >
                დაგვიკავშირდით
                <ChevronRight size={15} />
              </a>
            </motion.div>
          </main>
        </div>
      </div>

      <div className="bg-[#0A0E1A]">
        <Footer />
      </div>
    </div>
  )
}
