import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';

function OverlayField({ label, value, active, optional, onChange }) {
  return (
    <motion.div
      animate={{
        borderColor: active
          ? 'rgba(79,107,229,0.65)'
          : value
            ? 'rgba(34,197,94,0.45)'
            : 'rgba(0,0,0,0.09)',
        backgroundColor: active ? 'rgba(79,107,229,0.04)' : value ? 'rgba(34,197,94,0.02)' : '#fafafa',
        boxShadow: active
          ? '0 0 0 3px rgba(79,107,229,0.10)'
          : '0 0 0 0px rgba(0,0,0,0)',
      }}
      transition={{ duration: 0.22 }}
      style={{ borderRadius: 12, border: '1.5px solid rgba(0,0,0,0.09)', padding: '10px 14px', minHeight: 52 }}
    >
      <p style={{
        fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
        color: active ? '#4F6BE5' : value ? '#16a34a' : 'rgba(0,0,0,0.35)',
        margin: '0 0 3px', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: 5,
      }}>
        {label}
        {optional && <span style={{ color:'rgba(0,0,0,0.22)', fontWeight:400, textTransform:'none', letterSpacing:0 }}>• სურვილისამებრ</span>}
      </p>
      <input
        type="text"
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={active ? 'ელოდება...' : '—'}
        style={{
          width: '100%', border: 'none', outline: 'none', background: 'transparent',
          fontSize: 14, fontWeight: value ? 600 : 400,
          color: value ? '#0f172a' : active ? 'rgba(79,107,229,0.45)' : 'rgba(0,0,0,0.22)',
          fontFamily: 'inherit', padding: 0, lineHeight: 1.4,
        }}
      />
    </motion.div>
  );
}

export default function BookingFormOverlay({ flow, onClose, onSubmit, submitting, submitted, isMobile, onEdit }) {
  if (!flow) return null;

  const { data, step } = flow;
  const contactLabel = data.contactType === 'email' ? 'ელ-ფოსტა' : 'ტელეფონი';
  const isActiveContact = step === 'awaiting_phone' || step === 'awaiting_email';
  const canSubmit = !!(data.name && data.contactValue) && step === 'done' && !submitted && !submitting;

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ position:'fixed', inset:0, zIndex:9991, background:'rgba(0,0,0,0.45)' }}
          onClick={onClose}
        />
      )}
    <motion.div
      key="booking-overlay"
      initial={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.84, y: 32 }}
      animate={isMobile ? { y: 0 }      : { opacity: 1, scale: 1, y: 0 }}
      exit={isMobile   ? { y: '100%' }  : { opacity: 0, scale: 0.90, y: 16 }}
      transition={isMobile
        ? { type: 'spring', stiffness: 320, damping: 32 }
        : { type: 'spring', stiffness: 360, damping: 28, mass: 0.7 }}
      style={isMobile ? {
        position: 'fixed',
        bottom: 0, left: 0, right: 0, top: 'auto',
        zIndex: 9992,
        background: '#ffffff',
        borderRadius: '20px 20px 0 0',
        padding: '8px 20px max(24px,env(safe-area-inset-bottom))',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.25)',
        maxHeight: '82vh', overflowY: 'auto',
        pointerEvents: 'auto',
      } : {
        position: 'fixed',
        left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9992,
        width: 'min(400px, calc(100vw - 48px))',
        background: '#ffffff',
        borderRadius: 24,
        padding: '26px 24px 22px',
        boxShadow: '0 40px 100px rgba(0,0,0,0.22), 0 8px 32px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.04)',
        pointerEvents: 'auto',
      }}
    >
      {/* Drag handle on mobile */}
      {isMobile && (
        <div style={{ width:36, height:4, borderRadius:2, background:'rgba(0,0,0,0.15)', margin:'0 auto 18px' }} />
      )}
      {/* Close */}
      <motion.button
        onClick={onClose}
        whileHover={{ scale: 1.1, background: 'rgba(0,0,0,0.12)' }}
        whileTap={{ scale: 0.92 }}
        style={{
          position: 'absolute', top: 14, right: 14,
          width: 26, height: 26, borderRadius: '50%',
          border: 'none', background: 'rgba(0,0,0,0.07)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(0,0,0,0.38)',
        }}
      >
        <X size={13} />
      </motion.button>

      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <p style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.10em',
          textTransform: 'uppercase', color: '#4F6BE5', margin: '0 0 5px',
        }}>
          სესიის დაჯავშნა
        </p>
        <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.3 }}>
          შეავსე ქვემოთ
        </h3>
      </div>

      {/* Fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <OverlayField
          label="სახელი / კომპანია"
          value={data.name}
          active={step === 'awaiting_name'}
          onChange={v => onEdit?.('name', v)}
        />
        <OverlayField
          label={contactLabel || 'ტელეფონი / ელ-ფოსტა'}
          value={data.contactValue}
          active={isActiveContact}
          onChange={v => onEdit?.('contactValue', v)}
        />
        <OverlayField
          label="კომენტარი"
          value={data.comment}
          active={step === 'awaiting_comment'}
          optional
          onChange={v => onEdit?.('comment', v)}
        />
      </div>

      {/* Submit */}
      <div style={{ marginTop: 16 }}>
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '12px 16px', borderRadius: 14,
                background: 'rgba(34,197,94,0.09)',
                border: '1.5px solid rgba(34,197,94,0.28)',
              }}
            >
              <Check size={14} style={{ color: '#16a34a', flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#16a34a', lineHeight: 1.4 }}>
                გაგზავნილია! გუნდი მალე დაგიკავშირდება.
              </span>
            </motion.div>
          ) : (
            <motion.button
              key="submit"
              onClick={canSubmit ? onSubmit : undefined}
              whileHover={canSubmit ? { scale: 1.02 } : undefined}
              whileTap={canSubmit ? { scale: 0.97 } : undefined}
              style={{
                width: '100%', padding: '13px',
                borderRadius: 14, border: 'none',
                background: canSubmit
                  ? 'linear-gradient(145deg,#4F6BE5,#3851D1)'
                  : 'rgba(79,107,229,0.16)',
                color: canSubmit ? '#fff' : 'rgba(79,107,229,0.45)',
                fontSize: 14, fontWeight: 700,
                cursor: canSubmit ? 'pointer' : 'default',
                fontFamily: 'inherit',
                transition: 'background 0.15s, color 0.15s',
                letterSpacing: '0.01em',
              }}
            >
              {submitting ? '...' : 'გაგზავნა'}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
    </>
  );
}
