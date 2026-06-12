import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutGrid, Database, Calculator, Boxes, ShoppingCart, Package,
  UserRound, Settings, ChevronDown, ChevronUp, Bell, Plus, RefreshCw,
  X, Check, CheckCircle2, Import, ExternalLink,
} from 'lucide-react'

// ─── ბუღალტერია / ანგარიშები — interactive demo ─────────────────────────────
// Same visual language as TransactionsDemo (გატარებები) and functional the
// same way: "ახალი ანგარიშის შექმნა" opens a drawer; saving prepends a row.

const GROUPS = ['აქტივი', 'ვალდებულება', 'კაპიტალი', 'შემოსავალი', 'ხარჯი']

const GROUP_STYLES = {
  'აქტივი':       { background: '#E4E9FE', color: '#4C6EF5' },
  'ვალდებულება': { background: '#FAF3D4', color: '#A8861C' },
  'კაპიტალი':    { background: '#DEF2E4', color: '#37A45F' },
  'შემოსავალი':  { background: '#D9F0EE', color: '#2BA39A' },
  'ხარჯი':        { background: '#FBE9EC', color: '#D45A72' },
}

const ACTIVE_PASSIVE = ['აქტიური', 'პასიური']
const CURRENCIES = ['ლარი', 'აშშ დოლარი', 'ევრო']
const CURRENCY_CODE = { 'ლარი': 'GEL', 'აშშ დოლარი': 'USD', 'ევრო': 'EUR' }

const SIDEBAR_TOP = [
  { icon: LayoutGrid, label: 'დეშბორდი' },
  { icon: Database,   label: 'ოპერაციები' },
]

const ACCOUNTING_SUB = ['ანგარიშები', 'ბრუნვა', 'ნაშთები', 'ბარათი', 'გატარებები']
const ACTIVE_SUB = 'ანგარიშები'

const SIDEBAR_BOTTOM = [
  { icon: Boxes,        label: 'რეალიზაცია',   chevron: true },
  { icon: ShoppingCart, label: 'შეძენა',        chevron: true },
  { icon: Package,      label: 'პროდუქცია',    chevron: true },
  { icon: UserRound,    label: 'პერსონალური', chevron: true },
  { icon: Settings,     label: 'პარამეტრები' },
]

const fmtAmount = (n) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function seedRows() {
  return [
    { key: 'a1', code: '1110/000001', name: 'ნაღდი ფული სალაროში',          group: 'აქტივი',       currency: 'GEL', debit: 14250, credit: 0 },
    { key: 'a2', code: '1210/000001', name: 'ფული ბანკში — GEL',              group: 'აქტივი',       currency: 'GEL', debit: 86400, credit: 0 },
    { key: 'a3', code: '1410/000002', name: 'მოთხოვნები მიწოდებიდან',        group: 'აქტივი',       currency: 'GEL', debit: 5350,  credit: 0 },
    { key: 'a4', code: '3110/000001', name: 'ვალდებულებები მომწოდებლებზე', group: 'ვალდებულება', currency: 'GEL', debit: 0,     credit: 7900 },
    { key: 'a5', code: '5110/000001', name: 'საწესდებო კაპიტალი',             group: 'კაპიტალი',    currency: 'GEL', debit: 0,     credit: 50000 },
    { key: 'a6', code: '6110/000001', name: 'შემოსავალი რეალიზაციიდან',     group: 'შემოსავალი',  currency: 'GEL', debit: 0,     credit: 132000 },
  ]
}

const emptyForm = () => ({
  group: '',
  activePassive: '',
  currency: 'ლარი',
  name: '',
  comment: '',
  account: '',
  debit: '',
  credit: '',
})

const GRID = 'grid grid-cols-[104px_1fr_110px_58px_92px_92px] items-center px-3'

const inputCls = (error) =>
  `w-full h-[40px] rounded-[10px] border-[1.4px] bg-white px-3.5 text-[12px] font-medium text-[#313A4D] placeholder:text-[#3E4259]/45 outline-none transition-colors duration-200 focus:border-[#3D64FE] ${
    error ? 'border-[#F4485D]' : 'border-[#3E4259]/[0.30]'
  }`

// Floating label cut into the top border — like the app form
function FieldLabel({ required, children }) {
  return (
    <span className="absolute -top-[7px] left-3 z-[1] bg-white px-1 text-[10px] font-semibold leading-none text-[#313A4D]/70 select-none">
      {required && <span className="text-[#F4485D]">* </span>}
      {children}
    </span>
  )
}

