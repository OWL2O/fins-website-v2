import { useState } from 'react'
import { X, ChevronRight, Download } from 'lucide-react'

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [stepsOpen, setStepsOpen] = useState(false)

  return (
    <div className="fixed bottom-8 right-8 z-[1000]">
      {/* Modal */}
      {open && (
        <div className="absolute bottom-[66px] right-0 w-[370px] rounded-2xl overflow-hidden shadow-[0_16px_60px_rgba(0,0,0,0.25)] animate-chat-in">
          {/* Header */}
          <div
            className="relative px-5 py-4 flex items-center gap-3.5"
            style={{
              background:
                'linear-gradient(135deg, #1a2a5e 0%, #2541a8 40%, #3D64FE 100%)',
            }}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.12] border border-white/[0.15]">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-medium text-white leading-tight">
                FINS Support
              </p>
              <p className="text-[12px] text-white/70 leading-tight mt-0.5 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
                ონლაინ
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-8 w-8 rounded-full flex items-center justify-center bg-white/[0.1] hover:bg-white/[0.2] transition-colors cursor-pointer"
            >
              <X size={16} className="text-white" />
            </button>
          </div>

          {/* Body */}
          <div className="bg-[#f4f5f7] px-5 py-5 flex flex-col gap-4">
            {/* Chat bubble */}
            <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3.5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
              <p className="text-[14px] text-ink-800 leading-relaxed">
                გამარჯობა! 👋 დახმარება
                <br />
                გჭირდებათ?
                <br />
                გაეცანით ვარიანტებს ქვემოთ.
              </p>
            </div>

            {/* Remote Support card */}
            <div className={`bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-shadow ${stepsOpen ? 'shadow-[0_2px_12px_rgba(0,0,0,0.08)]' : ''}`}>
              <button
                type="button"
                onClick={() => setStepsOpen(!stepsOpen)}
                className={`px-4 py-3.5 flex items-center gap-3 cursor-pointer text-left w-full ${stepsOpen ? 'border-b border-ink-800/[0.06]' : ''}`}
              >
                <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2L2 7l10 5 10-5-10-5z"
                      fill="#E53935"
                      opacity="0.9"
                    />
                    <path
                      d="M2 17l10 5 10-5M2 12l10 5 10-5"
                      stroke="#E53935"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-ink-800 leading-tight">
                    Remote Support
                  </p>
                  <p className="text-[12px] text-ink-500 leading-snug mt-0.5">
                    ჩამოტვირთეთ AnyDesk და გაუზიარეთ კოდი
                  </p>
                </div>
                <ChevronRight
                  size={16}
                  className={`text-ink-500/50 shrink-0 transition-transform duration-200 ${stepsOpen ? 'rotate-90' : ''}`}
                />
              </button>

              {/* Expandable steps */}
              <div
                className="grid transition-[grid-template-rows] duration-300 ease-in-out"
                style={{ gridTemplateRows: stepsOpen ? '1fr' : '0fr' }}
              >
                <div className="overflow-hidden">
                <div className="px-4 py-4 flex flex-col gap-3.5">
                  {/* Step 1 */}
                  <div className="flex items-center gap-3">
                    <span className="h-6 w-6 rounded-full bg-[#3D64FE] text-white text-[11px] font-medium flex items-center justify-center shrink-0">
                      1
                    </span>
                    <a
                      href="https://anydesk.com/en/downloads"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 h-[40px] rounded-xl bg-[#E8613C] hover:bg-[#d4552f] transition-colors flex items-center justify-center gap-2 text-[13px] font-medium text-white"
                    >
                      <Download size={15} />
                      ჩამოტვირთე AnyDesk
                    </a>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-3">
                    <span className="h-6 w-6 rounded-full bg-[#3D64FE] text-white text-[11px] font-medium flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <p className="text-[13px] text-ink-800 leading-snug">
                      გახსენით და მიიღეთ <span className="font-semibold">9-ნიშნა კოდი</span>
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-3">
                    <span className="h-6 w-6 rounded-full bg-[#3D64FE] text-white text-[11px] font-medium flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <p className="text-[13px] text-ink-800 leading-snug">
                      გაუგზავნეთ კოდი support-ს ქვემოთ მოცემული კონტაქტებით
                    </p>
                  </div>
                </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-[#f4f5f7] px-5 pb-5 pt-1">
            <p className="text-[12px] text-ink-500/60 text-center mb-3">
              ან დაგვიკავშირდით
            </p>
            <div className="flex gap-3">
              <a
                href="tel:+995500114090"
                className="flex-1 h-[44px] rounded-xl border border-ink-800/[0.12] bg-white flex items-center justify-center gap-2 text-[13px] font-medium text-ink-800 hover:bg-ink-800/[0.03] transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.38 2 2 0 0 1 3.58 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                დაურეკე
              </a>
              <a
                href="https://wa.me/995500114090"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 h-[44px] rounded-xl border border-emerald-600/[0.15] bg-white flex items-center justify-center gap-2 text-[13px] font-medium text-emerald-600 hover:bg-emerald-50/50 transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        type="button"
        aria-label={open ? 'Close chat' : 'Open chat'}
        onClick={() => setOpen(!open)}
        className="h-[54px] w-[54px] rounded-full border border-blue-500/[0.22] cursor-pointer select-none p-0 bg-transparent"
      >
        <img
          src="/assets/chat-icon.svg"
          alt=""
          width={54}
          height={54}
          draggable={false}
          className="block h-full w-full rounded-full"
        />
      </button>
    </div>
  )
}
