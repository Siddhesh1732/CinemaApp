import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect } from 'react'

// ── GlassPanel ─────────────────────────────────────────────────────────────
export function GlassPanel({ children, className = '', glowColor = 'cyan', ...props }) {
  const glows = {
    cyan:   'rgba(6,182,212,0.1)',
    violet: 'rgba(139,92,246,0.1)',
    amber:  'rgba(245,158,11,0.1)',
  }
  const borders = {
    cyan:   'rgba(6,182,212,0.2)',
    violet: 'rgba(139,92,246,0.2)',
    amber:  'rgba(245,158,11,0.2)',
  }

  return (
    <motion.div
      className={`rounded-2xl ${className}`}
      style={{
        background: 'rgba(11,15,26,0.6)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${borders[glowColor]}`,
        boxShadow: `0 0 40px ${glows[glowColor]}, inset 0 0 40px rgba(0,0,0,0.2)`,
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// ── BlurModal ──────────────────────────────────────────────────────────────
export function BlurModal({ isOpen, onClose, title, children, wide = false }) {
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose() }
    if (isOpen) document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            style={{ background: 'rgba(5,5,8,0.8)', backdropFilter: 'blur(10px)' }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={`relative ${wide ? 'w-full max-w-2xl' : 'w-full max-w-lg'} max-h-[90vh] overflow-y-auto rounded-2xl no-scrollbar`}
            style={{
              background: 'rgba(11,15,26,0.95)',
              border: '1px solid rgba(6,182,212,0.2)',
              boxShadow: '0 0 60px rgba(6,182,212,0.15), 0 0 120px rgba(139,92,246,0.08)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <h3 className="font-display text-sm tracking-widest text-cyan-400">{title}</h3>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <X size={16} />
              </motion.button>
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// ── Spinner / Cinematic Loader ─────────────────────────────────────────────
export function Spinner({ text = '' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-5">
      <div className="relative w-16 h-16">
        {/* Outer ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full"
          style={{ border: '2px solid transparent', borderTopColor: '#06B6D4', borderRightColor: 'rgba(6,182,212,0.3)' }}
        />
        {/* Inner ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-2 rounded-full"
          style={{ border: '2px solid transparent', borderTopColor: '#8B5CF6', borderLeftColor: 'rgba(139,92,246,0.3)' }}
        />
        {/* Center dot */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-2 h-2 rounded-full bg-cyan-400" style={{ boxShadow: '0 0 10px rgba(6,182,212,0.8)' }} />
        </motion.div>
      </div>
      {text && (
        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="font-mono text-xs text-slate-500 tracking-widest uppercase"
        >
          {text}
        </motion.p>
      )}
    </div>
  )
}

// ── GradientButton ─────────────────────────────────────────────────────────
export function GradientButton({ children, onClick, type = 'button', disabled = false, className = '', variant = 'primary' }) {
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #06B6D4, #8B5CF6)',
      shadow: '0 0 25px rgba(6,182,212,0.4)',
      hoverShadow: '0 0 40px rgba(6,182,212,0.6), 0 0 80px rgba(139,92,246,0.3)',
    },
    amber: {
      background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
      shadow: '0 0 25px rgba(245,158,11,0.3)',
      hoverShadow: '0 0 40px rgba(245,158,11,0.5)',
    },
    ghost: {
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      shadow: 'none',
      hoverShadow: '0 0 20px rgba(6,182,212,0.2)',
    }
  }
  const v = variants[variant]

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02, boxShadow: v.hoverShadow } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={`px-6 py-3 rounded-xl font-semibold text-sm text-white tracking-wide transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
      style={{ background: v.background, boxShadow: v.shadow, border: v.border }}
    >
      {children}
    </motion.button>
  )
}
