import { useState } from 'react'
import { ArrowRight, TrendingDown, FileText } from 'lucide-react'

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
    <div className="flex flex-col gap-5 w-full">

      {/* Title row */}
      <div className="flex items-center justify-center">
        <p className="text-[15px] font-medium tracking-normal text-white">
          გამოთვალეთ ფასი
        </p>
      </div>

      {/* Object count row */}
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium tracking-normal text-white/50">
          აქტიური ობიექტები
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[26px] font-extrabold tracking-normal text-white leading-none tabular-nums">
            {isEnterprise ? '15+' : objects}
          </span>
          {discount > 0 && (
            <span className={`flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full border transition-all duration-300 ${
              discount >= 30
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25'
                : 'bg-brand-600/20 text-brand-300 border-brand-500/30'
            }`}>
              <TrendingDown size={10} strokeWidth={2.5} />
              -{discount}%
            </span>
          )}
        </div>
      </div>

      {/* Slider */}
      <div>
        <input
          type="range"
          min={1}
          max={MAX}
          value={objects}
          onChange={handleSlider}
          className="price-slider-dark"
          style={{
            background: `linear-gradient(to right, #3B5BDB ${pct}%, rgba(255,255,255,0.12) ${pct}%)`,
          }}
        />
        <div className="flex justify-between text-[11px] font-medium tracking-normal text-white/30 mt-2">
          <span>1</span>
          <span>8</span>
          <span>15+</span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/10" />

      {/* Price display */}
      {isEnterprise ? (
        <div className="text-center py-3">
          <p className="text-[18px] font-extrabold tracking-normal text-white mb-1.5">
            15+ ობიექტი
          </p>
          <p className="text-[13px] font-medium tracking-normal text-white/45 leading-relaxed">
            ინდივიდუალური ტარიფი — დაგვიკავშირდით.
          </p>
        </div>
      ) : (
        <div className="text-center">
          {/* Daily total */}
          <div key={`p-${animKey}`}>
            <div className="flex items-baseline justify-center gap-1.5">
              <span className="text-[48px] font-extrabold tracking-normal text-white tabular-nums leading-none">
                {dailyTotal.toFixed(1)}
              </span>
              <span className="text-[22px] font-medium text-white/40 mb-1">₾</span>
            </div>
            <p className="text-[12px] font-medium tracking-normal text-white/40 mt-1">
              დღეში სულ
            </p>
          </div>

          {/* Per-object rate pill */}
          <div className="inline-flex items-center gap-1.5 bg-brand-600/15 border border-brand-500/25 rounded-full px-3 py-1 mt-3">
            <span className="text-brand-300 font-extrabold tabular-nums text-[13px]">
              {rate.toFixed(1)}₾
            </span>
            <span className="text-brand-400/70 font-medium text-[12px]">
              / ობიექტზე / დღეში
            </span>
          </div>

          {/* Monthly estimate */}
          <div className="mt-4 py-3 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
            <p className="text-[11px] font-medium tracking-normal text-white/35 mb-1">
              თვის შეფასება (~30 დღე)
            </p>
            <p className="text-[22px] font-extrabold tracking-normal text-white tabular-nums">
              ≈ {monthlyTotal}₾
            </p>
          </div>
        </div>
      )}

      {/* CTA buttons */}
      <div className="flex flex-col gap-2">
        <a
          href="https://service.fins.ge"
          className="group flex items-center justify-center gap-2 w-full h-[44px] rounded-full text-[14px] font-extrabold tracking-normal text-white bg-[#3D64FE] border border-white/[0.18] transition-colors duration-200 hover:bg-brand-500"
        >
          {isEnterprise ? 'დაგვიკავშირდით' : 'დაწყება'}
          <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
        </a>

        {!isEnterprise && (
          <a
            href={`/offer?objects=${objects}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center gap-2.5 w-full h-[44px] rounded-full text-[13px] font-bold tracking-normal text-white bg-white/[0.08] border border-white/[0.28] hover:bg-white/[0.14] hover:border-white/[0.45] transition-all duration-200"
          >
            <FileText size={14} className="text-white/70 group-hover:text-white transition-colors duration-200" />
            რეკვიზიტის მომზადება
          </a>
        )}
      </div>

      {/* VAT note */}
      <p className="text-center text-[11px] font-medium tracking-normal text-white/30">
        * ფასები მოცემულია დღგ-ს გარეშე
      </p>

    </div>
  )
}
