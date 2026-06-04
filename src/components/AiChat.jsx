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
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, Trash2, X, Sparkles, Ban, Check, History } from 'lucide-react';
import BookingFormOverlay from './BookingFormOverlay.jsx';

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

// ── chat history helpers ───────────────────────────────────────────────────────
const HIST_KEY   = 'fins_chat_history';
const HIST_MAX   = 5;

function loadHistory() {
  try { const r = localStorage.getItem(HIST_KEY); return r ? JSON.parse(r) : []; } catch { return []; }
}

function saveSession(msgs) {
  const real = msgs.filter(m => !m.uiOnly && m.text?.trim() && m.role !== 'form');
  if (real.length < 2) return; // skip trivial sessions
  const firstUser = real.find(m => m.role === 'user');
  const session = {
    id: Date.now(),
    savedAt: new Date().toISOString(),
    preview: firstUser ? firstUser.text.slice(0, 72) : '—',
    messages: real,
  };
  const prev = loadHistory().filter(s => s.id !== session.id);
  localStorage.setItem(HIST_KEY, JSON.stringify([session, ...prev].slice(0, HIST_MAX)));
}

function formatHistDate(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now - d;
  const diffH  = Math.floor(diffMs / 3_600_000);
  const diffD  = Math.floor(diffMs / 86_400_000);
  if (diffH < 1)  return 'ახლახანს';
  if (diffH < 24) return `${diffH} სთ წინ`;
  if (diffD < 7)  return `${diffD} დღე წინ`;
  return d.toLocaleDateString('ka-GE', { day:'numeric', month:'short' });
}