// In-field placeholder with the red required asterisk — native placeholders
// can't style the asterisk, so it's overlaid instead.
function ReqPlaceholder({ children }) {
  return (
    <span className="pointer-events-none absolute left-[15px] top-1/2 -translate-y-1/2 z-[1] text-[12px] font-medium text-[#3E4259]/50 select-none">
      <span className="text-[#F4485D]">* </span>
      {children}
    </span>
  )
}

// label floats once a value is chosen; while empty either the red-asterisk
// overlay (overlayWhenEmpty) or a grey placeholder option shows in-field.
function SelectField({ label, required, placeholder, overlayWhenEmpty, value, onChange, options, error }) {
  const hasValue = value !== ''
  return (
    <div className="relative">
      {(hasValue || !overlayWhenEmpty) && <FieldLabel required={required}>{label}</FieldLabel>}
      {!hasValue && overlayWhenEmpty && <ReqPlaceholder>{label}</ReqPlaceholder>}
      <select
        aria-label={label}
        value={value}
        onChange={onChange}
        className={`${inputCls(error)} appearance-none pr-9 cursor-pointer`}
        style={{ color: hasValue ? '#313A4D' : 'rgba(62,66,89,0.5)' }}
      >
        <option value="" disabled hidden>{placeholder || ''}</option>
        {options.map((o) => (
          <option key={o} value={o} style={{ color: '#313A4D' }}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#3E4259]/55" />
    </div>
  )
}

function TextField({ label, required, value, onChange, error, ...rest }) {
  return (
    <div className="relative">
      {value !== '' && <FieldLabel required={required}>{label}</FieldLabel>}
      {value === '' && required && <ReqPlaceholder>{label}</ReqPlaceholder>}
      <input
        type="text"
        aria-label={label}
        placeholder={required ? '' : label}
        value={value}
        onChange={onChange}
        className={inputCls(error)}
        {...rest}
      />
    </div>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function DashboardDemo() {
  const [rows, setRows] = useState(seedRows)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [discovered, setDiscovered] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [spin, setSpin] = useState(0)
  const [toast, setToast] = useState(null)

  const toastTimer = useRef(null)

  // Esc closes the drawer
  useEffect(() => {
    if (!drawerOpen) return undefined
    const onKey = (e) => { if (e.key === 'Escape') setDrawerOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawerOpen])

  useEffect(() => () => clearTimeout(toastTimer.current), [])

  const set = (field) => (e) => {
    const value = e.target.value
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((er) => (er[field] ? { ...er, [field]: false } : er))
  }

  const openDrawer = () => {
    setDiscovered(true)
    setForm(emptyForm())
    setErrors({})
    setDrawerOpen(true)
  }

  const showToast = (text) => {
    clearTimeout(toastTimer.current)
    setToast({ id: Date.now(), text })
    toastTimer.current = setTimeout(() => setToast(null), 1700)
  }

  const save = () => {
    const nextErrors = {
      group: !form.group,
      activePassive: !form.activePassive,
      name: !form.name.trim(),
      account: !form.account.trim(),
    }
    if (Object.values(nextErrors).some(Boolean)) {
      setErrors(nextErrors)
      return
    }

    const newRow = {
      key: `u-${Date.now()}`,
      code: form.account.trim(),
      name: form.name.trim(),
      group: form.group,
      currency: CURRENCY_CODE[form.currency] || 'GEL',
      debit: parseFloat(String(form.debit).replace(',', '.')) || 0,
      credit: parseFloat(String(form.credit).replace(',', '.')) || 0,
    }
    setRows((r) => [newRow, ...r])
    showToast('ანგარიში დაემატა')
    setDrawerOpen(false)
  }

  const totalDebit = rows.reduce((s, r) => s + r.debit, 0)
  const totalCredit = rows.reduce((s, r) => s + r.credit, 0)

  return (
    <div className="relative flex w-[920px] h-[560px] bg-white text-left overflow-hidden">

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className="w-[216px] shrink-0 bg-[#3D4554] flex flex-col px-4 pt-5 pb-4 select-none" aria-hidden="true">
        <img
          src="/logo.svg"
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

          {/* ბუღალტერია — expanded group, ანგარიშები active */}
          <div className="flex items-center gap-2.5 h-[36px] px-2.5 rounded-lg">
            <Calculator size={15} strokeWidth={1.8} className="shrink-0 opacity-80" />
            ბუღალტერია
            <ChevronUp size={13} className="ml-auto opacity-65" />
          </div>
          <div className="flex flex-col gap-[2px] mb-[2px]">
            {ACCOUNTING_SUB.map((label) =>
              label === ACTIVE_SUB ? (
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
        <div className="flex items-center justify-between h-[58px] px-5 border-b border-[#3E4259]/[0.07] select-none">
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

        {/* Toolbar — refresh + ახალი ანგარიშის შექმნა + იმპორტი/ექსპორტი */}
        <div className="flex items-center justify-end gap-2.5 px-5 pt-3.5 pb-3">
          <button
            type="button"
            aria-label="განახლება"
            onClick={() => setSpin((s) => s + 1)}
            className="h-[36px] w-[42px] rounded-lg border border-[#3E4259]/[0.14] bg-white flex items-center justify-center cursor-pointer hover:bg-[#F4F6FE] transition-colors duration-200"
          >
            <motion.span
              animate={{ rotate: spin * 360 }}
              transition={{ duration: 0.55, ease: 'easeInOut' }}
              className="flex"
            >
              <RefreshCw size={14} className="text-[#313A4D]/75" />
            </motion.span>
          </button>

          <button
            type="button"
            onClick={openDrawer}
            className={`h-[36px] px-4 rounded-lg border border-[#3E4259]/[0.14] bg-white flex items-center gap-2 text-[12px] font-semibold text-[#313A4D] cursor-pointer hover:bg-[#F4F6FE] hover:border-[#3D64FE]/40 transition-[background-color,border-color,box-shadow] duration-300 ${discovered ? '' : 'demo-cta-pulse'}`}
          >
            <span className="flex h-[16px] w-[16px] items-center justify-center rounded-full border-[1.4px] border-[#313A4D]">
              <Plus size={10} strokeWidth={2.6} />
            </span>
            ახალი ანგარიშის შექმნა
          </button>

          {/* Static chrome — present in the real app's toolbar */}
          <div className="flex items-center gap-2 h-[36px] px-4 rounded-lg border border-[#3E4259]/[0.14] bg-white text-[12px] font-semibold text-[#313A4D] select-none">
            <Import size={14} className="text-[#313A4D]/80" />
            იმპორტი
          </div>
          <div className="flex items-center gap-2 h-[36px] px-4 rounded-lg border border-[#3E4259]/[0.14] bg-white text-[12px] font-semibold text-[#313A4D] select-none">
            <ExternalLink size={14} className="text-[#313A4D]/80" />
            ექსპორტი
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 flex flex-col min-h-0 px-5 pb-4">
          {/* Header */}
          <div className={`${GRID} h-[38px] shrink-0 rounded-xl bg-[#E9ECF9] text-[11px] font-bold text-[#313A4D] select-none`}>
            <span>ანგარიში</span>
            <span>დასახელება</span>
            <span>ჯგუფი</span>
            <span className="text-center">ვალუტა</span>
            <span className="text-right">დებეტი</span>
            <span className="text-right">კრედიტი</span>
          </div>

          {/* Rows — newest on top, scrolls when long */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden" style={{ scrollbarWidth: 'thin' }}>
            <AnimatePresence initial={false}>
              {rows.map((row) => (
                <motion.div
                  key={row.key}
                  layout="position"
                  initial={{ opacity: 0, y: -16, backgroundColor: 'rgba(61,100,254,0.08)' }}
                  animate={{ opacity: 1, y: 0, backgroundColor: 'rgba(61,100,254,0)' }}
                  transition={{
                    layout: { duration: 0.4, ease: [0.32, 0.72, 0.24, 1] },
                    opacity: { duration: 0.35 },
                    y: { duration: 0.4, ease: [0.32, 0.72, 0.24, 1] },
                    backgroundColor: { duration: 1.4, delay: 0.3 },
                  }}
                  className={`${GRID} h-[44px] rounded-lg border-b border-[#3E4259]/[0.06] text-[11.5px] hover:bg-[#F7F8FD] transition-colors`}
                >
                  <span className="font-semibold text-[#313A4D]/85 tabular-nums truncate pr-2">{row.code}</span>
                  <span className="font-medium text-[#313A4D] truncate pr-2">{row.name}</span>
                  <span>
                    <span
                      className="inline-flex items-center h-[24px] px-2.5 rounded-md text-[11px] font-semibold"
                      style={GROUP_STYLES[row.group] || GROUP_STYLES['აქტივი']}
                    >
                      {row.group}
                    </span>
                  </span>
                  <span className="text-center font-semibold text-[#313A4D]/80">{row.currency}</span>
                  <span className={`text-right font-semibold tabular-nums ${row.debit ? 'text-[#313A4D]' : 'text-[#313A4D]/40'}`}>
                    {fmtAmount(row.debit)}
                  </span>
                  <span className={`text-right font-semibold tabular-nums ${row.credit ? 'text-[#313A4D]' : 'text-[#313A4D]/40'}`}>
                    {fmtAmount(row.credit)}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* ჯამი — totals row */}
          <div className={`${GRID} h-[40px] shrink-0 mt-1 rounded-xl bg-[#E9ECF9] text-[11.5px] font-bold text-[#313A4D] select-none`}>
            <span>ჯამი</span>
            <span className="font-semibold text-[#313A4D]/75">სულ {rows.length} ანგარიში</span>
            <span />
            <span />
            <span className="text-right tabular-nums">{fmtAmount(totalDebit)}</span>
            <span className="text-right tabular-nums">{fmtAmount(totalCredit)}</span>
          </div>
        </div>
      </div>

      {/* ── Success toast ───────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="absolute top-[70px] left-[236px] z-50 flex items-center gap-2 h-[34px] px-3.5 rounded-lg bg-[#E1F4E6] border border-[#3CAB5F]/25 text-[#2F9D54] text-[11.5px] font-semibold shadow-[0_8px_24px_rgba(47,157,84,0.18)]"
          >
            <CheckCircle2 size={14} />
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ანგარიშის დამატება — drawer from the right ─────── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setDrawerOpen(false)}
              className="absolute inset-0 z-30 bg-[#1A2233]/40"
            />

            <motion.div
              key="drawer"
              role="dialog"
              aria-label="ანგარიშის დამატება"
              initial={{ x: 350 }}
              animate={{ x: 0 }}
              exit={{ x: 350 }}
              transition={{ type: 'spring', stiffness: 380, damping: 36 }}
              className="absolute inset-y-0 right-0 z-40 w-[330px] bg-white rounded-l-[16px] shadow-[0_18px_60px_rgba(20,28,50,0.35)] flex flex-col"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between h-[54px] px-5 border-b border-[#3E4259]/[0.10] shrink-0">
                <p className="text-[13.5px] font-bold text-[#313A4D]">ანგარიშის დამატება</p>
                <button
                  type="button"
                  aria-label="დახურვა"
                  onClick={() => setDrawerOpen(false)}
                  className="flex h-[28px] w-[28px] items-center justify-center rounded-full border-[1.6px] border-[#313A4D]/80 text-[#313A4D] cursor-pointer hover:bg-[#F2F3F7] transition-colors duration-200"
                >
                  <X size={13} strokeWidth={2.4} />
                </button>
              </div>

              {/* Drawer body */}
              <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3.5" style={{ scrollbarWidth: 'thin' }}>

                <SelectField
                  label="აქაუნთის ჯგუფი"
                  required
                  overlayWhenEmpty
                  value={form.group}
                  onChange={set('group')}
                  options={GROUPS}
                  error={errors.group}
                />

                <SelectField
                  label="აირჩიეთ აქტიური პასიური"
                  required
                  placeholder="აირჩიეთ"
                  value={form.activePassive}
                  onChange={set('activePassive')}
                  options={ACTIVE_PASSIVE}
                  error={errors.activePassive}
                />

                <SelectField
                  label="ვალუტა"
                  required
                  value={form.currency}
                  onChange={set('currency')}
                  options={CURRENCIES}
                />

                <TextField
                  label="დასახელება"
                  required
                  value={form.name}
                  onChange={set('name')}
                  error={errors.name}
                />

                <div className="relative">
                  {form.comment !== '' && <FieldLabel>კომენტარი</FieldLabel>}
                  <textarea
                    aria-label="კომენტარი"
                    placeholder="კომენტარი"
                    rows={2}
                    value={form.comment}
                    onChange={set('comment')}
                    className={`${inputCls(false)} h-auto min-h-[56px] py-2.5 resize-none`}
                  />
                </div>

                <TextField
                  label="ანგარიში"
                  required
                  inputMode="numeric"
                  value={form.account}
                  onChange={set('account')}
                  error={errors.account}
                />

                <TextField
                  label="სასტარტო ფინანსური დებეტი"
                  inputMode="decimal"
                  value={form.debit}
                  onChange={set('debit')}
                />

                <TextField
                  label="სასტარტო ფინანსური კრედიტი"
                  inputMode="decimal"
                  value={form.credit}
                  onChange={set('credit')}
                />

                {/* Action */}
                <button
                  type="button"
                  onClick={save}
                  className="mt-1 h-[44px] shrink-0 rounded-[10px] bg-[#5B6FF0] hover:bg-[#4A5EE0] text-white text-[12.5px] font-semibold flex items-center justify-center gap-2 cursor-pointer active:scale-[0.985] transition-all duration-200"
                >
                  <Check size={15} strokeWidth={2.4} />
                  შენახვა
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
