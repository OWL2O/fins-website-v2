import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ChevronRight,
  Mail,
  MapPin,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader,
} from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

// Replace with your free access key from https://web3forms.com
// Enter fins.ge@gmail.com when creating the key — emails will arrive there.
const WEB3FORMS_KEY = '17019cc7-632a-49f7-9a00-60c011b65520'

const CONTACT_INFO = [
  { icon: Phone,   label: 'ტელეფონი',       value: '+995 500 11 40 90',    href: 'tel:+995500114090' },
  { icon: Mail,    label: 'ელ. ფოსტა',       value: 'fins.ge@gmail.com',    href: 'mailto:fins.ge@gmail.com' },
  { icon: MapPin,  label: 'მისამართი',        value: 'თბილისი, ირგვლივის 5', href: null },
  { icon: Clock,   label: 'სამუშაო საათები', value: 'ორ–პარ, 10:00–18:00',  href: null },
]

const INITIAL = { name: '', company: '', email: '', phone: '', message: '' }
const REQUIRED = ['name', 'phone', 'message']

export default function Contact() {
  const [form, setForm]       = useState(INITIAL)
  const [status, setStatus]   = useState('idle') // idle | loading | success | error
  const [touched, setTouched] = useState({})

  const set = (k) => (e) => {
    setForm((p) => ({ ...p, [k]: e.target.value }))
    setTouched((p) => ({ ...p, [k]: true }))
  }
  const blur = (k) => () => setTouched((p) => ({ ...p, [k]: true }))
  const err  = (k) => touched[k] && REQUIRED.includes(k) && !form[k].trim()

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Mark all required fields as touched so errors show
    const allTouched = Object.fromEntries(REQUIRED.map(k => [k, true]))
    setTouched((p) => ({ ...p, ...allTouched }))

    // Validate
    if (REQUIRED.some(k => !form[k].trim())) return

    setStatus('loading')

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `FINS — შეტყობინება: ${form.name}`,
          from_name: 'FINS Contact Form',
          name: form.name,
          company: form.company || '—',
          email: form.email,
          phone: form.phone || '—',
          message: form.message,
        }),
      })
      const data = await res.json()
      setStatus(data.success ? 'success' : 'error')
      if (data.success) setForm(INITIAL)
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="relative min-h-screen w-full bg-[#0A0E1A] font-sans">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-24 pb-10 sm:pt-32 sm:pb-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.6) 1px,transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-brand-600/[0.13] blur-[100px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 inset-x-0 h-24 bg-gradient-to-b from-transparent to-[#0A0E1A]"
        />

        <div className="relative mx-auto max-w-screen-xl px-5 sm:px-8 lg:px-12">
          <nav className="flex items-center gap-1.5 mb-8" aria-label="Breadcrumb">
            <Link
              to="/"
              className="text-[13px] font-medium tracking-normal text-white/35 hover:text-white/65 transition-colors"
            >
              FINS
            </Link>
            <ChevronRight size={12} className="text-white/20" />
            <span className="text-[13px] font-medium tracking-normal text-white/55">კონტაქტი</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-600/10 border border-brand-500/20 mb-5">
            <Mail size={11} className="text-brand-400" />
            <span className="text-[11px] font-semibold tracking-widest text-brand-400 uppercase">
              დაგვიკავშირდით
            </span>
          </div>

          <h1 className="text-[2rem] sm:text-[2.5rem] lg:text-5xl font-extrabold tracking-normal text-white leading-[1.15] mb-5 max-w-3xl">
            შეტყობინების გაგზავნა
          </h1>
          <p className="text-[15px] font-medium tracking-normal text-white/50 leading-relaxed max-w-2xl">
            ჩვენ დაგიკავშირდებით 24 საათის განმავლობაში. პირველი კონსულტაცია ყოველთვის უფასოა.
          </p>
        </div>
      </section>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-screen-xl px-5 sm:px-8 lg:px-12 pb-20 lg:pb-28">
        <div className="lg:grid lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] gap-12 xl:gap-16">

          {/* ── Form ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {status === 'success' ? (
              <div className="flex flex-col items-center justify-center text-center py-20 px-8 rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.06]">
                <CheckCircle size={48} className="text-emerald-400 mb-5" />
                <h2 className="text-[22px] font-extrabold text-white mb-2">გაგზავნილია!</h2>
                <p className="text-[15px] font-medium text-white/55 leading-relaxed max-w-sm">
                  თქვენი შეტყობინება მიღებულია. ჩვენ დაგიკავშირდებით 24 საათის განმავლობაში.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="mt-8 px-6 py-2.5 rounded-full border border-white/15 text-white/70 hover:text-white hover:border-white/30 text-[14px] font-medium transition-colors"
                >
                  ახალი შეტყობინება
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="სახელი და გვარი" required error={err('name')}>
                    <Input
                      placeholder="გიორგი მხეიძე"
                      value={form.name}
                      onChange={set('name')}
                      onBlur={blur('name')}
                      hasError={err('name')}
                    />
                  </Field>

                  <Field label="კომპანია">
                    <Input
                      placeholder="კომპანიის სახელი"
                      value={form.company}
                      onChange={set('company')}
                    />
                  </Field>

                  <Field label="ელ. ფოსტა">
                    <Input
                      type="email"
                      placeholder="info@company.ge"
                      value={form.email}
                      onChange={set('email')}
                    />
                  </Field>

                  <Field label="ტელეფონი" required error={err('phone')}>
                    <Input
                      type="tel"
                      placeholder="+995 5XX XX XX XX"
                      value={form.phone}
                      onChange={set('phone')}
                      onBlur={blur('phone')}
                      hasError={err('phone')}
                    />
                  </Field>

                  <Field label="შეტყობინება" required error={err('message')} className="sm:col-span-2">
                    <textarea
                      placeholder="მოგვიყევით თქვენი ბიზნესის შესახებ და რა სახის სერვისი გჭირდებათ..."
                      value={form.message}
                      onChange={set('message')}
                      onBlur={blur('message')}
                      rows={5}
                      className={`w-full rounded-xl border px-4 py-3 text-[14px] font-medium text-white placeholder-white/25 outline-none resize-none transition-colors duration-150 focus:bg-white/[0.06] ${
                        err('message')
                          ? 'border-red-500/60 bg-red-500/[0.04] focus:border-red-500/80'
                          : 'border-white/[0.10] bg-white/[0.04] focus:border-brand-500/60'
                      }`}
                    />
                    {err('message') && <span className="text-[12px] text-red-400 mt-0.5">შეტყობინება სავალდებულოა</span>}
                  </Field>
                </div>

                {status === 'error' && (
                  <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-500/25 bg-red-500/[0.07] px-4 py-3 text-[13px] font-medium text-red-300">
                    <AlertCircle size={15} className="shrink-0 mt-0.5" />
                    გაგზავნა ვერ მოხერხდა. გთხოვთ სცადოთ ხელახლა ან მოგვწეროთ პირდაპირ fins.ge@gmail.com-ზე.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="mt-6 inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-brand-600 hover:bg-brand-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-[14px] font-extrabold tracking-normal transition-colors duration-200 border border-brand-500/40"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader size={15} className="animate-spin" />
                      იგზავნება...
                    </>
                  ) : (
                    'შეტყობინების გაგზავნა'
                  )}
                </button>
              </form>
            )}
          </motion.div>

          {/* ── Contact info ── */}
          <motion.aside
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
            className="mt-12 lg:mt-0"
          >
            <h2 className="text-[18px] font-extrabold tracking-normal text-white mb-6">
              საკონტაქტო ინფორმაცია
            </h2>

            <div className="space-y-4">
              {CONTACT_INFO.map(({ icon: Icon, label, value, href }) => (
                <div
                  key={label}
                  className="flex items-start gap-4 p-4 rounded-xl border border-white/[0.07] bg-white/[0.03]"
                >
                  <div className="mt-0.5 h-9 w-9 flex items-center justify-center rounded-lg bg-brand-600/15 border border-brand-500/20 shrink-0 text-brand-400">
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-0.5">
                      {label}
                    </p>
                    {href ? (
                      <a
                        href={href}
                        className="text-[14px] font-medium text-white/80 hover:text-white transition-colors"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="text-[14px] font-medium text-white/80">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Free consultation box */}
            <div className="mt-6 p-5 rounded-2xl border border-brand-500/20 bg-brand-600/[0.08]">
              <p className="text-[14px] font-extrabold uppercase tracking-widest text-brand-300 mb-2">
                უფასო კონსულტაცია
              </p>
              <p className="text-[14px] font-medium text-brand-200/75 leading-relaxed">
                პირველი შეხვედრა ყოველთვის უფასოა. ჩვენი ექსპერტი გაანალიზებს თქვენს სიტუაციას
                და შემოგთავაზებს ოპტიმალური გადაწყვეტილებებს.
              </p>
            </div>
          </motion.aside>
        </div>
      </div>

      <div className="bg-[#0A0E1A]">
        <Footer />
      </div>
    </div>
  )
}

function Field({ label, required, error, className = '', children }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-[13px] font-semibold tracking-normal text-white/60">
        {label}
        {required && <span className="text-brand-400 ml-0.5">*</span>}
      </span>
      {children}
      {error && (
        <span className="text-[12px] text-red-400">{label} სავალდებულოა</span>
      )}
    </label>
  )
}

function Input({ className = '', hasError, ...props }) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border px-4 py-3 text-[14px] font-medium text-white placeholder-white/25 outline-none transition-colors duration-150 focus:bg-white/[0.06] ${
        hasError
          ? 'border-red-500/60 bg-red-500/[0.04] focus:border-red-500/80'
          : 'border-white/[0.10] bg-white/[0.04] focus:border-brand-500/60'
      } ${className}`}
    />
  )
}
