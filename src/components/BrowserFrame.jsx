import { useEffect, useRef, useState } from 'react'
import { Lock } from 'lucide-react'

/**
 * BrowserFrame — macOS-style browser chrome (traffic lights + URL pill)
 * wrapping arbitrary demo content.
 */
export function BrowserFrame({ url = 'https://fins.ge/', children }) {
  return (
    <div className="rounded-[18px] bg-white border border-[#3E4259]/[0.10] shadow-[0_30px_90px_rgba(40,55,120,0.16),0_8px_28px_rgba(40,55,120,0.08)] overflow-hidden">
      {/* Chrome bar */}
      <div className="relative flex items-center h-[44px] px-4 bg-[#EFF0F3] border-b border-[#3E4259]/[0.06]">
        <div className="flex items-center gap-[7px] shrink-0">
          <span className="h-[11px] w-[11px] rounded-full bg-[#FF5F57]" />
          <span className="h-[11px] w-[11px] rounded-full bg-[#FEBC2E]" />
          <span className="h-[11px] w-[11px] rounded-full bg-[#28C840]" />
        </div>
        {/* URL pill */}
        <div className="absolute left-1/2 -translate-x-1/2 w-[62%] max-w-[560px]">
          <div className="flex items-center justify-center gap-1.5 h-[28px] rounded-full bg-white text-[#3E4259]/65">
            <Lock size={10} className="shrink-0 text-[#3E4259]/40" />
            <span className="text-[12px] font-medium leading-none tracking-normal select-none">
              {url}
            </span>
          </div>
        </div>
      </div>
      {children}
    </div>
  )
}

/**
 * DemoScaler — renders children at a fixed "natural" pixel size and scales
 * them proportionally to fit the parent width. Keeps complex pixel layouts
 * (like the dashboard replica) crisp at every viewport size. `maxScale`
 * lets a host render the demo larger than its natural size (default 1 —
 * shrink only).
 */
export function DemoScaler({ naturalWidth = 920, naturalHeight = 604, maxScale = 1, children }) {
  const hostRef = useRef(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const el = hostRef.current
    if (!el) return
    const measure = () => {
      const w = el.clientWidth
      if (w > 0) setScale(Math.min(maxScale, w / naturalWidth))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [naturalWidth, maxScale])

  return (
    <div ref={hostRef} className="relative w-full" style={{ height: naturalHeight * scale }}>
      <div
        className="absolute top-0 left-1/2"
        style={{
          width: naturalWidth,
          transform: `translateX(-50%) scale(${scale})`,
          transformOrigin: 'top center',
        }}
      >
        {children}
      </div>
    </div>
  )
}
