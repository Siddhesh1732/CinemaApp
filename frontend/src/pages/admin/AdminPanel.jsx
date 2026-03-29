import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Film, Tag, Users, ChevronRight, Shield, Activity } from 'lucide-react'

const PANELS = [
  {
    to:    '/admin/movies',
    Icon:  Film,
    label: 'MOVIES',
    desc:  'Create, update and delete movies in the database',
    color: '#06B6D4',
    glow:  'rgba(6,182,212,0.15)',
    border:'rgba(6,182,212,0.25)',
  },
  {
    to:    '/admin/genres',
    Icon:  Tag,
    label: 'GENRES',
    desc:  'Manage genre categories used to classify films',
    color: '#8B5CF6',
    glow:  'rgba(139,92,246,0.15)',
    border:'rgba(139,92,246,0.25)',
  },
  {
    to:    '/admin/cast-members',
    Icon:  Users,
    label: 'CAST & CREW',
    desc:  'Add actors, directors, writers and other crew members',
    color: '#F59E0B',
    glow:  'rgba(245,158,11,0.15)',
    border:'rgba(245,158,11,0.25)',
  },
]

export default function AdminPanel() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="fixed inset-0 grid-bg opacity-15 pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-4 mb-10"
      >
        <motion.div
          animate={{ boxShadow: ['0 0 10px rgba(245,158,11,0.3)', '0 0 30px rgba(245,158,11,0.6)', '0 0 10px rgba(245,158,11,0.3)'] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}
        >
          <Shield size={22} className="text-amber-400" />
        </motion.div>
        <div>
          <h1 className="font-display text-2xl tracking-widest text-white">ADMIN CONTROL</h1>
          <p className="font-mono text-xs text-slate-600 tracking-widest mt-0.5">// SYSTEM MANAGEMENT CONSOLE</p>
        </div>
      </motion.div>

      {/* Status bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-3 p-4 rounded-xl mb-8"
        style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.1)' }}
      >
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-2 h-2 rounded-full bg-green-400"
          style={{ boxShadow: '0 0 8px rgba(74,222,128,0.8)' }}
        />
        <Activity size={13} className="text-green-400" />
        <span className="font-mono text-xs text-green-400 tracking-widest">SYSTEM ONLINE — ALL SERVICES OPERATIONAL</span>
      </motion.div>

      {/* Panel cards */}
      <div className="space-y-4">
        {PANELS.map(({ to, Icon, label, desc, color, glow, border }, i) => (
          <motion.div
            key={to}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link to={to}>
              <motion.div
                className="flex items-center gap-5 p-5 rounded-2xl cursor-pointer transition-all duration-300 group"
                style={{ background: 'rgba(11,15,26,0.7)', border: `1px solid rgba(255,255,255,0.05)` }}
                whileHover={{
                  background: glow,
                  borderColor: border,
                  boxShadow: `0 0 30px ${glow}`,
                  x: 4,
                }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: glow, border: `1px solid ${border}` }}
                >
                  <Icon size={24} style={{ color }} />
                </motion.div>

                <div className="flex-1">
                  <h3 className="font-display text-sm tracking-widest mb-1" style={{ color }}>
                    {label}
                  </h3>
                  <p className="text-slate-600 text-xs font-mono">{desc}</p>
                </div>

                <motion.div
                  className="flex-shrink-0"
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                >
                  <ChevronRight size={18} style={{ color }} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* HUD decoration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-10 p-4 rounded-xl font-mono text-xs text-slate-800 space-y-1"
        style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)' }}
      >
        <p>{'>'} LOGGED IN AS ADMIN</p>
        <p>{'>'} ACCESS LEVEL: FULL</p>
        <p className="text-slate-900">{'>'} USE RESPONSIBLY</p>
      </motion.div>
    </div>
  )
}
