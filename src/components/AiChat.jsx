// src/components/AiChat.jsx
// ─────────────────────────────────────────────────────────────────────────────
// FINS AI — iMessage-style floating bubbles, no panel background
//
//  • Bubbles float in open screen space — no container chrome
//  • AI  : dark navy bubble, tail bottom-left,  white text
//  • User: brand-blue bubble, tail bottom-right, white text
//  • Gradient mask fades old messages as they drift upward
//  • Input pill button: Trash (clear) when empty → Send (arrow) when typing
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, Trash2, X, Sparkles, Ban, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';

// ── colours ───────────────────────────────────────────────────────────────────
const AI_BG   = '#1D2748';                           // AI bubble
const USR_BG  = 'linear-gradient(145deg,#4F6BE5,#3851D1)'; // user bubble

// ── ban helpers ───────────────────────────────────────────────────────────────
const BAN_KEY = 'fins_chat_ban';
function getBanData() {
  try { const r = localStorage.getItem(BAN_KEY); if (r) return { ip:'', warnings:0, bannedUntil:0, ...JSON.parse(r) }; } catch {}
  return { ip:'', warnings:0, bannedUntil:0 };
}
function saveBanData(d) { localStorage.setItem(BAN_KEY, JSON.stringify(d)); }

// ── text helpers ──────────────────────────────────────────────────────────────
function stripSignals(t) {
  return t.replace(/\[\[ADMIN_(NOTIFY|ALERT):[\s\S]*$/, '').replace(/\s*\[\[MOD:(warn|ban)\]\]/g, '').trim();
}
function getLastImage(msgs) {
  for (let i = msgs.length - 1; i >= 0; i--)
    if (msgs[i].role === 'user' && msgs[i].image) return msgs[i].image;
}
// ── Section resolution ────────────────────────────────────────────────────────
// On-home scroll sections (each id exists as id="..." on a component).
const SECTION_IDS = ['hero', 'services', 'about', 'accounting', 'faq', 'pricing'];
// Aliases — maps anything the AI might write (incl. hallucinations) → real id.
const SECTION_ALIASES = {
  prices: 'pricing', price: 'pricing', pricing: 'pricing', tariff: 'pricing', tariffs: 'pricing',
  home: 'hero', main: 'hero', start: 'hero',
  service: 'services', services: 'services',
  about: 'about', team: 'about',
  accounting: 'accounting', bookkeeping: 'accounting',
  faq: 'faq', questions: 'faq',
};
// Real standalone pages (router routes that actually exist).
const REAL_PAGES = ['/offer', '/contact', '/privacy', '/terms', '/security'];

// Returns a section id if the URL points at an on-home section, else null.
function resolveSection(url) {
  if (/^https?:\/\//i.test(url)) return null;          // external
  if (REAL_PAGES.includes(url.replace(/\/$/, '')))      // exact real page
    return null;
  // strip a leading "/" and/or "#", lowercase, drop any trailing slash/query
  const token = url.replace(/^\/?#?\/?/, '').replace(/[/?#].*$/, '').toLowerCase();
  if (!token) return null;
  if (SECTION_IDS.includes(token)) return token;
  return SECTION_ALIASES[token] ?? null;
}

// Smoothly scroll the page to a section, offsetting for the sticky navbar.
// Returns true if the element existed and we scrolled.
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return false;
  const navH = document.querySelector('header')?.offsetHeight ?? 72;
  const y = el.getBoundingClientRect().top + window.scrollY - navH + 1;
  window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
  return true;
}

// ── SectionLink — scrolls to an on-home section, no page reload ───────────────
function SectionLink({ section, children, onNavigate }) {
  const navigate     = useNavigate();
  const { pathname } = useLocation();
  const cls = 'underline underline-offset-2 opacity-85 hover:opacity-100 transition-opacity cursor-pointer';

  function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();   // stop click reaching elements that appear under the chat on close

    if (pathname === '/') {
      scrollToSection(section);
      // Close chat AFTER scroll starts — not during the click (prevents click bleed-through)
      setTimeout(() => onNavigate?.(), 300);
      return;
    }
    // Coming from another route → go home, then poll until the section mounts.
    navigate('/');
    setTimeout(() => onNavigate?.(), 100);
    let tries = 0;
    const tick = () => {
      if (scrollToSection(section)) return;
      if (++tries < 25) setTimeout(tick, 100);
    };
    setTimeout(tick, 200);
  }

  return <a href={`/#${section}`} onClick={handleClick} className={cls}>{children}</a>;
}

// ── parse Markdown links inside an AI message ─────────────────────────────────
function renderText(text, onNavigate) {
  if (!text.includes('[')) return text;
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  const nodes = []; let last = 0, key = 0, m;
  const cls = 'underline underline-offset-2 opacity-85 hover:opacity-100 transition-opacity';

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const [, lbl, url] = m;
    const section = resolveSection(url);

    if (section) {
      // Any path that resolves to an on-home section (incl. /prices, /#pricing…)
      nodes.push(<SectionLink key={key++} section={section} onNavigate={onNavigate}>{lbl}</SectionLink>);
    } else if (url.startsWith('/')) {
      // Real standalone page — React Router Link (no reload)
      nodes.push(<Link key={key++} to={url} onClick={onNavigate} className={cls}>{lbl}</Link>);
    } else {
      // External URL — new tab
      nodes.push(<a key={key++} href={url} target="_blank" rel="noopener noreferrer" className={cls}>{lbl}</a>);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes.length === 0 ? text : nodes.length === 1 ? nodes[0] : <>{nodes}</>;
}

// ── iMessage tail SVGs ─────────────────────────────────────────────────────────
// Each tail is a small SVG that hangs off the bottom corner of the bubble.

const TailLeft = ({ color }) => (
  <svg width="10" height="16" viewBox="0 0 10 16" aria-hidden
    style={{ position:'absolute', bottom:0, left:'-9px', display:'block', flexShrink:0 }}>
    <path d="M10 0 C9 6 6.5 11 2 15 Q0 16.5 0 16.5 L10 16.5 Z" fill={color} />
  </svg>
);

const TailRight = ({ color }) => (
  <svg width="10" height="16" viewBox="0 0 10 16" aria-hidden
    style={{ position:'absolute', bottom:0, right:'-9px', display:'block', flexShrink:0 }}>
    <path d="M0 0 C1 6 3.5 11 8 15 Q10 16.5 10 16.5 L0 16.5 Z" fill={color} />
  </svg>
);

// ── sub-components ─────────────────────────────────────────────────────────────
function ThinkingDots() {
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', padding:'2px 0' }}>
      {[0,1,2].map(i => (
        <motion.span key={i}
          style={{ width:5, height:5, borderRadius:'50%', background:'rgba(255,255,255,0.5)', display:'inline-block' }}
          animate={{ opacity:[0.25,1,0.25], scale:[0.7,1.15,0.7] }}
          transition={{ duration:1.2, repeat:Infinity, delay:i*0.2, ease:'easeInOut' }}
        />
      ))}
    </span>
  );
}
function Cursor() {
  return (
    <motion.span
      style={{ display:'inline-block', width:'1.5px', height:'13px', marginLeft:'2px', borderRadius:'2px', verticalAlign:'text-bottom', background:'rgba(255,255,255,0.7)' }}
      animate={{ opacity:[1,0,1] }}
      transition={{ duration:0.8, repeat:Infinity, ease:'easeInOut' }}
    />
  );
}

// ── main ──────────────────────────────────────────────────────────────────────
// ── FAB shared helpers ────────────────────────────────────────────────────────

function fabStyle(isBanned, open) {
  return {
    position:'relative', flexShrink:0,
    width:48, height:48, borderRadius:'50%',
    border:'none', cursor:'pointer',
    display:'flex', alignItems:'center', justifyContent:'center',
    color:'#fff',
    background: isBanned
      ? 'linear-gradient(135deg,#ef4444,#b91c1c)'
      : open
        ? 'linear-gradient(135deg,#252f52,#1a2240)'
        : 'linear-gradient(135deg,#5074E8,#3B5BDB)',
    boxShadow: isBanned
      ? '0 4px 20px rgba(239,68,68,0.40), 0 0 0 1px rgba(255,255,255,0.08)'
      : open
        ? '0 4px 20px rgba(0,0,0,0.30), 0 0 0 1px rgba(255,255,255,0.07)'
        : '0 4px 22px rgba(59,91,219,0.45), 0 0 0 1px rgba(255,255,255,0.08)',
    transition:'background 0.2s, box-shadow 0.2s',
  };
}

// Icon inside the FAB — X when chat open, Ban when banned, Sparkles otherwise
function FabInner({ open, isBanned }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {open ? (
        <motion.span key="x" initial={{rotate:-90,opacity:0,scale:0.6}} animate={{rotate:0,opacity:1,scale:1}} exit={{rotate:90,opacity:0,scale:0.6}} transition={{duration:0.14}} style={{display:'flex'}}>
          <X size={18} />
        </motion.span>
      ) : isBanned ? (
        <motion.span key="ban" initial={{scale:0.6,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.6,opacity:0}} transition={{duration:0.14}} style={{display:'flex'}}>
          <Ban size={18} />
        </motion.span>
      ) : (
        <motion.span key="spark" initial={{rotate:90,opacity:0,scale:0.6}} animate={{rotate:0,opacity:1,scale:1}} exit={{rotate:-90,opacity:0,scale:0.6}} transition={{duration:0.14}} style={{display:'flex'}}>
          <Sparkles size={18} />
        </motion.span>
      )}
    </AnimatePresence>
  );
}

export default function AiChat() {
  const [open,         setOpen]         = useState(false);
  const [supportOpen,  setSupportOpen]  = useState(false);
  const [messages,     setMessages]     = useState([]);
  const [input,        setInput]        = useState('');
  const [busy,         setBusy]         = useState(false);
  const [bannedUntil,  setBannedUntil]  = useState(0);
  const [banCountdown, setBanCountdown] = useState(0);

  const inputRef    = useRef(null);
  const bottomRef   = useRef(null);
  const msgAreaRef  = useRef(null);

  // ── ban init ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const d = getBanData();
    if (d.bannedUntil > 0 && d.bannedUntil <= Date.now()) saveBanData({ ...d, warnings:0, bannedUntil:0 });
    else setBannedUntil(d.bannedUntil ?? 0);
    fetch('/api/get-ip').then(r=>r.json()).then(({ip})=>saveBanData({...getBanData(),ip})).catch(()=>{});
  }, []);

  useEffect(() => {
    if (!bannedUntil || bannedUntil <= Date.now()) { setBanCountdown(0); return; }
    const rem = () => Math.max(0, Math.ceil((bannedUntil - Date.now()) / 1000));
    setBanCountdown(rem());
    const id = setInterval(() => {
      const r = rem(); setBanCountdown(r);
      if (r === 0) { setBannedUntil(0); saveBanData({...getBanData(),warnings:0,bannedUntil:0}); clearInterval(id); }
    }, 1000);
    return () => clearInterval(id);
  }, [bannedUntil]);

  const isBanned = banCountdown > 0;

  // ── auto-close support cluster after 5 s ────────────────────────────────
  useEffect(() => {
    if (!supportOpen) return;
    const t = setTimeout(() => setSupportOpen(false), 5000);
    return () => clearTimeout(t);
  }, [supportOpen]);

  // ── focus on open ─────────────────────────────────────────────────────────
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 120); }, [open]);

  // ── auto-scroll to newest message ────────────────────────────────────────
  useEffect(() => {
    const area = msgAreaRef.current;
    if (!area) return;
    const nearBottom = area.scrollHeight - area.scrollTop - area.clientHeight < 80;
    if (nearBottom || busy) {
      area.scrollTo({ top: area.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, busy]);

  // ── intercept wheel inside chat — prevent page scroll when scrolling chat ──
  useEffect(() => {
    const el = msgAreaRef.current;
    if (!el || !open) return;
    const onWheel = (e) => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const atTop    = scrollTop === 0;
      const atBottom = scrollTop >= scrollHeight - clientHeight - 1;
      // only stop propagation when the container actually has room to scroll
      if ((!atTop && e.deltaY < 0) || (!atBottom && e.deltaY > 0)) {
        e.preventDefault();
        e.stopPropagation();
        el.scrollTop += e.deltaY;
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [open, messages]); // re-attach when messages change (content height changes)

  // ── send ──────────────────────────────────────────────────────────────────
  async function send() {
    const text = input.trim();
    if (!text || busy || isBanned) return;
    const ban = getBanData();
    if (ban.bannedUntil > Date.now()) return;

    setInput('');
    const userMsg = { role:'user', text };
    const history = [...messages, userMsg];
    setMessages([...history.slice(-30), { role:'model', text:'', streaming:true }]);
    setBusy(true);

    const apiMessages = history.filter(m=>!m.uiOnly).slice(-12)
      .map(m => ({ role: m.role==='model'?'assistant':'user', content:m.text }));

    try {
      const res = await fetch('/api/ai-chat', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ messages:apiMessages, warningCount:ban.warnings??0, language:'ka' }),
      });
      if (!res.ok || !res.body) throw new Error(res.status.toString());

      const reader = res.body.getReader(); const dec = new TextDecoder(); let acc = '';
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        acc += dec.decode(value, { stream:true });
        setMessages(prev => { const n=[...prev]; n[n.length-1]={ role:'model', text:stripSignals(acc), streaming:true }; return n; });
      }

      const modMatch   = acc.match(/\[\[MOD:(warn|ban)\]\]/);
      const adminMatch = acc.match(/\[\[ADMIN_NOTIFY:([\s\S]*?)\]\]/) ?? acc.match(/\[\[ADMIN_ALERT:([\s\S]*?)\]\]/);
      const clean      = stripSignals(acc);
      setMessages(prev => { const n=[...prev]; n[n.length-1]={ role:'model', text:clean }; return n; });

      if (modMatch) {
        const l = getBanData();
        if (modMatch[1]==='ban') { const t=Date.now()+10*60*1000; setBannedUntil(t); saveBanData({...l,warnings:3,bannedUntil:t}); }
        else saveBanData({...l,warnings:(l.warnings??0)+1});
      }
      if (adminMatch) {
        try {
          const d=JSON.parse(adminMatch[1]);
          if(d.photo===true)d.photo=getLastImage(history);else delete d.photo;
          fetch('/api/telegram-notify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)}).catch(()=>{});
        } catch {}
      }
    } catch {
      setMessages(prev => { const n=[...prev]; n[n.length-1]={ role:'model', text:'ბოდიში, შეცდომა მოხდა. სცადეთ თავიდან.', uiOnly:true }; return n; });
    } finally { setBusy(false); }
  }

  function handleKey(e) { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); send(); } }
  const hasText = !!input.trim();

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════════
          FLOATING BUBBLES — no wrapper background, just the bubbles themselves
      ═══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {open && messages.length > 0 && (
          <motion.div
            ref={msgAreaRef}
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            transition={{ duration:0.2 }}
            style={{
              position:'fixed', zIndex:9999,
              right:'24px',
              top:'80px',      // just below the navbar — container spans the whole right column
              bottom:'154px',  // just above the input bar
              width:'min(340px, calc(100vw - 48px))',
              // scrollable — wheel events intercepted by the useEffect above
              overflowY:'auto',
              overflowX:'hidden',
              scrollbarWidth:'none',
              msOverflowStyle:'none',
              display:'flex', flexDirection:'column',
              justifyContent:'flex-end',   // newest message always at the bottom
              gap:'8px',
              // fade starts at 0% (very top of container = upper screen) and
              // is fully opaque by 48% — so messages dissolve above the midpoint
              maskImage:'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 28%, black 48%)',
              WebkitMaskImage:'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 28%, black 48%)',
              pointerEvents:'auto',
            }}
          >
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                layout                                 // spring-push upward on new msg
                initial={{ opacity:0, y:20, scale:0.9 }}
                animate={{ opacity:1, y:0,  scale:1   }}
                transition={{ type:'spring', stiffness:420, damping:30, mass:0.55 }}
                style={{
                  display: 'flex',
                  justifyContent: msg.role==='user' ? 'flex-end' : 'flex-start',
                }}
              >
                {/* bubble wrapper — relative for the tail SVG */}
                <div style={{ position:'relative', maxWidth:'82%' }}>

                  {msg.role === 'model' && <TailLeft color={AI_BG} />}
                  {msg.role === 'user'  && <TailRight color="#3851D1" />}

                  <div style={{
                    background:    msg.role==='user' ? USR_BG : AI_BG,
                    borderRadius:  msg.role==='user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    padding:       '10px 14px',
                    color:         '#ffffff',
                    fontSize:      '15px',
                    lineHeight:    '1.55',
                    letterSpacing: '0.01em',
                    position:      'relative', // above tail z-index
                    // clean, minimal shadow — depth without glow artifacts
                    boxShadow: msg.role==='user'
                      ? '0 4px 16px rgba(59,81,209,0.35), 0 1px 3px rgba(0,0,0,0.20)'
                      : '0 4px 16px rgba(0,0,0,0.28),    0 1px 3px rgba(0,0,0,0.18)',
                  }}>
                    {msg.streaming && !msg.text
                      ? <ThinkingDots />
                      : <>{renderText(msg.text, () => setOpen(false))}{msg.streaming && <Cursor />}</>
                    }
                  </div>

                </div>
              </motion.div>
            ))}
            <div ref={bottomRef} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════════
          BOTTOM CONTROLS  — input pill stacked above FAB, right-anchored
      ═══════════════════════════════════════════════════════════════════ */}
      <div style={{
        position:'fixed', zIndex:10000,
        right:'24px',
        bottom:'max(24px, env(safe-area-inset-bottom))',
      }}>
        {/* flex-col: input bar stacked above the horizontal button row */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'10px' }}>
        {/* horizontal row: support buttons + AI FAB + toggle — all share layout animation */}
        {/* this inner div is the actual horizontal cluster */}

          {/* ── Input pill ── */}
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity:0, y:18, scale:0.88 }}
                animate={{ opacity:1, y:0,  scale:1    }}
                exit={{    opacity:0, y:10, scale:0.93  }}
                transition={{ type:'spring', stiffness:460, damping:30, mass:0.5 }}
              >
                {isBanned ? (
                  /* ban pill */
                  <div style={{
                    display:'flex', alignItems:'center', gap:8,
                    background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.22)',
                    borderRadius:999, padding:'9px 18px',
                    color:'rgba(239,68,68,0.85)', fontSize:13, fontFamily:'monospace',
                    backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)',
                  }}>
                    <Ban size={13}/>
                    <span>{String(Math.floor(banCountdown/60)).padStart(2,'0')}:{String(banCountdown%60).padStart(2,'0')}</span>
                  </div>
                ) : (
                  /* normal input pill */
                  <div style={{
                    display:'flex', alignItems:'center', gap:6,
                    background:'#ffffff',
                    borderRadius:999,
                    padding:'7px 7px 7px 16px',
                    width:'min(288px, calc(100vw - 82px))',
                    boxShadow:'0 8px 32px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.10)',
                  }}>
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={handleKey}
                      disabled={busy}
                      placeholder="შეტყობინება..."
                      style={{
                        flex:1, minWidth:0, border:'none', outline:'none',
                        background:'transparent', fontSize:14,
                        color:'#111827', fontFamily:'inherit',
                      }}
                    />

                    {/* Button morphs: Trash (empty) → ArrowUp (has text) */}
                    <AnimatePresence mode="wait" initial={false}>
                      {hasText ? (
                        <motion.button
                          key="send"
                          onClick={send}
                          disabled={busy}
                          initial={{ scale:0.6, opacity:0, rotate:-20 }}
                          animate={{ scale:1,   opacity:1, rotate:0   }}
                          exit={{    scale:0.6, opacity:0, rotate: 20 }}
                          transition={{ type:'spring', stiffness:500, damping:28 }}
                          whileHover={{ scale:1.1 }}
                          whileTap={{ scale:0.87 }}
                          style={{
                            flexShrink:0, width:32, height:32, borderRadius:'50%',
                            border:'none', cursor:'pointer', display:'flex',
                            alignItems:'center', justifyContent:'center',
                            background:'linear-gradient(145deg,#4F6BE5,#3851D1)',
                            color:'#fff',
                            boxShadow:'0 3px 10px rgba(59,81,209,0.50)',
                          }}
                        >
                          <ArrowUp size={15} strokeWidth={2.5} />
                        </motion.button>
                      ) : (
                        <motion.button
                          key="clear"
                          onClick={() => setMessages([])}
                          disabled={messages.length === 0}
                          initial={{ scale:0.6, opacity:0, rotate: 20 }}
                          animate={{ scale:1,   opacity:1, rotate:0   }}
                          exit={{    scale:0.6, opacity:0, rotate:-20 }}
                          transition={{ type:'spring', stiffness:500, damping:28 }}
                          whileHover={messages.length > 0 ? { scale:1.1 } : undefined}
                          whileTap={messages.length  > 0 ? { scale:0.87 } : undefined}
                          style={{
                            flexShrink:0, width:32, height:32, borderRadius:'50%',
                            border:'none', cursor: messages.length > 0 ? 'pointer' : 'default',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            background: messages.length > 0 ? 'rgba(0,0,0,0.07)' : 'rgba(0,0,0,0.04)',
                            color: messages.length > 0 ? 'rgba(0,0,0,0.38)' : 'rgba(0,0,0,0.18)',
                            transition:'background 0.15s, color 0.15s',
                          }}
                        >
                          <Trash2 size={14} />
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Horizontal row: support buttons grow to the left, AI FAB slides with them */}
          <motion.div
            layout
            transition={{ type:'spring', stiffness:220, damping:34, mass:1.1 }}
            style={{ display:'flex', alignItems:'center', gap:10 }}
          >

          {/*
           * ── AI FAB ──────────────────────────────────────────────────────
           * Two keyed variants inside AnimatePresence(popLayout):
           *   "in-cluster"  → renders while support is open; plays a compress+
           *                   disappear exit when support closes
           *   "at-home"     → renders at the home position; pops in with a
           *                   spring bounce after the exit completes
           * popLayout removes the exiting element from flow instantly so the
           * entering one snaps straight to its home position before animating.
           */}
          <AnimatePresence mode="popLayout">
            {supportOpen ? (
              <motion.button
                key="in-cluster"
                exit={{
                  scaleX: [1, 1.35, 0],
                  scaleY: [1, 0.55, 0],
                  opacity: [1, 1,   0],
                  transition: { duration:0.30, times:[0, 0.38, 1], ease:'easeIn' },
                }}
                onClick={() => { setOpen(o => !o); if (supportOpen) setSupportOpen(false); }}
                whileHover={{ scale:1.07 }}
                whileTap={{ scale:0.90 }}
                aria-label="AI ასისტენტი"
                style={fabStyle(isBanned, open)}
              >
                <FabInner open={open} isBanned={isBanned} />
              </motion.button>
            ) : (
              <motion.button
                key="at-home"
                initial={{ scale:0, opacity:0 }}
                animate={{ scale:1, opacity:1 }}
                transition={{ type:'spring', stiffness:420, damping:18, mass:0.65 }}
                onClick={() => { setOpen(o => !o); }}
                whileHover={{ scale:1.07 }}
                whileTap={{ scale:0.90 }}
                aria-label="AI ასისტენტი"
                style={fabStyle(isBanned, open)}
              >
                {!open && !isBanned && (
                  <motion.span
                    style={{ position:'absolute', inset:0, borderRadius:'50%', background:'rgba(79,107,229,0.28)', pointerEvents:'none' }}
                    animate={{ scale:[1,1.42,1], opacity:[0.55,0,0.55] }}
                    transition={{ duration:3.8, repeat:Infinity, ease:'easeInOut' }}
                  />
                )}
                <FabInner open={open} isBanned={isBanned} />
              </motion.button>
            )}
          </AnimatePresence>

          {/* ── Support cluster — AnyDesk, Facebook, WhatsApp ── */}
          <AnimatePresence>
            {supportOpen && (
              <>
                {[
                  {
                    key: 'anydesk',
                    label: 'AnyDesk',
                    delay: 0.08,
                    bg: '#E8613C',
                    shadow: 'rgba(232,97,60,0.45)',
                    action: () => window.open('https://anydesk.com/en/downloads/windows', '_blank'),
                    icon: (
                      // AnyDesk stacked-layers icon
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                      </svg>
                    ),
                  },
                  {
                    key: 'facebook',
                    label: 'Facebook',
                    delay: 0.04,
                    bg: '#1877F2',
                    shadow: 'rgba(24,119,242,0.45)',
                    action: () => window.open('https://www.facebook.com/fins.ge', '_blank'),
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    ),
                  },
                  {
                    key: 'whatsapp',
                    label: 'WhatsApp',
                    delay: 0,
                    bg: '#25D366',
                    shadow: 'rgba(37,211,102,0.45)',
                    action: () => window.open('https://wa.me/995500114090', '_blank'),
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    ),
                  },
                ].map(({ key, label, delay, bg, shadow, action, icon }) => (
                  <motion.button
                    key={key}
                    layout
                    onClick={action}
                    title={label}
                    initial={{ opacity:0, scale:0.5, x:20 }}
                    animate={{ opacity:1, scale:1,   x:0   }}
                    exit={{    opacity:0, scale:0.5, x:20  }}
                    transition={{ type:'spring', stiffness:480, damping:28, delay }}
                    whileHover={{ scale:1.12 }}
                    whileTap={{ scale:0.88 }}
                    style={{
                      position:'relative', width:44, height:44, borderRadius:'50%',
                      border:'none', cursor:'pointer',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      background: bg,
                      boxShadow: `0 4px 18px ${shadow}, 0 0 0 1px rgba(255,255,255,0.10)`,
                    }}
                  >
                    {icon}
                  </motion.button>
                ))}
              </>
            )}
          </AnimatePresence>

          {/* ── Support toggle [<] / [>] ── */}
          <motion.button
            layout
            onClick={() => setSupportOpen(o => !o)}
            whileHover={{ scale:1.08 }}
            whileTap={{ scale:0.88 }}
            aria-label="Support"
            style={{
              width:36, height:36, borderRadius:'50%',
              border:'1px solid rgba(255,255,255,0.14)',
              cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
              color:'rgba(255,255,255,0.70)',
              background: supportOpen ? 'rgba(255,255,255,0.12)' : 'rgba(10,14,26,0.60)',
              backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)',
              boxShadow:'0 2px 10px rgba(0,0,0,0.25)',
              transition:'background 0.2s',
            }}
          >
            <motion.span
              animate={{ rotate: supportOpen ? 180 : 0 }}
              transition={{ type:'spring', stiffness:400, damping:28 }}
              style={{ display:'flex' }}
            >
              <ChevronLeft size={16} strokeWidth={2.5} />
            </motion.span>
          </motion.button>

          </motion.div> {/* end horizontal cluster row */}

        </div>
      </div>
    </>
  );
}