// ── text helpers ──────────────────────────────────────────────────────────────
function stripSignals(t) {
  return t
    .replace(/\[\[ADMIN_(NOTIFY|ALERT):[\s\S]*$/, '')
    .replace(/\[\[SHOW_CONTACT_FORM:[\s\S]*$/, '')
    .replace(/\s*\[\[MOD:(warn|ban)\]\]/g, '')
    .replace(/\s*\[\[START_BOOKING_FLOW\]\]/g, '')
    .replace(/\[\[SPLIT\]\]/g, ' ')
    .replace(/\s*\[\[GENERATE_FOLLOW_UP\]\]/g, '')
    .trim();
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
      // On-home section (incl. /prices, /#pricing…) — smooth-scroll, no reload.
      nodes.push(<SectionLink key={key++} section={section} onNavigate={onNavigate}>{lbl}</SectionLink>);
    } else {
      // Real standalone page (/offer, /contact, …) OR an external URL — always
      // open in a NEW TAB so the chat (and its whole history) is never lost when
      // the user follows a link. The chat lives only on the home route, so a
      // same-tab navigation would otherwise unmount it and wipe the conversation.
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

// ── ContactFormBubble — inline contact form inside chat ───────────────────────
const INPUT_STYLE = {
  background: 'rgba(255,255,255,0.09)',
  border: '1px solid rgba(255,255,255,0.16)',
  borderRadius: 10,
  padding: '8px 12px',
  color: '#fff',
  fontSize: 13,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

function ContactFormBubble({ submitted, name, phone, email, onNameChange, onPhoneChange, onEmailChange, onSubmit, sending }) {
  function handleKey(e) { if (e.key === 'Enter') onSubmit(); }

  return (
    <motion.div
      layout
      initial={{ opacity:0, y:20, scale:0.9 }}
      animate={{ opacity:1, y:0,  scale:1   }}
      transition={{ type:'spring', stiffness:420, damping:30, mass:0.55 }}
      style={{ display:'flex', justifyContent:'flex-start' }}
    >
      <div style={{ position:'relative', maxWidth:'82%' }}>
        <TailLeft color={AI_BG} />
        <div style={{
          background:   AI_BG,
          borderRadius: '18px 18px 18px 4px',
          padding:      '14px 16px',
          color:        '#fff',
          fontSize:     14,
          boxShadow:    '0 4px 16px rgba(0,0,0,0.28), 0 1px 3px rgba(0,0,0,0.18)',
          minWidth:     210,
          position:     'relative',
        }}>
          {submitted ? (
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'2px 0' }}>
              <Check size={15} style={{ color:'#4ade80', flexShrink:0 }} />
              <span style={{ lineHeight:1.5 }}>გაგზავნილია! ჩვენი გუნდი დაგიკავშირდება.</span>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <p style={{ margin:0, fontSize:12, opacity:0.58, lineHeight:1.4 }}>
                შეავსეთ ფორმა — ჩვენი გუნდი დაგიკავშირდება
              </p>
              <input
                className="fins-chat-input"
                type="text"
                placeholder="სახელი / კომპანია"
                value={name}
                onChange={e => onNameChange(e.target.value)}
                onKeyDown={handleKey}
                style={INPUT_STYLE}
              />
              <input
                className="fins-chat-input"
                type="tel"
                placeholder="ნომერი *"
                value={phone}
                onChange={e => onPhoneChange(e.target.value)}
                onKeyDown={handleKey}
                style={INPUT_STYLE}
              />
              <input
                className="fins-chat-input"
                type="email"
                placeholder="მეილი"
                value={email}
                onChange={e => onEmailChange(e.target.value)}
                onKeyDown={handleKey}
                style={INPUT_STYLE}
              />
              <motion.button
                onClick={onSubmit}
                disabled={!phone.trim() || sending}
                whileHover={phone.trim() && !sending ? { scale:1.03 } : undefined}
                whileTap={phone.trim()   && !sending ? { scale:0.96 } : undefined}
                style={{
                  background: !phone.trim() || sending
                    ? 'rgba(79,107,229,0.35)'
                    : 'linear-gradient(145deg,#4F6BE5,#3851D1)',
                  border:       'none',
                  borderRadius: 10,
                  padding:      '9px',
                  color:        '#fff',
                  fontSize:     13,
                  cursor:       !phone.trim() || sending ? 'not-allowed' : 'pointer',
                  fontFamily:   'inherit',
                  transition:   'background 0.15s',
                }}
              >
                {sending ? '...' : 'გაგზავნა'}
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
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
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width:639px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(max-width:639px)');
    const cb = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', cb);
    return () => mq.removeEventListener('change', cb);
  }, []);

  const [open,            setOpen]            = useState(false);
  const [messages,        setMessages]        = useState([]);
  const [input,           setInput]           = useState('');
  const [busy,            setBusy]            = useState(false);
  const [bannedUntil,     setBannedUntil]     = useState(0);
  const [banCountdown,    setBanCountdown]    = useState(0);
  const [navOpen,         setNavOpen]         = useState(false);
  const [formValues,      setFormValues]      = useState({ name:'', phone:'', email:'' });
  const [formSending,     setFormSending]     = useState(false);
  const [showHistory,     setShowHistory]     = useState(false);
  const [history,         setHistory]         = useState(() => loadHistory());
  const [bookingFlow,     setBookingFlow]     = useState(null);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSubmitted,  setBookingSubmitted]  = useState(false);
  const inputRef           = useRef(null);
  const bottomRef          = useRef(null);
  const msgAreaRef         = useRef(null);
  const histMenuRef        = useRef(null);
  const startBookingFlowRef = useRef(null);
  const openRef            = useRef(false);

  // ── keep openRef in sync ──────────────────────────────────────────────────
  useEffect(() => { openRef.current = open; }, [open]);

  // ── hide widget when mobile nav is open ──────────────────────────────────
  useEffect(() => {
    const handler = (e) => setNavOpen(e.detail.open);
    window.addEventListener('navmenu', handler);
    return () => window.removeEventListener('navmenu', handler);
  }, []);

  // ── external booking flow trigger (e.g. Contact page button) ─────────────
  useEffect(() => {
    const handler = () => {
      setOpen(true);
      setTimeout(() => startBookingFlowRef.current?.(), 380);
    };
    window.addEventListener('fins-start-booking', handler);
    return () => window.removeEventListener('fins-start-booking', handler);
  }, []);

  // ── A opens · Esc closes · Delete clears chat ────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') { setOpen(false); return; }

      if (e.key === 'Delete') {
        if (!openRef.current) return;
        if (input.trim()) return;
        saveSession(messages); setHistory(loadHistory()); setMessages([]);
        return;
      }

      if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        if (!openRef.current) return;
        e.preventDefault();
        const hist = loadHistory();
        if (!hist.length) return;
        setMessages(hist[0].messages);
        setOpen(true);
        return;
      }

      if (e.key !== 'a' && e.key !== 'A' && e.key !== 'ა') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = document.activeElement?.tagName;
      const editable = document.activeElement?.isContentEditable;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || editable) return;
      setOpen(true);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, input, messages]);

  // ── close history menu on outside click ───────────────────────────────────
  useEffect(() => {
    if (!showHistory) return;
    const handler = (e) => {
      if (histMenuRef.current && !histMenuRef.current.contains(e.target)) setShowHistory(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showHistory]);

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


  // ── welcome message on first open ────────────────────────────────────────
  useEffect(() => {
    if (open && messages.length === 0) {
      setTimeout(() => {
        setMessages([{ role:'model', text:'გამარჯობა! რით შემიძლია დაგეხმარო?' }]);
      }, 320);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ── focus input whenever chat opens or becomes unbusy ────────────────────
  useEffect(() => {
    if (open && !busy && !isBanned) setTimeout(() => inputRef.current?.focus(), 280);
  }, [open, busy, isBanned]);

  // ── auto-scroll to newest message — always ───────────────────────────────
  useEffect(() => {
    const area = msgAreaRef.current;
    if (!area) return;
    area.scrollTo({ top: area.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  // ── smooth wheel scroll — RAF lerp toward accumulated target ────────────────
  useEffect(() => {
    const el = msgAreaRef.current;
    if (!el || !open) return;

    let target = el.scrollTop;
    let rafId  = null;

    const tick = () => {
      const diff = target - el.scrollTop;
      if (Math.abs(diff) < 0.5) { el.scrollTop = target; rafId = null; return; }
      el.scrollTop += diff * 0.13;
      rafId = requestAnimationFrame(tick);
    };

    const onWheel = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const max = el.scrollHeight - el.clientHeight;
      target = Math.max(0, Math.min(max, target + e.deltaY));
      if (!rafId) rafId = requestAnimationFrame(tick);
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [open, messages]);

  // ── contact form submit ───────────────────────────────────────────────────
  async function handleFormSubmit(msgIdx) {
    if (formSending || !formValues.phone.trim()) return;
    setFormSending(true);
    const name    = formValues.name.trim() || '—';
    const phone   = formValues.phone.trim();
    const email   = formValues.email.trim();
    const summary = messages[msgIdx]?.summary || '';
    const msgBody = [
      `სახელი / კომპანია: ${name}`,
      `ნომერი: ${phone}`,
      email ? `მეილი: ${email}` : '',
      summary ? `\nშეჯამება:\n${summary}` : '',
    ].filter(Boolean).join('\n');

    // Web3Forms — must be called from the browser so the domain key matches
    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: '17019cc7-632a-49f7-9a00-60c011b65520',
        subject:    `FINS ჩატი — ${name} (${phone})`,
        from_name:  'FINS AI Chat',
        name,
        phone,
        email:   email || undefined,
        message: msgBody,
      }),
    }).catch(() => {});

    // Telegram — via server (has bot token)
    fetch('/api/send-contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, email: email || undefined, summary }),
    }).catch(() => {});

    setMessages(prev => prev.map((m, i) => i === msgIdx ? { ...m, submitted:true } : m));
    setFormValues({ name:'', phone:'', email:'' });
    setFormSending(false);
  }

  // ── booking flow helpers ──────────────────────────────────────────────────
  function startBookingFlow() {
    setBookingSubmitted(false);
    setBookingSubmitting(false);
    setBookingFlow(null);
    setMessages(prev => [...prev, { role:'model', text:'კარგი.' }]);
    setTimeout(() => {
      setMessages(prev => [...prev, { role:'model', text:'მოდი, ყველაფერი მოვაწყოთ.' }]);
      setBookingFlow({ step:'awaiting_name', data:{ name:'', contactType:null, contactValue:'', comment:'' } });
      setTimeout(() => {
        setMessages(prev => [...prev, { role:'model', text:'შენი სახელი ან კომპანიის სახელი?' }]);
      }, 680);
    }, 680);
  }
  startBookingFlowRef.current = startBookingFlow;

  function finishBookingFlow(finalData) {
    setBookingFlow({ step:'done', data:finalData });
    setTimeout(() => {
      setMessages(prev => [...prev,
        { role:'model', text:'ყველაფერი ჩაიწერა.' },
        { role:'send_btn', data: finalData, submitted: false },
      ]);
    }, 420);
  }

  async function submitBookingFlow(finalData) {
    setBookingSubmitting(true);
    const { name, contactType, contactValue, comment } = finalData;
    const msgBody = [
      `სახელი / კომპანია: ${name}`,
      contactType === 'email' ? `ელ-ფოსტა: ${contactValue}` : `ტელეფონი: ${contactValue}`,
      comment ? `კომენტარი: ${comment}` : '',
    ].filter(Boolean).join('\n');
    fetch('https://api.web3forms.com/submit', {
      method:'POST', headers:{'Content-Type':'application/json', Accept:'application/json'},
      body: JSON.stringify({
        access_key: '17019cc7-632a-49f7-9a00-60c011b65520',
        subject: `FINS AI ჯავშანი — ${name}`,
        from_name: 'FINS Booking Flow',
        name,
        [contactType === 'email' ? 'email' : 'phone']: contactValue,
        message: msgBody,
      }),
    }).catch(() => {});
    fetch('/api/send-contact', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        name,
        phone: contactType === 'phone' ? contactValue : undefined,
        email: contactType === 'email' ? contactValue : undefined,
        summary: comment || 'AI ჯავშნის ფლო',
      }),
    }).catch(() => {});
    setBookingSubmitting(false);
    setBookingSubmitted(true);
    // Mark inline send button as submitted (mobile)
    setMessages(prev => prev.map(m => m.role === 'send_btn' ? { ...m, submitted: true } : m));
    setTimeout(() => {
      setBookingFlow(null);
      setBookingSubmitted(false);
    }, 2000);
  }

  function extractName(text) {
    const t = text.trim();
    // Common Georgian sentence patterns → extract the actual name/company after the verb
    const patterns = [
      /(?:ჩემს?\s+კომპანიას?\s+(?:ჰქვია|ქვია|ერქვა|ეწოდება))\s+(.+)/i,
      /(?:კომპანი(?:ის|ა|ის\s+სახელია?|ა\s+ჰქვია|ა\s+ქვია))\s*[:—-]?\s*(.+)/i,
      /(?:მე?\s+)?(?:ვარ|ვიყავი|მქვია|მეწოდება|ჰქვია|ქვია)\s+(.+)/i,
      /(?:სახელი(?:\s+არის?|\s+ჰქვია)?)\s*[:—-]?\s*(.+)/i,
      /(?:ორგანიზაცია|ფირმა|სახელი)\s*[:—-]\s*(.+)/i,
    ];
    for (const re of patterns) {
      const m = t.match(re);
      if (m?.[1]?.trim()) return m[1].trim();
    }
    return t; // no pattern matched — use as-is
  }

  // ── Contact validation helpers ────────────────────────────────────────────
  function isValidPhone(val) {
    const d = val.replace(/\D/g, '');
    return d.length === 9 || d.length === 12;
  }
  function isValidEmail(val) {
    return val.includes('@');
  }

  function advanceAfterContact(text, data) {
    const newData = { ...data, contactValue: text, pendingValue: undefined };
    setBookingFlow({ step:'comment_decision', data: newData });
    setTimeout(() => {
      setMessages(prev => [...prev,
        { role:'model', text:'მშვენიერია! გინდა კომენტარი დაუმატო?' },
        { role:'choice', options:['კი, დავამატებ', 'არა, ასე გაგზავნე'], handled:false },
      ]);
    }, 420);
  }

  function askContactConfirm(text, confirmStep, data) {
    setBookingFlow({ step: confirmStep, data: { ...data, pendingValue: text } });
    setTimeout(() => {
      setMessages(prev => [...prev,
        { role:'model', text:'დარწმუნებული ხარ, რომ სწორია? თავიდან ხომ არ ცდი?' },
        { role:'choice', options:['თავიდან ცდა', 'არსებულის გამოყენება'], handled:false },
      ]);
    }, 420);
  }

  function handleBookingStep(text) {
    const { step, data } = bookingFlow;
    switch (step) {
      case 'awaiting_name': {
        const extracted = extractName(text);
        const newData = { ...data, name: extracted };
        setBookingFlow({ step:'awaiting_contact_type', data: newData });
        setTimeout(() => {
          setMessages(prev => [...prev,
            { role:'model', text:'სად გამოგიკავშირდეთ — ტელეფონით თუ ელ-ფოსტით?' },
            { role:'choice', options:['ტელეფონით', 'ელ-ფოსტით'], handled:false },
          ]);
        }, 420);
        break;
      }
      case 'awaiting_phone': {
        if (!isValidPhone(text)) { askContactConfirm(text, 'confirming_phone', data); break; }
        advanceAfterContact(text, data);
        break;
      }
      case 'awaiting_email': {
        if (!isValidEmail(text)) { askContactConfirm(text, 'confirming_email', data); break; }
        advanceAfterContact(text, data);
        break;
      }
      case 'confirming_phone': {
        // User typed a new number while confirmation is shown
        setMessages(prev => prev.map(m => m.role === 'choice' && !m.handled ? { ...m, handled:true, selected:'თავიდან ცდა' } : m));
        if (!isValidPhone(text)) { askContactConfirm(text, 'confirming_phone', data); break; }
        advanceAfterContact(text, { ...data, pendingValue: undefined });
        break;
      }
      case 'confirming_email': {
        setMessages(prev => prev.map(m => m.role === 'choice' && !m.handled ? { ...m, handled:true, selected:'თავიდან ცდა' } : m));
        if (!isValidEmail(text)) { askContactConfirm(text, 'confirming_email', data); break; }
        advanceAfterContact(text, { ...data, pendingValue: undefined });
        break;
      }
      case 'awaiting_comment': {
        finishBookingFlow({ ...data, comment: text });
        break;
      }
    }
  }

  function handleChoiceSelect(choice, msgIndex) {
    setMessages(prev => prev.map((m, i) =>
      i === msgIndex ? { ...m, handled:true, selected:choice } : m
    ));
    setMessages(prev => [...prev, { role:'user', text:choice }]);
    const { step, data } = bookingFlow;
    if (step === 'awaiting_contact_type') {
      if (choice === 'ტელეფონით') {
        setBookingFlow({ step:'awaiting_phone', data:{ ...data, contactType:'phone' } });
        setTimeout(() => setMessages(prev => [...prev, { role:'model', text:'კარგი, ნომერი?' }]), 420);
      } else {
        setBookingFlow({ step:'awaiting_email', data:{ ...data, contactType:'email' } });
        setTimeout(() => setMessages(prev => [...prev, { role:'model', text:'კარგი, ელ-ფოსტა?' }]), 420);
      }
    } else if (step === 'confirming_phone' || step === 'confirming_email') {
    const isPhone = step === 'confirming_phone';
    if (choice === 'თავიდან ცდა') {
      setBookingFlow({ step: isPhone ? 'awaiting_phone' : 'awaiting_email', data: { ...data, pendingValue: undefined } });
      setTimeout(() => setMessages(prev => [...prev, { role:'model', text: isPhone ? 'კარგი, ნომერი?' : 'კარგი, ელ-ფოსტა?' }]), 420);
    } else {
      advanceAfterContact(data.pendingValue ?? '', data);
    }
  } else if (step === 'comment_decision') {
      if (choice === 'კი, დავამატებ') {
        setBookingFlow({ step:'awaiting_comment', data });
        setTimeout(() => setMessages(prev => [...prev, { role:'model', text:'დაწერე:' }]), 420);
      } else {
        finishBookingFlow(data);
      }
    }
  }

  // ── send ──────────────────────────────────────────────────────────────────
  async function send() {
    const text = input.trim();
    if (!text || busy || isBanned) return;
    const ban = getBanData();
    if (ban.bannedUntil > Date.now()) return;

    // ── Booking flow intercept ──────────────────────────────────────────────
    if (bookingFlow && bookingFlow.step !== 'done') {
      setInput('');
      const { step, data } = bookingFlow;
      if (step === 'awaiting_contact_type') {
        const isPhone = /ტელ|phone|\d{3}|ნომ/i.test(text);
        const choice = isPhone ? 'ტელეფონით' : 'ელ-ფოსტით';
        setMessages(prev => {
          const idx = [...prev].reverse().findIndex(m => m.role === 'choice' && !m.handled);
          if (idx === -1) return [...prev, { role:'user', text }];
          const real = prev.length - 1 - idx;
          return prev.map((m, i) => i === real ? { ...m, handled:true, selected:choice } : m).concat({ role:'user', text });
        });
        if (isPhone) {
          setBookingFlow({ step:'awaiting_phone', data:{ ...data, contactType:'phone' } });
          setTimeout(() => setMessages(prev => [...prev, { role:'model', text:'კარგი, ნომერი?' }]), 420);
        } else {
          setBookingFlow({ step:'awaiting_email', data:{ ...data, contactType:'email' } });
          setTimeout(() => setMessages(prev => [...prev, { role:'model', text:'კარგი, ელ-ფოსტა?' }]), 420);
        }
        return;
      }
      if (step === 'comment_decision') {
        setMessages(prev => {
          const idx = [...prev].reverse().findIndex(m => m.role === 'choice' && !m.handled);
          const arr = [...prev];
          if (idx !== -1) arr[prev.length - 1 - idx] = { ...arr[prev.length - 1 - idx], handled:true, selected:'კი, დავამატებ' };
          return [...arr, { role:'user', text }];
        });
        finishBookingFlow({ ...data, comment: text });
        return;
      }
      setMessages(prev => [...prev, { role:'user', text }]);
      handleBookingStep(text);
      return;
    }

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

      // ── Two-bubble split ────────────────────────────────────────────────────
      if (acc.includes('[[SPLIT]]')) {
        const rawParts = acc.split('[[SPLIT]]');
        const p1 = stripSignals(rawParts[0]);
        const p2 = stripSignals(rawParts.slice(1).join(' '));
        if (p1 && p2) {
          setMessages(prev => { const n=[...prev]; n[n.length-1]={ role:'model', text:p1 }; return n; });
          setTimeout(() => setMessages(prev => [...prev, { role:'model', text:p2 }]), 720);
        } else {
          const merged = (p1 || p2).trim();
          if (!merged) setMessages(prev => prev.slice(0, -1));
          else setMessages(prev => { const n=[...prev]; n[n.length-1]={ role:'model', text:merged }; return n; });
        }
      } else if (!clean) {
        setMessages(prev => prev.slice(0, -1));
      } else {
        setMessages(prev => { const n=[...prev]; n[n.length-1]={ role:'model', text:clean }; return n; });
      }

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
      const formMatch = acc.match(/\[\[SHOW_CONTACT_FORM:([\s\S]*?)\]\]/);
      if (formMatch) {
        try {
          const d = JSON.parse(formMatch[1]);
          setMessages(prev => [...prev, { role:'form', summary: d.summary||'', submitted:false }]);
          setFormValues({ name:'', phone:'' });
        } catch {}
      }
      if (acc.includes('[[START_BOOKING_FLOW]]')) {
        startBookingFlow();
      }
    } catch {
      setMessages(prev => { const n=[...prev]; n[n.length-1]={ role:'model', text:'ბოდიში, შეცდომა მოხდა. სცადეთ თავიდან.', uiOnly:true }; return n; });
    } finally { setBusy(false); }
  }

  function handleKey(e) { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); send(); } }
  const hasText = !!input.trim();

  // ── render ────────────────────────────────────────────────────────────────
  if (navOpen) return null;

  return (
    <>
      {/* backdrop — closes chat when clicking outside (hidden when booking overlay is active) */}
      {open && !bookingFlow && (
        <div
          onClick={() => setOpen(false)}
          style={{ position:'fixed', inset:0, zIndex:9998 }}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MESSAGES — floating bubbles on desktop, full-panel on mobile
      ═══════════════════════════════════════════════════════════════════ */}

      {/* Mobile full-screen backdrop */}
      {isMobile && open && (
        <div style={{
          position:'fixed', inset:0, zIndex:9998,
          background:'rgba(10,14,26,0.97)',
        }} />
      )}

      <AnimatePresence>
        {open && messages.length > 0 && (
          <motion.div
            ref={msgAreaRef}
            onClick={() => inputRef.current?.focus()}
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            transition={{ duration:0.2 }}
            style={{
              position:'fixed', zIndex:9999,
              // Desktop: right-anchored bubble column
              // Mobile: full-screen chat panel
              right: isMobile ? '0' : '24px',
              left:  isMobile ? '0' : 'auto',
              top:   isMobile ? '0'  : '80px',
              bottom: isMobile ? '72px' : '154px',
              width: isMobile ? '100%' : 'min(340px, calc(100vw - 48px))',
              overflowY:'auto',
              overflowX:'hidden',
              scrollbarWidth:'none',
              msOverflowStyle:'none',
              display:'flex', flexDirection:'column',
              justifyContent:'flex-start',
              gap:'8px',
              padding: isMobile ? '72px 16px 8px' : '8px 0',
              WebkitOverflowScrolling:'touch',
              pointerEvents:'auto',
            }}
          >
            {/* Mobile header — pinned inside the scroll area with sticky positioning */}
            {isMobile && (
              <div style={{
                position:'sticky', top:'-72px', zIndex:2,
                display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'14px 4px 10px',
                marginTop:'-72px', marginBottom:4,
              }}>
                <span style={{ fontSize:13, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)' }}>
                  FINS AI
                </span>
                <motion.button
                  onClick={() => setOpen(false)}
                  whileTap={{ scale:0.9 }}
                  style={{
                    width:28, height:28, borderRadius:'50%',
                    border:'none', background:'rgba(255,255,255,0.09)',
                    cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                    color:'rgba(255,255,255,0.55)',
                  }}
                >
                  <X size={14} />
                </motion.button>
              </div>
            )}

            {/* spacer pushes messages to the bottom; scroll still works upward */}
            <div style={{ flex: '1 1 auto' }} />
            {messages.map((msg, i) => (
              msg.role === 'form' ? (
                <ContactFormBubble
                  key={`form-${i}`}
                  submitted={msg.submitted}
                  name={formValues.name}
                  phone={formValues.phone}
                  email={formValues.email}
                  onNameChange={v => setFormValues(p => ({ ...p, name:v }))}
                  onPhoneChange={v => setFormValues(p => ({ ...p, phone:v }))}
                  onEmailChange={v => setFormValues(p => ({ ...p, email:v }))}
                  onSubmit={() => handleFormSubmit(i)}
                  sending={formSending}
                />
              ) : msg.role === 'send_btn' ? (
                <motion.div
                  key={`sendbtn-${i}`}
                  layout
                  initial={{ opacity:0, y:16, scale:0.9 }}
                  animate={{ opacity:1, y:0,  scale:1   }}
                  transition={{ type:'spring', stiffness:420, damping:30, mass:0.55 }}
                  style={{ display:'flex', justifyContent:'flex-start', paddingLeft:4 }}
                >
                  <motion.button
                    onClick={!msg.submitted && !bookingSubmitting ? () => submitBookingFlow(msg.data) : undefined}
                    whileHover={!msg.submitted ? { scale:1.03 } : undefined}
                    whileTap={!msg.submitted ? { scale:0.95 } : undefined}
                    style={{
                      background: msg.submitted
                        ? 'rgba(34,197,94,0.15)'
                        : 'linear-gradient(145deg,#4F6BE5,#3851D1)',
                      border: msg.submitted ? '1.5px solid rgba(34,197,94,0.35)' : 'none',
                      borderRadius: 20,
                      padding: '13px 28px',
                      color: msg.submitted ? '#4ade80' : '#fff',
                      fontSize: 15, fontWeight: 700,
                      cursor: msg.submitted ? 'default' : 'pointer',
                      fontFamily: 'inherit',
                      boxShadow: msg.submitted ? 'none' : '0 4px 18px rgba(59,81,209,0.45)',
                      minWidth: 160,
                      transition: 'background 0.2s',
                    }}
                  >
                    {msg.submitted ? '✓ გაგზავნილია!' : bookingSubmitting ? '...' : 'გაგზავნა'}
                  </motion.button>
                </motion.div>
              ) : msg.role === 'choice' ? (
                <motion.div
                  key={`choice-${i}`}
                  layout
                  initial={{ opacity:0, y:16, scale:0.9 }}
                  animate={{ opacity:1, y:0,  scale:1   }}
                  transition={{ type:'spring', stiffness:420, damping:30, mass:0.55 }}
                  style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'flex-start', paddingLeft:4 }}
                >
                  {msg.options.map(opt => (
                    <motion.button
                      key={opt}
                      onClick={!msg.handled ? () => handleChoiceSelect(opt, i) : undefined}
                      whileHover={!msg.handled ? { scale:1.04 } : undefined}
                      whileTap={!msg.handled ? { scale:0.94 } : undefined}
                      style={{
                        padding:'8px 18px',
                        borderRadius:20,
                        border: msg.handled
                          ? '1.5px solid rgba(255,255,255,0.09)'
                          : '1.5px solid rgba(79,107,229,0.55)',
                        background: msg.handled
                          ? (msg.selected === opt ? 'rgba(79,107,229,0.22)' : 'transparent')
                          : 'rgba(79,107,229,0.14)',
                        color: msg.handled
                          ? (msg.selected === opt ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.22)')
                          : 'rgba(255,255,255,0.88)',
                        fontSize:13, fontWeight:600,
                        cursor: msg.handled ? 'default' : 'pointer',
                        fontFamily:'inherit',
                        backdropFilter:'blur(8px)',
                        WebkitBackdropFilter:'blur(8px)',
                        transition:'background 0.15s, color 0.15s, border-color 0.15s',
                      }}
                    >
                      {opt}
                    </motion.button>
                  ))}
                </motion.div>
              ) : (
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
              )
            ))}
            <div ref={bottomRef} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════════
          BOTTOM CONTROLS
      ═══════════════════════════════════════════════════════════════════ */}
      <div style={{
        position:'fixed', zIndex:10000,
        // Mobile + open: full-width bar at very bottom
        // Otherwise: right-anchored FAB area
        ...(isMobile && open ? {
          left: 0, right: 0, bottom: 0,
          padding: '10px 16px max(14px, env(safe-area-inset-bottom))',
          background: 'rgba(10,14,26,0.97)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', gap: 10,
        } : {
          right: '24px',
          bottom: 'max(24px, env(safe-area-inset-bottom))',
        }),
      }}>
        <div style={{
          display:'flex',
          flexDirection: isMobile && open ? 'row' : 'column',
          alignItems:'flex-end',
          gap:'10px',
          width: isMobile && open ? '100%' : 'auto',
        }}>

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
                  <div
                    onContextMenu={e => { e.preventDefault(); setShowHistory(h => !h); }}
                    style={{
                      display:'flex', alignItems:'center', gap:6,
                      background:'#ffffff',
                      borderRadius:999,
                      padding:'7px 7px 7px 16px',
                      width: isMobile && open ? 'auto' : 'min(288px, calc(100vw - 82px))',
                      flex: isMobile && open ? '1' : 'none',
                      boxShadow:'0 8px 32px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.10)',
                      position:'relative',
                    }}
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      autoComplete="off"
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
                          onClick={() => { saveSession(messages); setHistory(loadHistory()); setMessages([]); }}
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

                {/* ── History context menu ── */}
                <AnimatePresence>
                  {showHistory && (
                    <motion.div
                      ref={histMenuRef}
                      initial={{ opacity:0, y:8, scale:0.96 }}
                      animate={{ opacity:1, y:0,  scale:1   }}
                      exit={{    opacity:0, y:6,  scale:0.96 }}
                      transition={{ duration:0.15, ease:'easeOut' }}
                      style={{
                        position:'fixed',
                        bottom:'calc(max(24px, env(safe-area-inset-bottom)) + 130px)',
                        right:'24px',
                        width:'min(300px, calc(100vw - 48px))',
                        background:'#151b2e',
                        borderRadius:16,
                        border:'1px solid rgba(255,255,255,0.09)',
                        boxShadow:'0 16px 48px rgba(0,0,0,0.55)',
                        overflow:'hidden',
                        zIndex:10001,
                      }}
                    >
                      {/* header */}
                      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'12px 14px 10px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                        <History size={13} style={{ color:'rgba(255,255,255,0.35)', flexShrink:0 }} />
                        <span style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.45)', letterSpacing:'0.06em', textTransform:'uppercase' }}>
                          წინა ჩატები
                        </span>
                      </div>

                      {history.length === 0 ? (
                        <div style={{ padding:'20px 14px', fontSize:13, color:'rgba(255,255,255,0.28)', textAlign:'center' }}>
                          ჯერ არაფერია შენახული
                        </div>
                      ) : (
                        <div style={{ maxHeight:300, overflowY:'auto', padding:'4px 0' }}>
                          {history.map((s, i) => (
                            <button
                              key={s.id}
                              onClick={() => { setMessages(s.messages); setShowHistory(false); }}
                              style={{
                                width:'100%', textAlign:'left', background:'none', border:'none',
                                cursor:'pointer', padding:'10px 14px',
                                display:'flex', flexDirection:'column', gap:3,
                                borderBottom: i < history.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                              }}
                              onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'}
                              onMouseLeave={e => e.currentTarget.style.background='none'}
                            >
                              <span style={{ fontSize:11, color:'rgba(255,255,255,0.30)', fontWeight:500 }}>
                                {formatHistDate(s.savedAt)}
                              </span>
                              <span style={{ fontSize:13, color:'rgba(255,255,255,0.75)', fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                                {s.preview}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── AI FAB ── */}
          <motion.button
            initial={{ scale:0, opacity:0 }}
            animate={{ scale:1, opacity:1 }}
            whileHover={{ scale:1.07 }}
            whileTap={{ scale:0.90 }}
            onClick={() => {
              if (open) {
                if (messages.length > 0) { saveSession(messages); setHistory(loadHistory()); }
                if (bookingFlow) { setBookingFlow(null); setBookingSubmitted(false); }
              }
              setOpen(o => !o);
            }}
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

        </div>
      </div>

      {/* ── Booking form overlay — centered card, visible during guided flow ── */}
      <AnimatePresence>
        {bookingFlow && (
          <BookingFormOverlay
            flow={bookingFlow}
            onClose={() => { setBookingFlow(null); setBookingSubmitted(false); }}
            isMobile={isMobile}
            onEdit={(field, val) => setBookingFlow(prev => prev ? { ...prev, data: { ...prev.data, [field]: val } } : prev)}
          />
        )}
      </AnimatePresence>

    </>
  );
}
