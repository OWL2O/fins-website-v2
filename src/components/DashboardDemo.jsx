import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutGrid, Database, Calculator, Boxes, ShoppingCart, Package,
  UserRound, Settings, ChevronDown, ChevronUp, Bell,
} from 'lucide-react'

// ─── Figma reference data — ბუღალტერია / ანგარიშები ─────────────────────────

const ROWS = [
  { id: '#234', type: 'ხელფასი',    name: 'თვიური ხელფასები', amount: '-32,000', dir: 'neg' },
  { id: '#719', type: 'დივიდენდი',  name: 'შპს. ბიოფარმა',     amount: '+19,000', dir: 'pos' },
  { id: '#494', type: 'შემოსავალი', name: 'შპს. ბიფარმა',      amount: '+12,500', dir: 'pos' },
  { id: '#394', type: 'გადასახადი', name: 'შპს. ჯიფარმა',      amount: '-1,000',  dir: 'neg' },
  { id: '#394', type: 'გადასახადი', name: 'შპს. ჯიფარმა',      amount: '-2,000',  dir: 'neg' },
  { id: '#394', type: 'გადასახადი', name: 'შპს. ჯიფარმა',      amount: '-8,000',  dir: 'neg' },
  { id: '#394', type: 'გადასახადი', name: 'შპს. ჯიფარმა',      amount: '-1,000',  dir: 'neg' },
  { id: '#394', type: 'გადასახადი', name: 'შპს. ჯიფარმა',      amount: '-600',    dir: 'neg' },
  { id: '#394', type: 'გადასახადი', name: 'შპს. ჯიფარმა',      amount: '-750',    dir: 'neg' },
  { id: '#394', type: 'გადასახადი', name: 'შპს. ჯიფარმა',      amount: '-12,000', dir: 'neg' },
].map((r, i) => ({ ...r, key: `row-${i}` }))

const TYPE_STYLES = {
  'ხელფასი':    { background: '#E4E9FE', color: '#4C6EF5' },
  'დივიდენდი':  { background: '#DEF2E4', color: '#37A45F' },
  'შემოსავალი': { background: '#D9F0EE', color: '#2BA39A' },
  'გადასახადი': { background: '#FAF3D4', color: '#A8861C' },
}

const SIDEBAR_TOP = [
  { icon: LayoutGrid, label: 'დეშბორდი' },
  { icon: Database,   label: 'ოპერაციები' },
]

const ACCOUNTING_SUB = ['ანგარიშები', 'ბრუნვა', 'ნაშთები', 'ბარათი', 'გატარებები']

const SIDEBAR_BOTTOM = [
  { icon: Boxes,        label: 'რეალიზაცია',   chevron: true },
  { icon: ShoppingCart, label: 'შეძენა',        chevron: true },
  { icon: Package,      label: 'პროდუქცია',    chevron: true },
  { icon: UserRound,    label: 'პერსონალური', chevron: true },
  { icon: Settings,     label: 'პარამეტრები' },
]

const VISIBLE = 7
const TICK_MS = 2600

// ─── Component ───────────────────────────────────────────────────────────────

