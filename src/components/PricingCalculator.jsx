import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, FileText, LineChart, TrendingDown } from 'lucide-react'

const MAX = 15

function getRate(n) {
  if (n === 1) return 2.0
  if (n === 2) return 1.8
  if (n === 3) return 1.6
  if (n === 4) return 1.4
  return 1.2
}

function getDiscount(n) {
  return Math.round((1 - getRate(n) / 2.0) * 100)
}

/**
 * Split pricing card (Figma): left — object slider, right — computed price.
 */
export default function PricingCalculator() {
  const [objects, setObjects] = useState(1)
  const [animKey, setAnimKey] = useState(0)
  const isEnterprise = objects >= MAX
  const rate = getRate(objects)
  const dailyTotal = parseFloat((rate * objects).toFixed(1))
  const monthlyTotal = Math.round(dailyTotal * 30)
  const discount = getDiscount(objects)
  const pct = Math.round(((objects - 1) / (MAX - 1)) * 100)

  function handleSlider(e) {
    setObjects(Number(e.target.value))
    setAnimKey((k) => k + 1)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 text-left">

      {/* ── Left: slider ─────────────────────────────────────── */}
      <div className="p-6 sm:p-8 border-b md:border-b-0 md:border-r border-[#3E4259]/[0.08]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <p className="text-[15px] font-bold tracking-normal text-[#3E4259]">
              აქტიური ობიექტები
            </p>
            <span key={`n-${animKey}`} className="price-pop text-[15px] font-bold text-[#3D64FE] tabular-nums">
              {objects}
            </span>
          </div>
          {discount > 0 && (
            <span className="inline-flex items-center gap-1 h-[26px] px-3 rounded-full bg-emerald-50 border border-emerald-500/25 text-emerald-600 text-[11.5px] font-semibold whitespace-nowrap">
              <TrendingDown size={11} strokeWidth={2.5} />
              ფასდაკლება {discount} %
            </span>
          )}
        </div>

        <p className="mt-3 text-[12.5px] font-medium leading-relaxed text-[#3E4259]/55">
          გაითვალისწინეთ, ფასები მოცემულია დღგ-ს გარეშე
        </p>

        {/* Slider */}
        <div className="mt-7">
          <input
            type="range"
            min={1}
            max={MAX}
            value={objects}
            onChange={handleSlider}
            aria-label="აქტიური ობიექტების რაოდენობა"
            className="price-slider-light"
            style={{
              background: `linear-gradient(to right, #3D64FE ${pct}%, #E7EAF3 ${pct}%)`,
            }}
          />
          <div className="flex justify-between text-[11.5px] font-medium tracking-normal text-[#3E4259]/40 mt-2.5 px-0.5">
            <span>1</span>
            <span>5</span>
            <span>10</span>
            <span>15</span>
          </div>
        </div>

        {/* Per-object rate pill */}
        <div className="mt-7">
          <span className="inline-flex items-center h-[34px] px-4 rounded-full bg-[#3D64FE]/[0.05] border border-[#3D64FE]/35 text-[12.5px] font-semibold text-[#3D64FE] tabular-nums">
            {isEnterprise ? 'ინდივიდუალური ტარიფი' : `${rate.toFixed(1)}₾ / ობიექტზე დღეში`}
          </span>
        </div>
      </div>

      {/* ── Right: price ─────────────────────────────────────── */}
      <div className="p-6 sm:p-8 flex flex-col">
        <p className="text-[15px] font-bold tracking-normal text-[#3E4259]">
          გამოთვალეთ ფასი
        </p>

        {isEnterprise ? (
          <>
            <p key={`e-${animKey}`} className="price-pop mt-4 text-[26px] sm:text-[28px] font-extrabold tracking-normal text-[#3D64FE] leading-none">
              15+ ობიექტი
            </p>
            <p className="mt-3 text-[13px] font-medium text-[#3E4259]/60 leading-relaxed">
              ინდივიდუალური ტარიფი — დაგვიკავშირდით.
            </p>
          </>
        ) : (
          <>
            <p key={`p-${animKey}`} className="price-pop mt-4 text-[26px] sm:text-[28px] font-extrabold tracking-normal text-[#3D64FE] leading-none tabular-nums">
              დღეში - {dailyTotal.toFixed(2)}₾
            </p>
            <p className="mt-3.5 flex items-center gap-2 text-[13px] font-semibold text-emerald-600">
              <LineChart size={15} strokeWidth={2} className="shrink-0" />
              თვიური შეფასება 30 დღე
              <span key={`m-${animKey}`} className="price-pop font-extrabold tabular-nums">{monthlyTotal}₾</span>
            </p>
          </>
        )}

        <div className="mt-auto pt-7 flex flex-col gap-2.5">
          {isEnterprise ? (
            <Link
              to="/contact"
              className="group flex items-center justify-center gap-2 w-full h-[46px] rounded-full text-[14px] font-semibold tracking-normal text-white bg-[#3D64FE] hover:bg-[#3556E5] transition-colors duration-200"
            >
              დაგვიკავშირდით
              <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <>
              <a
                href="https://service.fins.ge"
                className="group flex items-center justify-center gap-2 w-full h-[46px] rounded-full text-[14px] font-semibold tracking-normal text-white bg-[#3D64FE] hover:bg-[#3556E5] hover:shadow-[0_12px_32px_rgba(61,100,254,0.30)] transition-all duration-200"
              >
                დაწყება
                <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </a>
              <a
                href={`/offer?objects=${objects}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center gap-2.5 w-full h-[46px] rounded-full text-[13.5px] font-semibold tracking-normal text-[#3D64FE] bg-[#3D64FE]/[0.09] hover:bg-[#3D64FE]/[0.15] transition-colors duration-200"
              >
                <FileText size={14} className="shrink-0" />
                ინვოისის მომზადება
              </a>
            </>
          )}
        </div>
      </div>

    </div>
  )
}
