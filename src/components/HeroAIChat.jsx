import { useState, useRef, useEffect } from 'react'
import { ArrowUp, Sparkles } from 'lucide-react'

const SYSTEM = `You are an AI assistant for FINS (fins.ge), a Georgian cloud-based financial management and accounting platform. Be helpful, concise, and professional.

About FINS:
- Cloud-based accounting software for Georgian small and medium businesses
- Features: bookkeeping, RS.ge & NBG.ge integration, multi-user roles with access control, inventory management, sales tracking, payroll, financial reports, automated backups
- Pricing: starts at 2₾/object/day (volume discounts for multiple objects), free first consultation
- Working hours: Mon–Fri, 10:00–18:00
- Contact: fins.ge@gmail.com | +995 500 11 40 90 | Tbilisi, Irgvlivis 5

Rules:
- Keep replies to 2–3 short sentences maximum
- Respond in Georgian if the user writes in Georgian, in English if in English
- For pricing or onboarding questions, mention the free first consultation
- Never make up features that are not listed above`

const SUGGESTIONS = [
  'ფასები?',
  'RS.ge ინტეგრაცია',
  'უფასო კონსულტაცია',
  'What is FINS?',
]

const INITIAL = {
  role: 'assistant',
  content: 'გამარჯობა! 👋 მე ვარ FINS-ის AI ასისტენტი. როგორ დაგეხმარებით?',
}

export default function HeroAIChat() {
  const [messages, setMessages]   = useState([INITIAL])
  const [input, setInput]         = useState('')
  const [loading, setLoading]     = useState(false)
  const bottomRef                 = useRef(null)
  const inputRef                  = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text) => {
    const userText = (text ?? input).trim()
    if (!userText || loading) return
    setInput('')

    const next = [...messages, { role: 'user', content: userText }]
    setMessages(next)
    setLoading(true)

    try {
      const res  = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: SYSTEM,
          messages: next.map(m => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.content ?? 'ბოდიში, შეცდომა მოხდა. სცადეთ ხელახლა.',
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'ბოდიში, კავშირის შეცდომა. სცადეთ ხელახლა.',
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const showSuggestions = messages.length === 1 && !loading

  return (
    <div className="hidden lg:flex absolute bottom-14 xl:bottom-16 right-12 xl:right-16 min-[1700px]:right-20 z-20 w-[340px] xl:w-[365px] min-[1700px]:w-[400px] flex-col rounded-2xl overflow-hidden border border-white/[0.10] shadow-[0_12px_48px_rgba(0,0,0,0.30)]"
      style={{ background: 'rgba(10,14,26,0.55)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.07]">
        <div className="h-7 w-7 rounded-full bg-brand-600/20 border border-brand-500/25 flex items-center justify-center shrink-0">
          <Sparkles size={12} className="text-brand-300" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12.5px] font-semibold text-white leading-none tracking-normal">FINS AI</p>
          <p className="text-[10px] text-white/35 leading-none mt-0.5 tracking-normal">ყოველთვის ონლაინ</p>
        </div>
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0 dot-pulse" />
      </div>

      {/* ── Messages ── */}
      <div
        className="flex flex-col gap-2 px-4 py-3.5 overflow-y-auto"
        style={{ minHeight: 100, maxHeight: 180, scrollbarWidth: 'none' }}
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[88%] rounded-xl px-3 py-2 text-[12px] leading-relaxed tracking-normal ${
              m.role === 'user'
                ? 'bg-brand-600/75 text-white rounded-br-[4px]'
                : 'bg-white/[0.08] text-white/80 rounded-bl-[4px]'
            }`}>
              {m.content}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/[0.08] rounded-xl rounded-bl-[4px] px-3.5 py-2.5 flex items-center gap-1">
              {[0, 150, 300].map(delay => (
                <span
                  key={delay}
                  className="h-1.5 w-1.5 rounded-full bg-white/40 animate-bounce"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Quick suggestions ── */}
      {showSuggestions && (
        <div className="flex flex-wrap gap-1.5 px-4 pb-3">
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              className="px-2.5 py-1 rounded-full border border-white/[0.10] text-[11px] font-medium text-white/45 hover:text-white/80 hover:border-white/[0.22] transition-colors"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* ── Input ── */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-white/[0.07]">
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="შეკითხვა..."
          disabled={loading}
          className="flex-1 bg-transparent text-[12.5px] font-medium text-white placeholder-white/25 outline-none tracking-normal"
        />
        <button
          type="button"
          onClick={() => send()}
          disabled={!input.trim() || loading}
          className="h-7 w-7 rounded-full bg-brand-600 hover:bg-brand-500 disabled:opacity-35 disabled:cursor-not-allowed flex items-center justify-center transition-colors shrink-0"
        >
          <ArrowUp size={12} className="text-white" />
        </button>
      </div>
    </div>
  )
}