export default function DashboardDemo() {
  const rootRef = useRef(null)
  const [tick, setTick] = useState(0)

  // Advance the live feed only while visible, and never under reduced motion
  useEffect(() => {
    const el = rootRef.current
    if (!el) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    let timer = null
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!timer) timer = setInterval(() => setTick((t) => t + 1), TICK_MS)
      } else {
        clearInterval(timer)
        timer = null
      }
    }, { threshold: 0.15 })
    io.observe(el)
    return () => { clearInterval(timer); io.disconnect() }
  }, [])

  // Each tick a new "generation" enters at the top and the oldest row leaves
  // at the bottom. A row keeps its generation key while it travels down, so
  // framer-motion layout-shifts survivors instead of re-mounting them.
  const visible = Array.from({ length: VISIBLE }, (_, i) => {
    const gen = tick - i
    const poolIdx = (((-gen) % ROWS.length) + ROWS.length) % ROWS.length
    return { ...ROWS[poolIdx], feedKey: `gen-${gen}` }
  })

  return (
    <div ref={rootRef} className="flex w-[920px] h-[560px] bg-white text-left select-none" aria-hidden="true">

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className="w-[216px] shrink-0 bg-[#3D4554] flex flex-col px-4 pt-5 pb-4">
        <img
          src="/fins-logo.png"
          alt=""
          className="h-[26px] w-auto self-start ml-2 mb-6 select-none"
          draggable={false}
        />

        <nav className="flex flex-col gap-[2px] text-[12.5px] font-medium text-white/[0.82]">
          {SIDEBAR_TOP.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2.5 h-[36px] px-2.5 rounded-lg">
              <Icon size={15} strokeWidth={1.8} className="shrink-0 opacity-80" />
              {label}
            </div>
          ))}

          {/* ბუღალტერია — expanded group */}
          <div className="flex items-center gap-2.5 h-[36px] px-2.5 rounded-lg">
            <Calculator size={15} strokeWidth={1.8} className="shrink-0 opacity-80" />
            ბუღალტერია
            <ChevronUp size={13} className="ml-auto opacity-65" />
          </div>
          <div className="flex flex-col gap-[2px] mb-[2px]">
            {ACCOUNTING_SUB.map((label, i) =>
              i === 0 ? (
                <div
                  key={label}
                  className="flex items-center h-[32px] ml-[26px] px-3 rounded-lg bg-white text-[#313A4D] text-[12px] font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.18)]"
                >
                  {label}
                </div>
              ) : (
                <div key={label} className="flex items-center h-[30px] ml-[26px] px-3 text-[12px] text-white/[0.68]">
                  {label}
                </div>
              )
            )}
          </div>

          {SIDEBAR_BOTTOM.map(({ icon: Icon, label, chevron }) => (
            <div key={label} className="flex items-center gap-2.5 h-[36px] px-2.5 rounded-lg">
              <Icon size={15} strokeWidth={1.8} className="shrink-0 opacity-80" />
              {label}
              {chevron && <ChevronDown size={13} className="ml-auto opacity-65" />}
            </div>
          ))}
        </nav>
      </aside>

      {/* ── Main ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <div className="flex items-center justify-between h-[58px] px-5 border-b border-[#3E4259]/[0.07]">
          <p className="text-[13.5px] font-bold text-[#313A4D] tracking-normal">
            ბუღალტერია <span className="font-medium text-[#313A4D]/45">/</span> ანგარიშები
          </p>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-6 h-[36px] px-3.5 rounded-lg border border-[#3E4259]/[0.13] text-[12px] font-semibold text-[#313A4D]">
              შპს ფინსი
              <ChevronDown size={13} className="text-[#313A4D]/55" />
            </div>

            <div className="relative h-[34px] w-[34px] rounded-full bg-[#F2F3F7] flex items-center justify-center">
              <Bell size={14} className="text-[#313A4D]/75 demo-bell" />
              <span className="dot-pulse absolute top-[7px] right-[8px] h-[6px] w-[6px] rounded-full bg-[#F4485D] ring-2 ring-white" />
            </div>

            <div className="flex items-center gap-2.5">
              <div className="text-right leading-tight">
                <p className="text-[11.5px] font-bold text-[#313A4D]">გამარჯობა ნიკი!</p>
                <p className="text-[10px] font-medium text-[#313A4D]/45">ბუღალტერი</p>
              </div>
              <div className="h-[34px] w-[34px] rounded-full bg-gradient-to-br from-[#5A7CFE] to-[#3D64FE] flex items-center justify-center text-white text-[13px] font-bold">
                ნ
              </div>
              <ChevronDown size={13} className="text-[#313A4D]/55" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 px-5 pt-4 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[70px_118px_1fr_108px_76px_128px] items-center h-[40px] px-3 rounded-xl bg-[#E9ECF9] text-[11.5px] font-bold text-[#313A4D]">
            <span>ID</span>
            <span>ტიპი</span>
            <span>დასახელება</span>
            <span className="text-right">თანხა</span>
            <span className="text-center">ვალუტა</span>
            <span className="text-center">სტატუსი</span>
          </div>

          {/* Live rows */}
          <div className="relative">
            <AnimatePresence initial={false} mode="popLayout">
              {visible.map((row, i) => (
                <motion.div
                  key={row.feedKey}
                  layout
                  initial={{ opacity: 0, y: -16, backgroundColor: 'rgba(61,100,254,0.07)' }}
                  animate={{ opacity: 1, y: 0, backgroundColor: 'rgba(61,100,254,0)' }}
                  exit={{ opacity: 0, y: 14 }}
                  transition={{
                    layout: { duration: 0.45, ease: [0.32, 0.72, 0.24, 1] },
                    opacity: { duration: 0.4 },
                    y: { duration: 0.45, ease: [0.32, 0.72, 0.24, 1] },
                    backgroundColor: { duration: 1.4, delay: 0.3 },
                  }}
                  className="grid grid-cols-[70px_118px_1fr_108px_76px_128px] items-center h-[46px] px-3 rounded-lg border-b border-[#3E4259]/[0.06] text-[12.5px]"
                  style={{ zIndex: VISIBLE - i }}
                >
                  <span className="font-semibold text-[#313A4D]/85 tabular-nums">{row.id}</span>
                  <span>
                    <span
                      className="inline-flex items-center h-[24px] px-2.5 rounded-md text-[11px] font-semibold"
                      style={TYPE_STYLES[row.type]}
                    >
                      {row.type}
                    </span>
                  </span>
                  <span className="font-medium text-[#313A4D] truncate pr-2">{row.name}</span>
                  <span
                    className="text-right font-bold tabular-nums"
                    style={{ color: row.dir === 'neg' ? '#F25C7E' : '#2FAE68' }}
                  >
                    {row.amount}
                  </span>
                  <span className="text-center font-semibold text-[#313A4D]/80">GEL</span>
                  <span className="text-center">
                    <motion.span
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.28, duration: 0.3, ease: 'backOut' }}
                      className="inline-flex items-center h-[24px] px-3 rounded-md bg-[#E1F4E6] text-[#3CAB5F] text-[11px] font-semibold"
                    >
                      დასრულებული
                    </motion.span>
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Bottom fade so exiting rows dissolve into whitespace */}
            <div className="pointer-events-none absolute -bottom-1 left-0 right-0 h-10 bg-gradient-to-b from-transparent to-white" />
          </div>
        </div>
      </div>
    </div>
  )
}
