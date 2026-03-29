import { motion } from 'framer-motion'

export default function CircularRating({ value = 0, max = 5, size = 80 }) {
  const radius      = (size - 10) / 2
  const circumference = 2 * Math.PI * radius
  const progress    = (value / max) * circumference
  const pct         = Math.round((value / max) * 100)

  const color = pct >= 80 ? '#06B6D4' : pct >= 60 ? '#8B5CF6' : pct >= 40 ? '#F59E0B' : '#F43F5E'

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background ring */}
      <svg width={size} height={size} className="absolute">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
      </svg>

      {/* Progress ring */}
      <svg width={size} height={size} className="absolute -rotate-90">
        <motion.circle
          cx={size/2} cy={size/2} r={radius}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>

      {/* Center value */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="flex flex-col items-center"
      >
        <span className="font-mono font-bold text-white" style={{ fontSize: size * 0.22, color }}>
          {value.toFixed(1)}
        </span>
        <span className="font-mono text-slate-600" style={{ fontSize: size * 0.12 }}>/{max}</span>
      </motion.div>
    </div>
  )
}
