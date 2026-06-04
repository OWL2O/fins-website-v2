import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

// ── Typewriter text with blinking cursor ──────────────────────────────────
function TypewriterText({ text, speed = 38 }) {
  const [displayed, setDisplayed] = useState('');
  const timerRef = useRef(null);

  useEffect(() => {
    clearInterval(timerRef.current);
    if (!text) { setDisplayed(''); return; }
    setDisplayed('');
    let i = 0;
    timerRef.current = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(timerRef.current);
    }, speed);
    return () => clearInterval(timerRef.current);
  }, [text, speed]);

  const done = displayed.length >= (text?.length ?? 0);
  return (
    <span>
      {displayed}
      {!done && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.45, repeat: Infinity, repeatType: 'reverse' }}
          style={{
            display: 'inline-block', width: 1.5, height: '0.95em',
            background: 'currentColor', marginLeft: 2,
            verticalAlign: 'text-bottom', borderRadius: 1,
          }}
        />
      )}
    </span>
  );
}

// ── A single field row — slides down when data arrives ────────────────────
function FieldRow({ label, value }) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0, y: -6 }}
      animate={{ height: 'auto', opacity: 1, y: 0 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{ overflow: 'hidden' }}
    >
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.08)',
        paddingTop: 12, paddingBottom: 6, marginTop: 4,
      }}>
        <p style={{
          fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.10em', color: 'rgba(255,255,255,0.32)',
          margin: '0 0 3px',
        }}>
          {label}
        </p>
        <p style={{
          fontSize: 15, fontWeight: 600, color: '#ffffff',
          margin: 0, lineHeight: 1.45,
        }}>
          <TypewriterText text={value} />
        </p>
      </div>
    </motion.div>
  );
}

// ── Shared header ─────────────────────────────────────────────────────────
function OverlayHeader({ onClose }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <p style={{
          fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.10em', color: '#6B8AFF', margin: '0 0 5px',
        }}>
          სესიის დაჯავშნა
        </p>
        <h3 style={{ fontSize: 17, fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.3 }}>
          შეავსე ქვემოთ
        </h3>
      </div>
      <motion.button
        onClick={onClose}
        whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.14)' }}
        whileTap={{ scale: 0.9 }}
        style={{
          width: 26, height: 26, borderRadius: '50%',
          border: 'none', background: 'rgba(255,255,255,0.07)',
          cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: 'rgba(255,255,255,0.45)',
          flexShrink: 0, marginLeft: 8,
        }}
      >
        <X size={12} />
      </motion.button>
    </div>
  );
}

// ── Field list (used by both desktop and mobile) ──────────────────────────
function FieldList({ data, contactLabel }) {
  return (
    <AnimatePresence>
      {data.name      && <FieldRow key="name"    label="სახელი / კომპანია"       value={data.name} />}
      {data.contactValue && <FieldRow key="contact" label={contactLabel || 'კონტაქტი'} value={data.contactValue} />}
      {data.comment   && <FieldRow key="comment" label="კომენტარი"               value={data.comment} />}
    </AnimatePresence>
  );
}

// ── DARK CARD STYLES ──────────────────────────────────────────────────────
const CARD_STYLE = {
  background: 'rgba(12, 16, 30, 0.96)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.09)',
  boxShadow: '0 28px 64px rgba(0,0,0,0.55), 0 4px 16px rgba(0,0,0,0.30)',
};

// ── Main export ───────────────────────────────────────────────────────────
export default function BookingFormOverlay({ flow, onClose, isMobile }) {
  if (!flow) return null;
  const { data } = flow;
  const contactLabel = data.contactType === 'email' ? 'ელ-ფოსტა' : 'ტელეფონი';

  // ── MOBILE: bottom sheet (dark) ─────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ position: 'fixed', inset: 0, zIndex: 9991, background: 'rgba(0,0,0,0.50)' }}
          onClick={onClose}
        />
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          style={{
            ...CARD_STYLE,
            position: 'fixed',
            bottom: 0, left: 0, right: 0, top: 'auto',
            zIndex: 9992,
            borderRadius: '20px 20px 0 0',
            padding: '8px 20px max(24px,env(safe-area-inset-bottom))',
            maxHeight: '70vh', overflowY: 'auto',
            pointerEvents: 'auto',
          }}
        >
          {/* Drag handle */}
          <div style={{
            width: 36, height: 4, borderRadius: 2,
            background: 'rgba(255,255,255,0.12)', margin: '0 auto 18px',
          }} />
          <OverlayHeader onClose={onClose} />
          <FieldList data={data} contactLabel={contactLabel} />
        </motion.div>
      </>
    );
  }

  // ── DESKTOP: slides in from right, centers on screen ───────────────────
  return (
    <div style={{
      position: 'fixed',
      left: '50%',
      top: '88px',
      zIndex: 9992,
      pointerEvents: 'none',
    }}>
      <motion.div
        initial={{ x: 1400, opacity: 0 }}
        animate={{ x: '-50%', opacity: 1 }}
        exit={{ x: 1400, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 240, damping: 28 }}
        style={{
          ...CARD_STYLE,
          pointerEvents: 'auto',
          borderRadius: 20,
          padding: '20px 22px 20px',
          width: 'min(300px, calc(100vw - 80px))',
        }}
      >
        <OverlayHeader onClose={onClose} />
        <FieldList data={data} contactLabel={contactLabel} />
      </motion.div>
    </div>
  );
}
