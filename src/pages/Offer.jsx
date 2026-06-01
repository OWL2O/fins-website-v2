import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { ArrowLeft, Copy, Check, Printer, AlertTriangle, AlertOctagon } from 'lucide-react'

// ─── Pricing ──────────────────────────────────────────────────────────────────

function getRate(n) {
  if (n === 1) return 2.0
  if (n === 2) return 1.8
  if (n === 3) return 1.6
  if (n === 4) return 1.4
  return 1.2
}
function getMonthly(n) {
  return Math.round(getRate(n) * n * 30)
}
function getDiscount(n) {
  return Math.round((1 - getRate(n) / 2.0) * 100)
}

// ─── Correct FINS data (from official requisites) ─────────────────────────────

const FINS = {
  name:    'შპს ფინს პროგრამ სერვისი',
  idCode:  '436258826',
  bank:    'სს. საქართველოს ბანკი',
  iban:    'GE94BG0000000594224610',
  purpose: 'პროგრამული სერვისის შეძენა',
  website: 'fins.ge',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function today() {
  return new Date().toLocaleDateString('ka-GE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }).replace(/\//g, '.')
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Offer() {
  const [params]  = useSearchParams()
  const [copied, setCopied] = useState(false)

  const rawN     = parseInt(params.get('objects') || '1', 10)
  const objects  = Math.max(1, Math.min(15, rawN))
  const isEnt    = objects >= 15
  const monthly  = getMonthly(objects)
  const discount = getDiscount(objects)

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    })
  }

  return (
    <>
      {/* ── Print styles ──────────────────────────────────────────────────── */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #f0f2f5 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .doc-card { box-shadow: none !important; }
        }
        @page { size: A4; margin: 12mm 10mm; }
      `}</style>

      {/* ── Top toolbar (screen only) ─────────────────────────────────────── */}
      <div className="no-print sticky top-0 z-50 bg-white border-b border-gray-200 px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 text-[13px] font-medium transition-colors">
          <ArrowLeft size={15} />
          მთავარ გვერდზე
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 px-4 h-[34px] rounded-full text-[12px] font-medium border transition-all duration-200 ${
              copied
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-800'
            }`}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'კოპირებულია!' : 'ლინკის კოპირება'}
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 h-[34px] rounded-full text-[12px] font-semibold text-white bg-[#1A56CC] hover:bg-[#1649B8] border border-[#1A56CC] transition-colors duration-200"
          >
            <Printer size={13} />
            PDF გადმოწერა
          </button>
        </div>
      </div>

      {/* ── Page background ───────────────────────────────────────────────── */}
      <div className="bg-[#eef1f5] min-h-screen py-8 px-4 print:bg-[#eef1f5] print:py-0">
        <div className="doc-card mx-auto max-w-[680px] bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.10)] overflow-hidden">

          {/* ── Blue header ───────────────────────────────────────────────── */}
          <div className="bg-[#1A56CC] px-7 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="FINS" className="h-10 w-auto brightness-0 invert" />
              <div>
                <p className="text-white text-[13px] font-light opacity-80 leading-none mt-0.5">
                  შპს ფინს პროგრამ სერვისი
                </p>
              </div>
            </div>
            <span className="px-4 py-2 rounded-full border-2 border-white/40 text-white text-[12px] font-semibold tracking-wide">
              საბანკო რეკვიზიტები
            </span>
          </div>

          {/* ── Body ──────────────────────────────────────────────────────── */}
          <div className="px-7 pt-7 pb-8 space-y-7">

            {/* Section: Payer info */}
            <div>
              <h2 className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#1A56CC] mb-4">
                გადამხდელის ინფორმაცია
              </h2>

              <div className="rounded-xl border border-gray-200 overflow-hidden">
                {[
                  { label: 'მიმღები',               value: FINS.name,    bold: true },
                  { label: 'საიდენტიფიკაციო კოდი',  value: FINS.idCode,  bold: true },
                  { label: 'ბანკი',                  value: FINS.bank,    bold: true },
                  { label: 'IBAN',                   value: FINS.iban,    bold: true, mono: true },
                  { label: 'დანიშნულება',             value: FINS.purpose, bold: true },
                ].map((row, i, arr) => (
                  <div
                    key={row.label}
                    className={`flex items-start gap-4 px-5 py-3.5 ${i < arr.length - 1 ? 'border-b border-gray-100' : ''}`}
                  >
                    <span className="text-[12.5px] text-gray-400 font-medium w-[160px] shrink-0 leading-snug pt-px">
                      {row.label}
                    </span>
                    <span className={`text-[13px] leading-snug ${row.bold ? 'font-bold text-gray-800' : 'text-gray-700'} ${row.mono ? 'font-mono' : ''}`}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section: Amount */}
            <div>
              <h2 className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#1A56CC] mb-4">
                გადასახდელი თანხა
              </h2>

              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex items-center gap-4 px-5 py-4">
                  <div className="shrink-0">
                    <p className="text-[12px] text-gray-400 font-medium leading-none">ტარიფი (თვე)</p>
                    <p className="text-[11px] text-gray-400 mt-1">{isEnt ? '15+' : objects} ობიექტი{objects > 1 ? '' : 'ი'}</p>
                  </div>
                  <div className="ml-auto">
                    {isEnt ? (
                      <span className="text-[22px] font-bold text-[#1A56CC]">ინდივიდუალური</span>
                    ) : (
                      <span className="text-[32px] font-extrabold text-[#1A56CC] tabular-nums leading-none">
                        {monthly}.00 ₾
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {discount > 0 && !isEnt && (
                <p className="mt-2 text-[11.5px] text-gray-400 text-right">
                  მოქმედი ფასდაკლება: <span className="text-emerald-600 font-semibold">−{discount}%</span>
                  {' '}· ფასები დღგ-ს გარეშე
                </p>
              )}
            </div>

            {/* Yellow notice */}
            {objects === 1 && (
              <div className="flex gap-3 rounded-xl bg-amber-50 border border-amber-200 px-5 py-4">
                <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[12.5px] text-amber-800 leading-relaxed">
                  1 აქტიური ობიექტის არსებობის შემთხვევაში რეკომენდირებულია მითითებული ტარიფის გადახდა ან მეტის
                </p>
              </div>
            )}

            {/* Red important notice */}
            <div className="flex gap-3 rounded-xl bg-red-50 border-l-4 border-red-500 px-5 py-4">
              <AlertOctagon size={16} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[12px] font-bold text-red-600 uppercase tracking-wide mb-1.5">
                  ⚠ მნიშვნელოვანი
                </p>
                <p className="text-[12.5px] text-red-700 font-semibold leading-relaxed">
                  თუ გადახდა ხორციელდება მესამე პირის (ჩვენს სისტემაში რეგისტრირებული სხვა ორგანიზაციის) ნაცვლად,
                  აუცილებელია შესაბამისი ორგანიზაციის დასახელებისა და საიდენტიფიკაციო კოდის მითითება.
                </p>
              </div>
            </div>

          </div>

          {/* ── Footer ──────────────────────────────────────────────────────── */}
          <div className="border-t border-gray-100 px-7 py-4 flex items-center justify-between">
            <span className="text-[11.5px] text-gray-400">* ფასები მოცემულია დღგ-ს გარეშე</span>
            <span className="text-[12px] font-bold text-gray-700">{FINS.website}</span>
          </div>

        </div>
      </div>
    </>
  )
}
